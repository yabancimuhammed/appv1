#!/usr/bin/env node
// Provisionne l'infra d'une nouvelle app (phase 0 du build — voir .claude/agents/app-builder.md) :
// repo GitHub privé, projet Supabase, projet Vercel. IDEMPOTENT : relit toujours PROGRESS.md avant de
// créer quoi que ce soit — une ressource déjà notée là est réutilisée, jamais recréée.
//
// Usage : node scripts/create-app.mjs <nom-app> [--dir <dossier de l'app>]
//
// Nécessite dans .recette/secrets.env : GITHUB_TOKEN (ou `gh auth login` déjà fait),
// SUPABASE_ACCESS_TOKEN, VERCEL_TOKEN.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fetchWithRetry } from "./lib/retry.mjs";

const execFileAsync = promisify(execFile);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? ".";
const secretsPath = path.join(projectDir, ".recette", "secrets.env");

async function loadSecrets() {
  const raw = await readFile(secretsPath, "utf8").catch(() => "");
  const env = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function readProgress(appDir) {
  const p = path.join(appDir, "PROGRESS.md");
  return readFile(p, "utf8").catch(() => "");
}

function extractInfra(progressContent) {
  // Cherche des lignes du type "- repo: xxx", "- supabase-ref: xxx", "- vercel: xxx" sous "## 0. Infra"
  const repo = progressContent.match(/repo:\s*(\S+)/)?.[1];
  const supabaseRef = progressContent.match(/supabase-ref:\s*(\S+)/)?.[1];
  const vercelProject = progressContent.match(/vercel:\s*(\S+)/)?.[1];
  return { repo, supabaseRef, vercelProject };
}

async function createGithubRepo(name) {
  // Réutilise `gh` (déjà authentifié via /setup) plutôt que de réimplémenter l'API GitHub.
  const { stdout } = await execFileAsync("gh", [
    "repo", "create", name, "--private", "--confirm",
  ]);
  return stdout.trim();
}

async function createSupabaseProject(name, env) {
  const res = await fetchWithRetry(
    () =>
      fetch("https://api.supabase.com/v1/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          organization_id: env.SUPABASE_ORG_ID,
          region: env.SUPABASE_REGION ?? "eu-central-1",
          db_pass: env.SUPABASE_DB_PASSWORD ?? crypto.randomUUID(),
        }),
      }),
    { label: "création du projet Supabase" },
  );
  const data = await res.json();
  return data.id ?? data.ref;
}

async function createVercelProject(name, env) {
  const res = await fetchWithRetry(
    () =>
      fetch("https://api.vercel.com/v10/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      }),
    { label: "création du projet Vercel" },
  );
  const data = await res.json();
  return data.name ?? name;
}

async function main() {
  const [name, ...rest] = process.argv.slice(2);
  if (!name) {
    console.error("Usage: node scripts/create-app.mjs <nom-app> [--dir <dossier>]");
    process.exit(1);
  }
  const dirFlagIndex = rest.indexOf("--dir");
  const appDir = dirFlagIndex !== -1 ? rest[dirFlagIndex + 1] : ".";

  const env = await loadSecrets();
  const progress = await readProgress(appDir);
  const existing = extractInfra(progress);

  const result = { ...existing };

  if (existing.repo) {
    console.log(`✅ repo GitHub déjà noté dans PROGRESS.md : ${existing.repo} (réutilisé, pas recréé)`);
  } else {
    console.log(`→ création du repo GitHub privé "${name}"...`);
    result.repo = await createGithubRepo(name);
    console.log(`✅ repo créé : ${result.repo}`);
  }

  if (existing.supabaseRef) {
    console.log(`✅ projet Supabase déjà noté : ${existing.supabaseRef} (réutilisé, pas recréé — max 2 projets gratuits)`);
  } else if (env.SUPABASE_ACCESS_TOKEN) {
    console.log(`→ création du projet Supabase "${name}"...`);
    result.supabaseRef = await createSupabaseProject(name, env);
    console.log(`✅ projet Supabase créé : ${result.supabaseRef}`);
  } else {
    console.log("⚠️  SUPABASE_ACCESS_TOKEN manquant — /setup d'abord.");
  }

  if (existing.vercelProject) {
    console.log(`✅ projet Vercel déjà noté : ${existing.vercelProject} (réutilisé, pas recréé)`);
  } else if (env.VERCEL_TOKEN) {
    console.log(`→ création du projet Vercel "${name}"...`);
    result.vercelProject = await createVercelProject(name, env);
    console.log(`✅ projet Vercel créé : ${result.vercelProject}`);
  } else {
    console.log("⚠️  VERCEL_TOKEN manquant — /setup d'abord.");
  }

  await mkdir(appDir, { recursive: true });
  const infraBlock =
    `## 0. Infra\n- repo: ${result.repo ?? "TODO"}\n- supabase-ref: ${result.supabaseRef ?? "TODO"}\n- vercel: ${result.vercelProject ?? "TODO"}\n`;
  console.log("\nÀ écrire (ou vérifier) dans PROGRESS.md :\n" + infraBlock);
}

main().catch((err) => {
  console.error(`Erreur pendant le provisioning : ${err.message}`);
  process.exit(1);
});

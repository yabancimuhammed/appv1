#!/usr/bin/env node
// Vérifie les clés collées pendant /setup et /app-store : présence, format, et (avec --live) un vrai
// appel API minimal pour confirmer que la clé fonctionne. Lit .recette/secrets.env (jamais commité).
//
// Usage :
//   node scripts/verify-secrets.mjs            # vérifie tout ce qui est déjà dans secrets.env
//   node scripts/verify-secrets.mjs supabase    # vérifie un seul service
//   node scripts/verify-secrets.mjs --live      # ajoute un appel réseau minimal quand c'est possible

import "./lib/proxy-bootstrap.mjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fetchWithRetry, FatalHttpError } from "./lib/retry.mjs";

const SECRETS_PATH = path.join(process.env.CLAUDE_PROJECT_DIR ?? ".", ".recette", "secrets.env");

/** true = clé valide, false = rejetée par l'API (clé invalide), throw = erreur transitoire persistante. */
async function liveCheck(fn) {
  try {
    await fetchWithRetry(fn, { retries: 2, baseDelayMs: 400, label: "vérification live" });
    return true;
  } catch (err) {
    if (err instanceof FatalHttpError) return false;
    throw err;
  }
}

const SERVICES = {
  github: {
    vars: ["GITHUB_TOKEN"],
    // ghp_/ghs_ = classique, github_pat_ = fine-grained (le format recommandé par GitHub aujourd'hui).
    format: (v) => /^gh[ps]_[a-zA-Z0-9]{20,}$/.test(v) || /^github_pat_[a-zA-Z0-9_]{20,}$/.test(v),
    live: async (vars) =>
      liveCheck(() =>
        fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${vars.GITHUB_TOKEN}`, "User-Agent": "la-recette" },
        }),
      ),
  },
  supabase: {
    vars: ["SUPABASE_ACCESS_TOKEN"],
    format: (v) => /^sbp_[a-zA-Z0-9]{20,}$/.test(v),
    live: async (vars) =>
      liveCheck(() =>
        fetch("https://api.supabase.com/v1/projects", {
          headers: { Authorization: `Bearer ${vars.SUPABASE_ACCESS_TOKEN}` },
        }),
      ),
  },
  vercel: {
    vars: ["VERCEL_TOKEN"],
    format: (v) => v.length > 10,
    live: async (vars) =>
      liveCheck(() =>
        fetch("https://api.vercel.com/v2/user", {
          headers: { Authorization: `Bearer ${vars.VERCEL_TOKEN}` },
        }),
      ),
  },
  expo: {
    vars: ["EXPO_TOKEN"],
    format: (v) => v.length > 10,
    live: async (vars) =>
      liveCheck(() =>
        fetch("https://api.expo.dev/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vars.EXPO_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: "{ viewer { username } }" }),
        }).then((res) => {
          // Expo répond 200 même token invalide (erreurs GraphQL dans le body) — traite ça comme un rejet.
          if (!res.ok) return res;
          return res
            .clone()
            .json()
            .then((body) =>
              body?.data?.viewer?.username
                ? res
                : new Response(JSON.stringify(body), { status: 401 }),
            );
        }),
      ),
  },
  revenuecat: { vars: ["REVENUECAT_SECRET_KEY", "EXPO_PUBLIC_REVENUECAT_KEY"], format: (v) => v.length > 10 },
  openai: {
    vars: ["OPENAI_API_KEY"],
    format: (v) => /^sk-[a-zA-Z0-9]{20,}$/.test(v),
    live: async (vars) =>
      liveCheck(() =>
        fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${vars.OPENAI_API_KEY}` },
        }),
      ),
  },
  apple: { vars: ["APPLE_ASC_KEY_ID", "APPLE_ASC_ISSUER_ID", "APPLE_ASC_PRIVATE_KEY_PATH"], format: (v) => v.length > 3 },
};

async function loadSecrets() {
  let raw;
  try {
    raw = await readFile(SECRETS_PATH, "utf8");
  } catch {
    return {};
  }
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes("--live");
  const only = args.find((a) => !a.startsWith("--"));

  const env = await loadSecrets();
  const results = [];

  for (const [name, spec] of Object.entries(SERVICES)) {
    if (only && only !== name) continue;

    const present = spec.vars.every((v) => env[v]);
    if (!present) {
      results.push({ name, status: "manquant", detail: `variables attendues : ${spec.vars.join(", ")}` });
      continue;
    }

    const formatOk = spec.vars.every((v) => spec.format(env[v]));
    if (!formatOk) {
      results.push({ name, status: "format suspect", detail: "la valeur ne ressemble pas au format attendu" });
      continue;
    }

    if (live && spec.live) {
      try {
        const ok = await spec.live(env);
        results.push({ name, status: ok ? "vérifié (live)" : "rejeté par l'API", detail: "" });
      } catch (err) {
        results.push({ name, status: "erreur réseau", detail: String(err.message ?? err) });
      }
    } else {
      results.push({ name, status: "présent, format OK", detail: live ? "" : "(pas de check live pour ce service)" });
    }
  }

  for (const r of results) {
    const icon = r.status.startsWith("vérifié") || r.status.startsWith("présent") ? "✅" : "❌";
    console.log(`${icon} ${r.name.padEnd(12)} ${r.status}${r.detail ? " — " + r.detail : ""}`);
  }

  process.exit(
    results.some(
      (r) =>
        r.status.startsWith("manquant") ||
        r.status.startsWith("format") ||
        r.status.startsWith("rejeté") ||
        r.status.startsWith("erreur"),
    )
      ? 1
      : 0,
  );
}

main();

#!/usr/bin/env node
// Garde-fou secrets — hook PreToolUse (Bash|PowerShell), voir .claude/settings.json.
//
// Lit le payload JSON du hook sur stdin, regarde la commande sur le point d'être exécutée, et bloque
// (decision "block" sur stdout, exit 0 — c'est le protocole JSON des hooks, pas le code de sortie qui
// décide) toute commande qui risquerait de faire fuiter un secret : lire/afficher/committer
// .recette/secrets.env, une clé privée .p8, ou une valeur qui ressemble à une vraie clé secrète collée
// en dur dans une commande.
//
// Ne bloque JAMAIS un faux positif silencieusement : en cas de doute sur le payload lui-même (JSON
// invalide, champ manquant), on laisse passer plutôt que de casser le travail de l'utilisateur.

const SENSITIVE_PATHS = [
  /\.recette\/secrets\.env/,
  /(^|[^a-zA-Z0-9_])secrets\.env/,
  /\.p8(\s|$|['"])/,
  /\.mobileprovision(\s|$|['"])/,
  /\.keystore(\s|$|['"])/,
  /serviceAccountKey.*\.json/,
];

const SECRET_VALUE_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/, // clé OpenAI
  /sbp_[a-zA-Z0-9]{20,}/, // token Supabase
  /service_role["']?\s*[:=]\s*["']?ey[a-zA-Z0-9._-]{20,}/i, // JWT service_role Supabase
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
];

// Commandes qui liraient/afficheraient un chemin sensible pour de vrai (pas juste le mentionner).
const RISKY_VERBS = /^(cat|less|more|type|head|tail|echo|printf|cp|scp|curl|git add|git commit)\b/i;

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}

function allow() {
  process.exit(0);
}

const raw = await readStdin();
if (!raw.trim()) allow();

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  allow(); // payload illisible → on ne casse pas le flux, on laisse passer
}

const command = payload?.tool_input?.command ?? payload?.tool_input?.script ?? "";
if (!command || typeof command !== "string") allow();

for (const valuePattern of SECRET_VALUE_PATTERNS) {
  if (valuePattern.test(command)) {
    block(
      "Cette commande contient ce qui ressemble à une vraie clé secrète en clair. " +
        "Les clés tierces ne doivent jamais apparaître en dur dans une commande ou dans le code — " +
        "passe par .recette/secrets.env et une edge function côté serveur (voir skill supabase-backend).",
    );
  }
}

const touchesSensitivePath = SENSITIVE_PATHS.some((p) => p.test(command));
if (touchesSensitivePath && RISKY_VERBS.test(command.trim())) {
  block(
    "Cette commande lit, copie ou committerait un fichier de secrets (.recette/secrets.env, une clé .p8, " +
      "un keystore…). Ces fichiers ne doivent jamais être affichés dans le chat ni ajoutés à git — " +
      "ils sont dans .gitignore pour une raison.",
  );
}

allow();

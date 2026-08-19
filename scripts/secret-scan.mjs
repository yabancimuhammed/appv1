#!/usr/bin/env node
// Garde-fou secrets — hook PreToolUse (Bash|PowerShell), voir .claude/settings.json.
//
// Protocole des hooks Claude Code (voir docs officielles) : exit 2 = bloque l'exécution de l'outil,
// exit 0 = autorisé. On complète le blocage d'un JSON `hookSpecificOutput` sur stderr pour donner une
// raison lisible. IMPORTANT : n'importe quelle erreur INTERNE à ce script (payload illisible, bug) doit
// sortir en 0 (fail open) — un bug ici ne doit jamais bloquer tout Bash. Seul un blocage VOULU sort en 2.
// (`.claude/settings.json` appelle ce script SANS `|| exit 0` autour — un tel wrapper neutraliserait
// silencieusement tout `exit 2`, voir historique du fichier : c'était le bug initial, corrigé.)

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

// Commandes qui liraient/afficheraient/committeraient un chemin sensible pour de vrai (pas juste le
// mentionner en argument d'une autre commande, ex. `rm .recette/secrets.env` n'est pas une fuite).
const RISKY_VERBS = /^(cat|less|more|type|head|tail|echo|printf|cp|scp|curl|git add|git commit)\b/i;

// `cat >> secrets.env << 'EOF' ... EOF` ÉCRIT dans le fichier (cas normal pendant /setup — ranger une
// nouvelle clé) ; ça ne doit pas être confondu avec `cat secrets.env` qui l'AFFICHE. On distingue les
// deux : si le chemin sensible n'apparaît QUE comme cible d'une redirection d'écriture (`>`/`>>` juste
// avant), ce n'est pas une fuite.
const WRITE_REDIRECT_TARGET =
  />{1,2}\s*['"]?(\.recette\/secrets\.env|[^\s'"]*secrets\.env|[^\s'"]*\.p8|[^\s'"]*\.mobileprovision|[^\s'"]*\.keystore|[^\s'"]*serviceAccountKey[^\s'"]*\.json)/g;

function sensitivePathOnlyAppearsAsWriteTarget(command) {
  const writeTargets = [...command.matchAll(WRITE_REDIRECT_TARGET)].map((m) => m[1]);
  if (writeTargets.length === 0) return false;
  // Retire chaque occurrence "> <cible>" du texte, puis revérifie : s'il ne reste plus aucune mention
  // sensible, tout ce qu'on a vu était bien une cible d'écriture, pas une lecture.
  const withoutWriteTargets = command.replace(WRITE_REDIRECT_TARGET, "");
  return !SENSITIVE_PATHS.some((p) => p.test(withoutWriteTargets));
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function block(reason) {
  process.stderr.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(2);
}

function allow() {
  process.exit(0);
}

async function main() {
  const raw = await readStdin();
  if (!raw.trim()) return allow();

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return allow(); // payload illisible → on ne casse pas le flux, on laisse passer (fail open)
  }

  const command = payload?.tool_input?.command;
  if (!command || typeof command !== "string") return allow();

  for (const valuePattern of SECRET_VALUE_PATTERNS) {
    if (valuePattern.test(command)) {
      return block(
        "Cette commande contient ce qui ressemble à une vraie clé secrète en clair. " +
          "Les clés tierces ne doivent jamais apparaître en dur dans une commande ou dans le code — " +
          "passe par .recette/secrets.env et une edge function côté serveur (voir skill supabase-backend).",
      );
    }
  }

  const touchesSensitivePath = SENSITIVE_PATHS.some((p) => p.test(command));
  if (touchesSensitivePath && RISKY_VERBS.test(command.trim()) && !sensitivePathOnlyAppearsAsWriteTarget(command)) {
    return block(
      "Cette commande lit, copie ou committerait un fichier de secrets (.recette/secrets.env, une clé " +
        ".p8, un keystore…). Ces fichiers ne doivent jamais être affichés dans le chat ni ajoutés à git " +
        "— ils sont dans .gitignore pour une raison.",
    );
  }

  allow();
}

main().catch(() => allow()); // toute erreur imprévue du script = fail open, jamais un blocage aveugle

// Garantit que `fetch()` respecte HTTPS_PROXY/HTTP_PROXY quand ils sont définis.
//
// Le fetch natif de Node NE lit PAS ces variables par défaut — sans ce bootstrap, un script lancé
// derrière un proxy imposé (environnement d'entreprise, sandbox managée type Claude Code Web) tenterait
// silencieusement une connexion directe. Selon le réseau, ça donne soit une vraie erreur réseau, soit —
// pire — une réponse HTTP qui RESSEMBLE à un rejet de l'API (ex. 403) alors que c'est en réalité un
// filtrage réseau qui n'a rien à voir avec la validité de la clé testée. Ce bootstrap élimine cette
// ambiguïté en forçant le chemin proxy correct AVANT le premier appel réseau du script.
//
// À importer en tout premier, avant tout usage de fetch : `import "./lib/proxy-bootstrap.mjs";`
import { spawnSync } from "node:child_process";

const proxyIsSet =
  process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;

if (proxyIsSet && process.env.NODE_USE_ENV_PROXY !== "1" && !process.env.__LA_RECETTE_PROXY_REEXEC) {
  const result = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: "inherit",
    env: { ...process.env, NODE_USE_ENV_PROXY: "1", __LA_RECETTE_PROXY_REEXEC: "1" },
  });
  process.exit(result.status ?? 1);
}

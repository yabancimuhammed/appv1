// Helper de retry partagé — backoff exponentiel avec jitter, pour tous les appels réseau des scripts
// (create-app.mjs, verify-secrets.mjs --live, generate-assets.mjs si besoin plus tard).
//
// Ne retente QUE les erreurs transitoires (réseau, timeout, 429, 5xx). Une erreur d'auth (401/403) ou
// une erreur de requête (400/404/422) est fatale immédiatement — retenter une clé invalide ne la rend
// pas valide, ça ne fait que perdre du temps et masquer l'erreur réelle à l'utilisateur.

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export class FatalHttpError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}: ${body}`);
    this.status = status;
    this.fatal = true;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exécute `fn` (qui doit renvoyer une Response fetch, ou lever) avec retry en cas d'échec transitoire.
 * @param {() => Promise<Response>} fn
 * @param {{ retries?: number, baseDelayMs?: number, label?: string }} opts
 */
export async function fetchWithRetry(fn, opts = {}) {
  const { retries = 4, baseDelayMs = 500, label = "requête" } = opts;

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fn();

      if (res.ok) return res;

      const bodyText = await res.text().catch(() => "");
      if (!RETRYABLE_STATUS.has(res.status)) {
        throw new FatalHttpError(res.status, bodyText); // 4xx (hors 408/429) = fatal, pas de retry
      }
      lastError = new Error(`${label} : HTTP ${res.status} (tentative ${attempt + 1}/${retries + 1})`);
    } catch (err) {
      if (err instanceof FatalHttpError) throw err;
      lastError = err;
    }

    if (attempt < retries) {
      const delay = baseDelayMs * 2 ** attempt + Math.floor(Math.random() * 200);
      await sleep(delay);
    }
  }

  throw new Error(`${label} a échoué après ${retries + 1} tentatives : ${lastError?.message ?? lastError}`);
}

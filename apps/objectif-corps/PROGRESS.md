# PROGRESS — Objectif Corps

Lancé via `/launch`. Voir `APP-SPEC.md` pour le plan produit (verrouillé, GATE 1 passée).

## 0. Infra
- [ ] repo dédié: **bloqué dans cette session** — testé et confirmé sur 2 canaux différents :
      1) appel direct à l'API GitHub avec le token collé par le client → refusé par la politique réseau
         de cette session (seul `appv1` est dans le périmètre autorisé) ;
      2) outil GitHub officiel de la session (`create_repository`) → refusé aussi : "Resource not
         accessible by integration" (l'app GitHub installée sur cette session n'a pas la permission de
         créer un nouveau dépôt, seulement d'agir sur `appv1`).
      → Ce n'est pas un token invalide ni un bug corrigeable ici : c'est une limite structurelle de ce
      type de session ("Claude Code sur le web", scopée à un seul dépôt). La création réelle du dépôt
      dédié + son push se fera depuis un environnement sans cette restriction (Claude Code en local, voir
      GETTINGSTARTED.md, ou une session dont le périmètre GitHub a été élargi).
- [ ] supabase-ref: TODO — bloqué de la même façon (réseau non autorisé vers `api.supabase.com`).
- [ ] vercel: TODO — idem.
- **En attendant** : `apps/objectif-corps/` (dans `appv1`) sert de zone de travail. Tout le code
  s'écrit et se vérifie ici (npm/tsc fonctionnent, `registry.npmjs.org` n'est pas bloqué). À la reprise
  dans un environnement débloqué : créer le repo dédié, y transférer ce dossier, poursuivre l'infra.

## 1. Scaffold
- [ ] Projet Expo (SDK épinglé), navigation, thème clair/sombre, i18n FR/EN — voir skill `expo-ios-app`.

## 2. Backend
- [ ] Auth + RLS, migrations (archétypes `content-library` + `tracker-streak` composés), edge functions.

## 3. Features (cœur métier)
- [ ] Scanner un repas (photo → IA) + journal + conseils + suggestions de remplacement + progression.
- [ ] Smoke-test runtime (voir skill `app-core-patterns`) — pas coché tant que non testé en conditions réelles.

## 4. Paywall
- [ ] Entitlement/offering RevenueCat, écran paywall conforme, webhook `is_premium`.

## 5. Landing + légal
- [ ] Site Next.js, Politique de confidentialité **renforcée** (données de santé, disclaimer IA/pas un
      avis médical), Conditions.

## 6. Assets
- [ ] Icône, splash, screenshots.

## Notes / décisions
- **2026-08-19** — `/launch` lancé. Idée reçue, spec verrouillée en autonomie avec des choix par défaut
  raisonnables (modèle freemium, composition d'archétypes content-library + tracker-streak). Risque Apple
  (domaine santé/nutrition, guidelines 1.4.1 et 5.1.1) identifié et mitigations notées dans `APP-SPEC.md`.
  Étape Comptes démarrée : **GitHub ✅** (token fine-grained fourni, vérifié en live contre `GET /user`).
  Au passage, corrigé un bug de `verify-secrets.mjs` qui rejetait à tort les tokens fine-grained
  (`github_pat_...`, le format actuellement recommandé par GitHub — le script ne connaissait que l'ancien
  format `ghp_`).
  **Supabase** : token reçu, **format valide**, mais impossible de le vérifier en direct dans CETTE
  session cloud — `api.supabase.com` (et `api.vercel.com`, `api.openai.com`, `api.revenuecat.com`,
  `api.expo.dev`) sont bloqués par la politique réseau de cet environnement (confirmé : refus de la
  passerelle proxy, pas une erreur de clé). Seul `api.github.com` est autorisé ici. Corrigé au passage un
  vrai bug de fiabilité : le fetch natif de Node ignore `HTTPS_PROXY` par défaut, ce qui donnait un faux
  "rejeté par l'API" au lieu d'une vraie "erreur réseau" (scripts/lib/proxy-bootstrap.mjs). **Décision à
  prendre par le client** : continuer ici en acceptant que la vérification live et le build réel ne
  pourront pas se finir dans cette session, ou reprendre dans l'environnement Claude Code local (celui
  visé par GETTINGSTARTED.md, sans cette restriction réseau).

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
- [x] Projet Expo SDK 57 (épinglé `~57.0.14`), expo-router, thème clair/sombre réactif
      (`useThemeColors()`), i18n FR/EN (i18next), auth gate (`app/_layout.tsx` + `app/sign-in.tsx`),
      4 onglets (Journal/Scanner/Progression/Réglages). **Vérifié réellement** : `tsc --noEmit` ✅,
      `expo export --platform ios` ✅ (1200 modules, bundle iOS généré). Zéro secret dans le bundle
      (grep `EXPO_PUBLIC_` + clés en dur — vérifié, propre).
- [x] Bug généralisable trouvé et corrigé dans le produit (pas juste ici) : `tsconfig.json` doit exclure
      `supabase/functions/**` (code Deno, pas React Native) sinon `tsc --noEmit` échoue toujours dès
      qu'une app a une edge function — ajouté au skill `expo-ios-app`.
- Dépendances ajoutées au-delà de la liste du skill (au fil du scaffold réel) : `expo-linking`,
  `expo-constants` (peers requis par `expo-router`, non listés explicitement avant), `react-native-safe-area-context`,
  `react-native-screens`, `expo-image-picker`. À ajouter à la liste du skill `expo-ios-app`.

## 2. Backend
- [x] Migrations écrites (`meals` + `measurements`, RLS sur les deux) et edge functions écrites
      (`analyze-meal` avec garde-fous de sécurité dans le prompt, `delete-account` cloné de
      `templates/base`). **Pas encore appliquées** — nécessite le projet Supabase (bloqué, voir §0) et la
      CLI `supabase` pour `db push` + `functions deploy`, inatteignables dans cette session.

## 3. Features (cœur métier)
- [ ] **Code écrit** (Journal, Scanner avec photo→IA éditable, Progression) mais **PAS vérifié en
      conditions réelles** — smoke-test runtime impossible dans cette session (pas de backend Supabase
      appliqué, pas de clé OpenAI testable, pas de device Expo Go connecté à ce réseau). Compile et
      bundle (voir phase 1), mais "ça compile" ≠ "ça marche" (règle app-core-patterns §3) : ne pas
      considérer cette phase terminée avant le smoke-test réel une fois l'infra en place.

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
  "rejeté par l'API" au lieu d'une vraie "erreur réseau" (scripts/lib/proxy-bootstrap.mjs). **Décision
  prise par le client** : continuer ici quand même.
- **Vercel** : même situation que Supabase — token reçu, rangé, mais `api.vercel.com` bloqué ici
  (confirmé, correctement diagnostiqué "erreur réseau" grâce au correctif proxy — pas un faux rejet cette
  fois). Comptes restants pour cette app : Expo (fabrication), puis RevenueCat + OpenAI (l'app prévoit de
  l'IA et un abonnement).
- **Nouvelle session, retest** — le client a redonné la liste des 5 domaines nécessaires
  (`api.supabase.com`, `api.vercel.com`, `api.expo.dev`, `api.openai.com`, `api.revenuecat.com`). Retesté
  un par un via la passerelle proxy de cette session : **toujours refusés**, même diagnostic qu'avant
  ("gateway answered 403 to CONNECT (policy denial)" — un refus de politique réseau, pas un problème de
  clé). Ce n'est pas corrigeable depuis l'intérieur de la session : la politique réseau d'un environnement
  Claude Code sur le web se règle dans les paramètres de l'environnement, sur claude.ai (liste des domaines
  autorisés en sortie) — voir la doc officielle
  (https://code.claude.com/docs/en/claude-code-on-the-web). Prochaine action côté client : ajouter ces 5
  domaines à la liste blanche de l'environnement (ou passer sur un accès réseau plus large), puis relancer
  la session — je reprendrai la vérification des comptes immédiatement là où je me suis arrêté.

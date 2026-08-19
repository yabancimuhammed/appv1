# PROGRESS — Objectif Corps

Lancé via `/launch`. Voir `APP-SPEC.md` pour le plan produit (verrouillé, GATE 1 passée).

## 0. Infra
- [ ] repo: TODO (créé à cette phase, une fois GITHUB_TOKEN branché)
- [ ] supabase-ref: TODO
- [ ] vercel: TODO
- [ ] Ce dossier (`apps/objectif-corps/`) sert de zone de travail jusqu'à la création du repo dédié ;
      le contenu y sera poussé vers ce nouveau repo à ce moment-là (pas vers `appv1`, qui reste l'outil
      La Recette, jamais le code d'une app cliente).

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
  **Bloqué à l'étape Comptes** : `.recette/secrets.env` n'existe pas encore — aucun token disponible.
  Impossible de créer le repo/l'infra/le build tant que ça n'est pas fait. Prochaine action : `/setup`,
  compte par compte, en commençant par GitHub.

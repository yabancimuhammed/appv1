---
name: expo-ios-app
description: >
  Phase 1 du build (Scaffold) : comment monter le projet Expo/React Native — SDK épinglé, navigation,
  thème clair/sombre, i18n FR/EN, architecture en couches, sans chaîne en dur. Chargé par l'agent
  `app-builder` pendant la phase Scaffold.
---

# expo-ios-app — scaffold du projet

## Le piège n°1 : Expo Go vs build natif

**Expo Go** (l'app gratuite du Play/App Store) ne supporte que le JS/TS pur + les modules déjà inclus
dedans. Dès qu'un module natif custom est ajouté (ex. certains SDK de paiement, notifications avancées),
Expo Go ne suffit plus et il faut un **dev client** buildé. Décide dès le scaffold : si l'app a besoin
d'IAP (RevenueCat) et de push, prévois un **development build** (`expo-dev-client`) plutôt que de découvrir
le blocage en phase 4. Note ce choix dans `PROGRESS.md`.

## SDK épinglé

Fixe la version du SDK Expo dans `package.json` (`"expo": "~<version>"`) dès la création — ne laisse
jamais une plage ouverte qui pourrait upgrader silencieusement en cours de projet et casser un build EAS
plus tard.

```
npx create-expo-app@latest . --template
```

## Structure en couches (aucune chaîne en dur)

```
app/                  # écrans + routing (expo-router)
components/           # UI réutilisable
lib/
  supabase.ts         # client Supabase (URL + clé anon depuis les env, jamais en dur)
  api/                 # appels aux edge functions
hooks/                # logique réutilisable (état, data-fetching)
i18n/
  fr.json
  en.json
theme/
  colors.ts            # tokens clair/sombre — jamais une couleur en dur dans un composant
constants/
```

- Toute chaîne visible par l'utilisateur passe par `i18n/fr.json` + `i18n/en.json` (clés identiques dans
  les deux fichiers — vérifie qu'aucune clé ne manque d'un côté).
- Toute couleur passe par `theme/colors.ts`, avec une variante clair et une variante sombre.
- Toute URL/clé publique passe par une variable d'env (`EXPO_PUBLIC_SUPABASE_URL`, etc.), jamais en dur.

## Navigation

Utilise `expo-router` (routing par fichiers). Prévoit dès le départ : onglets principaux (dictés par
`APP-SPEC.md`), écran de connexion/inscription si auth, écran de paramètres (accès suppression de compte —
obligatoire si auth, guideline Apple 5.1.1v).

## Thème clair/sombre

Respecte le réglage système par défaut (`useColorScheme`), tokens dans `theme/colors.ts`. Teste visuellement
les deux modes avant de cocher la phase (pas de texte illisible dans un mode).

## Self-vérification de cette phase

- `tsc --noEmit` et `expo export --platform ios` passent.
- Navigation entre tous les onglets/écrans testée (pas d'écran blanc).
- Thème clair et sombre lisibles.
- Aucune chaîne ni couleur en dur (`grep` rapide sur des couleurs hex hors `theme/`).

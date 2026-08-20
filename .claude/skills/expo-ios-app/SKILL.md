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

### Piège tsconfig : exclure `supabase/functions/`

Les edge functions (Deno, jamais du code React Native) vivent dans `supabase/functions/` du même projet.
Sans exclusion, `tsc --noEmit` les inclut et échoue sur des erreurs qui n'ont rien à voir avec l'app
(`Cannot find name 'Deno'`, imports `jsr:...` non résolus) — **toujours** ajouter dès le scaffold :

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": { "strict": true },
  "exclude": ["node_modules", "supabase/functions/**"]
}
```

## Structure en couches (aucune chaîne en dur)

```
app/                  # écrans + routing (expo-router)
  (tabs)/
    settings.tsx      # copié depuis templates/base/ — suppression de compte obligatoire (5.1.1v)
components/           # UI réutilisable
lib/
  supabase.ts         # copié depuis templates/base/ — NE PAS réécrire à la main
  api/                 # appels aux edge functions
hooks/                # logique réutilisable (état, data-fetching)
i18n/
  index.ts             # copié depuis templates/base/ — config i18next, NE PAS réécrire à la main
  fr.json               # fusionné : clés de templates/base/i18n/fr.json + celles de l'archétype cloné
  en.json
theme/
  colors.ts            # copié depuis templates/base/ — contrat de tokens fixe, voir plus bas
constants/
```

### Ne pars jamais d'une page blanche — clone `templates/base/`

`$CLAUDE_PROJECT_DIR/templates/base/` contient les fichiers de fondation, déjà écrits et cohérents entre
eux, que **toute** app La Recette réutilise **telsquels** (pas de réécriture à la main, seule source
d'erreurs et de divergence entre apps) :

```
cp "$CLAUDE_PROJECT_DIR/templates/base/lib/supabase.ts"              lib/supabase.ts
cp "$CLAUDE_PROJECT_DIR/templates/base/theme/colors.ts"               theme/colors.ts
cp "$CLAUDE_PROJECT_DIR/templates/base/i18n/index.ts"                 i18n/index.ts
cp "$CLAUDE_PROJECT_DIR/templates/base/i18n/fr.json"                  i18n/fr.json
cp "$CLAUDE_PROJECT_DIR/templates/base/i18n/en.json"                  i18n/en.json
cp "$CLAUDE_PROJECT_DIR/templates/base/app/(tabs)/settings.tsx"       "app/(tabs)/settings.tsx"
cp "$CLAUDE_PROJECT_DIR/templates/base/supabase/functions/delete-account/index.ts" \
   supabase/functions/delete-account/index.ts
```

Puis, en phase Features (skill `app-core-patterns`), les clés i18n de l'archétype cloné sont **fusionnées**
dans `i18n/fr.json`/`i18n/en.json` (jamais remplacées) — un objet JSON plat qui regroupe les namespaces
`common`/`auth`/`settings` (base) et le namespace métier de l'archétype (ex. `items`, `library`).

### Dépendances npm exactes

```
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill \
  i18next react-i18next expo-localization expo-router expo-linking expo-constants \
  react-native-safe-area-context react-native-screens
```

`expo-linking`/`expo-constants`/`react-native-safe-area-context`/`react-native-screens` sont des
dépendances **requises** par `expo-router` dès le premier écran (sans elles, `expo export` échoue à la
résolution de module, pas seulement au runtime) — toujours les inclure dès le scaffold, pas seulement au
premier crash de bundle.

(+ `expo-dev-client` si le piège Expo Go ci-dessus s'applique, `react-native-purchases` en phase Paywall,
`expo-image-picker`/`expo-camera` si le cœur métier capture une photo — voir l'archétype concerné.)

**Si `npx expo install` échoue avec une erreur réseau** (ex. "HTTP Proxy Network Error" — la commande
interroge un service Expo de compatibilité en plus du registre npm) : retombe sur `npm install
<packages>` en plein, sans le wrapper `expo install`. Le registre npm (`registry.npmjs.org`) reste
joignable même quand d'autres services Expo/tiers ne le sont pas ; vérifie ensuite les versions installées
avec `tsc --noEmit` plutôt que de bloquer dessus.

**Si `npm install` échoue en `ERESOLVE`/peer dependency conflict** (vu de façon répétée avec
`expo-router` → `@expo/ui`/`vaul` → `@radix-ui/*`, un conflit de peer deps côté support web
d'`expo-router`, sans rapport avec le code iOS réel) : ajoute `--legacy-peer-deps` à la commande. Pas
besoin d'investiguer plus loin pour ce cas précis — `tsc --noEmit` derrière confirme que ça n'a rien cassé.

- Toute chaîne visible par l'utilisateur passe par les clés i18n (namespaces ci-dessus) — jamais de texte
  en dur dans un composant.
- Toute couleur passe par `useThemeColors()` (voir plus bas) — jamais une couleur en dur dans un composant.
- Toute URL/clé publique passe par une variable d'env (`EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`), jamais en dur.

## Navigation

Utilise `expo-router` (routing par fichiers). Prévoit dès le départ : onglets principaux (dictés par
`APP-SPEC.md`), écran de connexion/inscription si auth, l'écran `settings.tsx` cloné ci-dessus (accès
suppression de compte — obligatoire si auth, guideline Apple 5.1.1v).

## Thème clair/sombre — contrat de tokens fixe

`theme/colors.ts` (cloné depuis `templates/base/`) exporte un hook **`useThemeColors()`** qui renvoie,
réactivement selon `useColorScheme()`, un objet avec exactement ces clés — tout écran/archétype de La
Recette les consomme par ces noms, ne les renomme jamais :

```
background, surface, surfaceMuted, text, textMuted, border, accent, onAccent, error
```

Clés additives pour le design system "glass" (voir section dédiée plus bas), présentes par défaut dans
`templates/base/theme/colors.ts` :
```
backgroundGradient, accentSoft, glass, glassBorder, glassTint, gradientAccent
```

Dans un composant : `const colors = useThemeColors();` en tête de fonction, puis `colors.text`, etc. —
jamais l'export statique `colors` (fallback clair uniquement, réservé aux contextes hors composant React).
Teste visuellement les deux modes avant de cocher la phase (pas de texte illisible dans un mode).

## Design system premium "glass" — par défaut sur toute nouvelle app

Toute app La Recette démarre avec un look "verre dépoli" (glassmorphism) premium plutôt que des `View`
à fond plein — vérifié en conditions réelles sur Objectif Corps (typecheck + bundle iOS/web après refonte
complète de tous les écrans). Clone ces briques depuis `templates/base/components/` en même temps que le
reste du scaffold, elles consomment les clés additives de `theme/colors.ts` (`glass`, `glassBorder`,
`glassTint`, `backgroundGradient`, `accentSoft`, `gradientAccent`) :

```
cp -r "$CLAUDE_PROJECT_DIR/templates/base/components" components
```

- **`<ScreenBackground>`** — wrapper racine de chaque écran (fond dégradé doux via `expo-linear-gradient`),
  remplace `<View style={{ backgroundColor: colors.background }}>`.
- **`<GlassCard>`** — remplace toute `View` "carte" à fond plein : blur (`expo-blur`) + bordure translucide
  + coins arrondis généreux (24). C'est la brique la plus utilisée, sur tous les écrans.
- **`<BackdropOrbs>`** — bulles dégradées floues décoratives, posées derrière un header/hero (sign-in,
  paywall, accueil) pour la profondeur — purement CSS/SVG, aucun asset externe.
- **`<Chip>`** — bouton pilule sélectionnable (choix courts à choix unique : environnement, tags, etc.).
- **`components/illustrations/Avatar3D.tsx`** — illustration vectorielle (react-native-svg) : un orbe en
  verre dégradé + silhouette abstraite. **Toujours une illustration abstraite, jamais une photo ou un rendu
  réaliste d'un corps** — variantes `feminine`/`masculine`/`neutral` différenciées par un simple contour de
  coiffure, pas par une morphologie. Réutilisable pour tout avatar/hero illustré dont l'app a besoin.

Dépendances à installer dès le scaffold pour ce design system :
```
npx expo install expo-blur expo-linear-gradient react-native-svg @react-native-community/slider
```
(`@react-native-community/slider` sert dès qu'un réglage numérique borné a plus de sens en curseur qu'en
champ texte — objectif de poids, portion, etc.)

**Barre d'onglets flottante en verre** : `app/(tabs)/_layout.tsx` utilise `tabBarStyle: { position:
"absolute", ... }` + `tabBarBackground: () => <BlurView .../>` (iOS/web — sur Android, `BlurView` derrière
une tab bar absolue n'a pas de rendu fiable, fallback sur un fond plein `colors.surface`). Piège vérifié :
`position: "absolute"` fait passer la tab bar par-dessus le contenu — ajoute `paddingBottom: 110` (le double
de la hauteur de tab bar visible) au `contentContainerStyle` de chaque écran à onglets, sinon le dernier
élément de chaque liste reste caché derrière.

## Self-vérification de cette phase

- `tsc --noEmit` et `expo export --platform ios` passent.
- Navigation entre tous les onglets/écrans testée (pas d'écran blanc).
- Thème clair et sombre lisibles.
- Aucune chaîne ni couleur en dur (`grep` rapide sur des couleurs hex hors `theme/`).

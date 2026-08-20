---
name: revenuecat-subscriptions
description: >
  Phase 4 du build (Paywall) : entitlement, offering, écran paywall conforme (prix, durée, renouvellement,
  liens légaux, Restaurer les achats), webhook vers is_premium en vérité serveur. Chargé par l'agent
  `app-builder` en phase Paywall et par `/app-store` pour la mise en service réelle (GATE 2b).
---

# revenuecat-subscriptions — abonnements et paywall

## Piège Expo Go — `react-native-purchases` peut planter TOUTE l'app, pas juste le paywall

`react-native-purchases` est un module **natif**, absent d'Expo Go. Un import **statique** en tête de
fichier (`import Purchases from "react-native-purchases"`) exécute du code natif dès le chargement du
module — si ce fichier est importé par `app/_layout.tsx` (le cas courant : on synchronise l'identité
RevenueCat à la connexion), **toute l'app plante dans Expo Go**, pas seulement l'écran paywall, et souvent
pas au lancement mais juste après la connexion — le pire moment pour un smoke-test qui semblait pourtant
passer jusque-là.

**Toujours** :
1. Import **dynamique** (`await import("react-native-purchases")`), jamais statique, dans le module qui
   encapsule les appels RevenueCat (ex. `lib/purchases.ts`).
2. Détecte l'environnement AVANT d'importer quoi que ce soit :
   ```ts
   import Constants, { ExecutionEnvironment } from "expo-constants";
   const isExpoGo = () => Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
   ```
3. Dans Expo Go **et sur le web** (`Platform.OS === "web"` — RevenueCat n'existe pas non plus dans un
   navigateur), **no-op** silencieusement les fonctions d'identité/config (le reste de l'app doit rester
   utilisable), et sur l'écran paywall affiche un message clair (« abonnements indisponibles dans cet
   aperçu, disponibles sur TestFlight ») plutôt que de planter ou de laisser un écran vide.

⚠️ **Ce que la garde ci-dessus ne résout PAS, vérifié en conditions réelles avec une vraie EAS Update** :
une fois `react-native-purchases` dans les dépendances, **Expo Go refuse d'ouvrir la mise à jour**
(`AppLoaderTask encountered an unexpected error`), même canal/runtime corrects, même si le code ne
l'appelle jamais grâce à la garde — Expo Go vérifie l'empreinte des modules natifs avant de lancer le JS.
Pas de correctif possible côté code : dès que le paywall est construit, `/preview` en session cloud doit
basculer sur l'**export web** (voir `.claude/commands/preview.md` §2 — voie de secours) plutôt que
persister sur Expo Go.

## Ce qui se fait en phase Build (code, sans compte Apple)

- Intégration SDK RevenueCat (`react-native-purchases`), clé **publique** RevenueCat en
  `EXPO_PUBLIC_REVENUECAT_KEY` (c'est une clé conçue pour être publique, contrairement à une clé secrète).
- Un **entitlement** (ex. `premium`) et un **offering** (les plans proposés) configurés côté dashboard
  RevenueCat.
- **Écran paywall** affichant, sans exception (guideline Apple 3.1.2) :
  - le **prix** de chaque plan,
  - la **durée** (mensuel/annuel/etc.),
  - la mention explicite du **renouvellement automatique**,
  - un lien vers les **Conditions d'utilisation** et un lien vers la **Politique de confidentialité**,
  - un bouton **« Restaurer les achats »** visible et fonctionnel (obligatoire, guideline 3.1.1).
- **Webhook RevenueCat → Supabase** (edge function) qui met à jour `is_premium` en base à chaque événement
  d'achat/renouvellement/expiration. **`is_premium` est calculé côté serveur** (vérité serveur) — jamais
  déduit uniquement côté client (un client peut mentir/être modifié).

```ts
// squelette de check d'accès côté client — ne décide jamais localement, relit l'état serveur
const { data } = await supabase.from("profiles").select("is_premium").eq("id", userId).single();
```

## Ce qui NE se teste QUE sur un vrai build (GATE 2b, à `/app-store`)

- L'achat réel en sandbox (dans Expo Go, l'écran paywall affiche le message d'indisponibilité prévu — voir
  piège ci-dessus — jamais un vrai flux d'achat, ça n'existe que sur un build natif signé).
- Le webhook déclenché par un vrai événement App Store Connect.

Ne coche jamais ces points comme « prouvés » pendant `/build` — note-les « à valider sur TestFlight » dans
`PROGRESS.md`. C'est `/app-store` qui les ferme, avec les 2 produits d'abonnement créés dans App Store
Connect, liés à RevenueCat, et un achat sandbox réellement testé.

## Self-vérification (phase Build)

- Écran paywall visible, tous les éléments obligatoires présents (prix/durée/renouvellement/liens/restaurer).
- `is_premium` lu depuis la base (pas une variable locale non synchronisée).
- Edge function webhook déployée et son URL enregistrée côté RevenueCat.
- Rien de tout ça marqué « prouvé » pour l'achat réel — seulement « câblé, à valider sur TestFlight ».

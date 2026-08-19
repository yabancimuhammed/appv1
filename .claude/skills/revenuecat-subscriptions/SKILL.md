---
name: revenuecat-subscriptions
description: >
  Phase 4 du build (Paywall) : entitlement, offering, écran paywall conforme (prix, durée, renouvellement,
  liens légaux, Restaurer les achats), webhook vers is_premium en vérité serveur. Chargé par l'agent
  `app-builder` en phase Paywall et par `/app-store` pour la mise en service réelle (GATE 2b).
---

# revenuecat-subscriptions — abonnements et paywall

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

- L'achat réel en sandbox (le SDK RevenueCat fonctionne différemment en Expo Go qu'en build natif signé).
- Le webhook déclenché par un vrai événement App Store Connect.

Ne coche jamais ces points comme « prouvés » pendant `/build` — note-les « à valider sur TestFlight » dans
`PROGRESS.md`. C'est `/app-store` qui les ferme, avec les 2 produits d'abonnement créés dans App Store
Connect, liés à RevenueCat, et un achat sandbox réellement testé.

## Self-vérification (phase Build)

- Écran paywall visible, tous les éléments obligatoires présents (prix/durée/renouvellement/liens/restaurer).
- `is_premium` lu depuis la base (pas une variable locale non synchronisée).
- Edge function webhook déployée et son URL enregistrée côté RevenueCat.
- Rien de tout ça marqué « prouvé » pour l'achat réel — seulement « câblé, à valider sur TestFlight ».

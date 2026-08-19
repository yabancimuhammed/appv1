---
name: app-store-launch
description: >
  Les pièges éprouvés en production pour publier via EAS/App Store Connect : credentials non-interactifs
  (App Store Connect API Key .p8, app-specific password), TestFlight, ascAppId, App Privacy, export
  compliance. Chargé par /app-store.
---

# app-store-launch — les pièges de la publication

## Le piège central : le build EAS interactif

Le tout premier `eas build --platform ios` demande, par défaut, une **connexion Apple avec code 2FA dans
le terminal** pour générer certificat + provisioning profile. Un agent ne peut pas taper ce code (reçu sur
l'iPhone du client). Élimine l'interactivité **avant** de builder :

- **App Store Connect API Key** (`.p8`) — générée une fois par le client (*Users and Access → Integrations
  → App Store Connect API → Generate API Key*, rôle App Manager/Admin), donne `APPLE_ASC_KEY_ID`,
  `APPLE_ASC_ISSUER_ID`, `APPLE_ASC_PRIVATE_KEY_PATH` → exposés à EAS comme `EXPO_ASC_API_KEY_ID`,
  `EXPO_ASC_API_ISSUER_ID`, `EXPO_ASC_API_KEY_PATH`.
- **App-specific password** (générée sur appleid.apple.com) pour les endroits où une connexion Apple ID
  reste nécessaire malgré tout : `EXPO_APPLE_ID` + `EXPO_APPLE_APP_SPECIFIC_PASSWORD`.

Sans l'un de ces deux leviers posés, **ne lance jamais** une commande interactive que tu ne peux pas
compléter — passe la main clairement avec la commande exacte à coller (voir `.claude/commands/app-store.md`
§2.2).

## `eas.json` — les 3 profils

```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "autoIncrement": true }
  },
  "submit": {
    "production": { "ios": { "ascAppId": "<à remplir — ID numérique App Store Connect>" } }
  }
}
```

Piège : `ascAppId` est requis pour `eas submit` et n'existe qu'**après** la création de la fiche app dans
App Store Connect — crée-la (ou laisse EAS la générer au premier submit) avant de renseigner ce champ.

## TestFlight

- Après upload, attends *Ready to Test* dans l'onglet TestFlight d'App Store Connect.
- *Missing Compliance* → répondre chiffrement **No** (chiffrement standard iOS = exempté, cas courant sauf
  crypto custom).
- Le testeur doit **accepter l'invitation** par email avant de voir l'app — ce n'est pas un code à taper.

## App Privacy label + export compliance

Le label doit être **exact** vs ce que l'app collecte réellement (cohérent avec `/privacy` sur le site).
Sur-déclarer ou sous-déclarer sont tous deux des motifs de friction/rejet.

## Self-vérification avant de considérer GATE 2b close

Voir `definition-of-done` Partie C. Rien de tout ceci ne se coche sur supposition — chaque item exige une
preuve (capture, statut ASC, test réel).

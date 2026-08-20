---
description: Affiche un QR code Expo Go pour voir l'app sur son iPhone en ~2 minutes.
---

# /preview — voir l'app sur son iPhone

## 0. Constitution
Applique **recette-core**. C'est un moment gratifiant pour l'utilisateur — reste simple et positif.

## 1. Vérifier les prérequis
- Le projet Expo doit exister (au moins la phase Scaffold faite). Si non, redirige vers `/build`.
- Rappelle en une phrase, si ce n'est pas déjà fait : installer l'app gratuite **Expo Go** depuis l'App
  Store sur son iPhone.

## 2. Détecter l'environnement — local ou session cloud

**Si Claude Code tourne en local** (sur l'ordinateur du client, cas normal du produit — voir
GETTINGSTARTED.md) :
```
npx expo start
```
Le terminal affiche un QR code. Explique en une phrase : « Ouvre l'appareil photo de ton iPhone, vise ce
QR code, appuie sur la notification qui apparaît — ton app va s'ouvrir. »

**Si Claude Code tourne dans une session cloud** (le dossier n'est pas sur la machine du client — ex.
Claude Code sur le web) : `expo start` est **inutilisable tel quel** — son serveur tourne dans le
container, pas sur le réseau local du client, donc son iPhone ne peut pas l'atteindre (pas de tunnel
fiable non plus : ngrok n'est généralement pas dans la liste blanche réseau de ces sessions). Utilise à la
place **EAS Update**, qui publie le bundle sur les serveurs Expo — le téléphone le télécharge depuis
n'importe quel réseau, sans dépendre de cette session :
```
npx eas-cli@latest init --non-interactive --force              # une fois : lie le projet EAS
npx eas-cli@latest update:configure --non-interactive           # une fois : installe/configure expo-updates
npx eas-cli@latest channel:create preview --non-interactive     # une fois : le canal doit exister, "eas update --branch" seul ne le crée PAS
npx eas-cli@latest update --branch preview --environment preview --message "<résumé du changement>"
```
(`expo-updates` peut échouer à s'auto-installer avec le même conflit de peer deps que d'habitude — voir
skill `expo-ios-app` : `npm install expo-updates --legacy-peer-deps` en secours.)

⚠️ **Deux pièges vérifiés en conditions réelles, tous deux invisibles tant qu'on n'a pas essayé d'ouvrir le
lien pour de vrai** :
1. **`eas update --branch preview` ne crée PAS automatiquement de canal du même nom.** Sans canal, le lien
   `exp://u.expo.dev/...?channel-name=preview` renvoie une 404 côté Expo Go ("There is no channel named
   preview"). Il faut créer le canal explicitement une fois (`eas channel:create preview`, voir ci-dessus)
   — il se lie alors à la branche existante du même nom.
2. **`app.json` doit utiliser `"runtimeVersion": { "policy": "sdkVersion" }`, jamais `"appVersion"`, pour
   qu'Expo Go puisse ouvrir la mise à jour.** `"appVersion"` publie sous un runtime du type `"1.0.0"` (le
   numéro de version de l'app) ; Expo Go, lui, s'identifie toujours avec son propre SDK (`exposdk:57.0.0`,
   par ex.) — ces deux runtimes ne matchent jamais, et le canal reste introuvable même une fois créé. Vérifie
   après publication que le résumé de `eas update` affiche bien `Runtime version    exposdk:<version>` —
   sinon la policy est encore mal réglée.

⚠️ **Piège vérifié en conditions réelles : ne donne JAMAIS le lien `https://expo.dev/accounts/.../updates/<id>`
affiché dans le résumé de la commande.** C'est le tableau de bord humain — il exige une connexion à un
compte Expo (redirection 307 vers une page de login), que le client n'a pas de raison d'avoir. Le
client se retrouve bloqué sur un écran de connexion sans comprendre pourquoi.

Le **bon lien**, celui qu'Expo Go ouvre directement sans aucune connexion, se construit à la main à partir
du `projectId` (dans `app.json` → `expo.extra.eas.projectId`, ou affiché par `eas init`) et du nom de
branche/channel publié :
```
exp://u.expo.dev/<projectId>?channel-name=<branche>
```
C'est **ce lien-là** que tu donnes au client — à coller dans Safari (barre d'adresse) ou dans Notes sur
son iPhone, puis à ouvrir : ça propose directement Expo Go, sans étape intermédiaire. Republier après
chaque changement de code reprend juste la commande `eas update` (pas besoin de relier le projet à
nouveau, ni de renvoyer un nouveau lien — le même lien `exp://` sert à toutes les mises à jour de ce
channel).

Si un module natif custom empêche Expo Go de fonctionner (voir skill `expo-ios-app` — piège dev client),
dis-le clairement et propose la voie de secours (`npx expo start --dev-client` avec un dev build déjà
installé, ou explique qu'il faut d'abord un build EAS de développement).

## 3. Le QR code (local) / le lien (session cloud)
En local, guide-le sur le scan (voir ci-dessus). En session cloud, donne le lien **`exp://u.expo.dev/...`**
(jamais le lien `https://expo.dev/accounts/...`, voir piège ci-dessus) et explique en une phrase : « Colle
ce lien dans Safari sur ton iPhone et ouvre-le — ça va proposer Expo Go directement. »

## 4. Guider le test
Propose-lui de parcourir l'app (le moment magique en particulier). S'il repère un souci, note-le et
propose `/fix`.

## 5. Refermer proprement
Le serveur reste actif tant qu'il regarde l'app ; explique que fermer le terminal arrête l'aperçu (sans
rien casser côté code).

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
npx eas-cli@latest init --non-interactive --force            # une fois : lie le projet EAS
npx eas-cli@latest update:configure --non-interactive         # une fois : installe/configure expo-updates
npx eas-cli@latest update --branch preview --environment preview --message "<résumé du changement>"
```
(`expo-updates` peut échouer à s'auto-installer avec le même conflit de peer deps que d'habitude — voir
skill `expo-ios-app` : `npm install expo-updates --legacy-peer-deps` en secours.)
La commande affiche un lien **EAS Dashboard** (`https://expo.dev/accounts/<compte>/projects/<app>/updates/<id>`).
C'est ce lien que tu donnes au client — ouvert sur son iPhone (Safari), il propose d'ouvrir l'app dans
Expo Go. Republier après chaque changement de code reprend juste la commande `eas update` (pas besoin de
relier le projet à nouveau).

Si un module natif custom empêche Expo Go de fonctionner (voir skill `expo-ios-app` — piège dev client),
dis-le clairement et propose la voie de secours (`npx expo start --dev-client` avec un dev build déjà
installé, ou explique qu'il faut d'abord un build EAS de développement).

## 3. Le QR code (local) / le lien (session cloud)
En local, guide-le sur le scan (voir ci-dessus). En session cloud, donne le lien EAS Dashboard et
explique en une phrase : « Ouvre ce lien sur ton iPhone, appuie sur le bouton pour l'ouvrir dans Expo Go. »

## 4. Guider le test
Propose-lui de parcourir l'app (le moment magique en particulier). S'il repère un souci, note-le et
propose `/fix`.

## 5. Refermer proprement
Le serveur reste actif tant qu'il regarde l'app ; explique que fermer le terminal arrête l'aperçu (sans
rien casser côté code).

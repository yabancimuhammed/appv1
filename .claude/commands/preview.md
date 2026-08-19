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

## 2. Lancer le serveur de développement
```
npx expo start
```
Si un module natif custom empêche Expo Go de fonctionner (voir skill `expo-ios-app` — piège dev client),
dis-le clairement et propose la voie de secours (`npx expo start --dev-client` avec un dev build déjà
installé, ou explique qu'il faut d'abord un build EAS de développement).

## 3. Le QR code
Le terminal affiche un QR code. Explique en une phrase : « Ouvre l'appareil photo de ton iPhone, vise ce
QR code, appuie sur la notification qui apparaît — ton app va s'ouvrir. »

## 4. Guider le test
Propose-lui de parcourir l'app (le moment magique en particulier). S'il repère un souci, note-le et
propose `/fix`.

## 5. Refermer proprement
Le serveur reste actif tant qu'il regarde l'app ; explique que fermer le terminal arrête l'aperçu (sans
rien casser côté code).

---
description: Ajoute ou modifie une fonctionnalité sur une app déjà construite.
argument-hint: "\"ce qui doit changer ou être ajouté\""
---

# /update — faire évoluer l'app

Pour une app déjà passée par `/build` au moins une fois (par opposition à `/new`, qui part de zéro).

## 0. Constitution
Applique **recette-core**.

## 1. Comprendre la demande
Clarifie ce qui doit changer avec 1-2 questions simples si besoin. Vérifie si ça touche le moment magique
(cœur métier, skill `app-core-patterns`) ou une feature périphérique — l'exigence de preuve (smoke-test)
est plus stricte pour le premier.

## 2. Mettre à jour APP-SPEC.md
Ajoute/modifie la section concernée de `APP-SPEC.md` **avant** de coder, pour que la spec reste la source
de vérité (comme après `/new`).

## 3. Implémenter
Code le changement en respectant l'architecture existante (skills `expo-ios-app`, `supabase-backend`,
`app-core-patterns` selon ce qui est touché). RLS, i18n FR+EN, thème clair/sombre : jamais oubliés même
pour un petit ajout.

## 4. Vérifier
`tsc --noEmit` + `expo export --platform ios`. Si le cœur métier est touché : smoke-test runtime via
`/preview` comme en phase Features (voir `app-core-patterns`).

## 5. Rapporter et proposer la suite
Une phrase claire sur ce qui a changé. Si l'app était déjà publiée : rappelle qu'un nouveau build/soumission
sera nécessaire pour que ça arrive sur l'App Store (propose `/app-store` quand il est prêt).

---
description: Change le style visuel de l'app (couleurs, icône, ton) sans toucher aux fonctionnalités.
argument-hint: "\"ce qui doit changer\" (optionnel — peut aussi être décrit en discussion)"
---

# /ui — ajuster le style

## 0. Constitution
Applique **recette-core**. C'est une demande produit, pas technique — traduis toujours sa préférence
(« plus sobre », « plus fun », « je veux du bleu ») en changements concrets, jamais l'inverse.

## 1. Comprendre la demande
Si vague, montre 2-3 options concrètes (ex. 2-3 palettes) plutôt que de demander une description technique
qu'il ne saurait pas donner.

## 2. Appliquer
Modifie uniquement `theme/colors.ts`, les assets (icône/splash via skill `assets`), ou les textes concernés
— jamais la logique/les fonctionnalités sans qu'il l'ait demandé. Respecte le clair **et** le sombre.

## 3. Vérifier
`tsc --noEmit` + `expo export --platform ios` passent. Propose `/preview` pour qu'il juge sur pièce.

## 4. Rapporter
Une phrase : ce qui a changé, comment aller voir. Note le changement dans `PROGRESS.md` si notable.

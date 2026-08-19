---
description: Corrige un bug décrit par l'utilisateur, sans jamais lui montrer d'erreur brute.
argument-hint: "\"ce qui ne marche pas\" (optionnel — peut aussi être décrit en discussion)"
---

# /fix — corriger un bug

## 0. Constitution
Applique **recette-core** — en particulier « jamais de mur d'erreur » : rassure d'abord, jamais de
stacktrace brute affichée.

## 1. Reproduire
Comprends précisément le parcours qui casse (quel écran, quelle action, quel résultat attendu vs obtenu).
Si besoin, lance `/preview` toi-même ou demande une capture d'écran.

## 2. Diagnostiquer
Consulte le skill **doctor** (base de pannes) en premier — beaucoup de cas sont déjà connus. Sinon,
inspecte le code concerné (`Grep`/`Read`) pour trouver la cause réelle, pas un symptôme.

## 3. Corriger
Corrige la cause. Vérifie que la correction ne casse pas les phases déjà prouvées (`tsc --noEmit`,
`expo export --platform ios`, et un smoke-test manuel du parcours concerné si c'est le cœur métier).

## 4. Rapporter
Une phrase claire : ce qui n'allait pas (en langage humain), ce qui a été corrigé, comment vérifier
(`/preview`). Si le cas n'était pas dans la base de pannes, ajoute-le au skill `doctor` pour la prochaine
fois.

## 5. Si vraiment bloqué
Ne boucle jamais indéfiniment. Après quelques tentatives sans succès : stop propre, explique simplement ce
qui coince, donne la seule prochaine action (souvent une info que seul l'utilisateur peut fournir, ex. un
compte de test qui reproduit le souci).

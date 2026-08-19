---
description: Gère un rejet Apple — traduit le message, corrige ce qui s'automatise, guide pour le reste, resoumet.
argument-hint: "colle ici le message de rejet reçu d'Apple"
---

# /rejected — Apple a refusé l'app

## 0. Constitution
Applique **recette-core**. Un rejet fait peur à un débutant — rassure immédiatement : c'est **normal et
courant**, pas un échec, et souvent réglé en quelques heures.

## 1. Traduire le message
Le message d'Apple (souvent en anglais, avec des références de guideline) est traduit et reformulé en
une explication humaine : quoi, pourquoi, et à quel point c'est réglable.

## 2. Identifier la guideline concernée
Croise avec le skill **definition-of-done** (Partie B) pour situer précisément le point bloquant. Si le
motif touche une zone qui bouge souvent (IA, abonnements, suppression de compte), vérifie la version live
des guidelines (`WebFetch` sur `https://developer.apple.com/app-store/review/guidelines/`).

## 3. Corriger ce qui s'automatise
Répare le code/contenu concerné toi-même (ex. bouton Restaurer manquant, lien légal cassé, métadonnées
inexactes). Si le motif exige un choix produit ou une info que seul le client peut donner (ex. un compte
démo qui ne marche plus), demande précisément cette seule chose.

## 4. Revalider avant de resoumettre
Relance l'agent **`auditor`** sur le point corrigé (au minimum) pour ne pas resoumettre sur une correction
non prouvée — un deuxième rejet coûte plus cher en délai qu'une vérification.

## 5. Resoumettre
Reprends `/app-store` à l'étape concernée (souvent §4-5 : mise à jour de la fiche puis resoumission). Même
règle de confirmation que la première fois : c'est irréversible une fois envoyé.

## 6. Rapporter
Explique en une phrase ce qui a été corrigé et que l'app repart en review. Rappelle le délai typique.

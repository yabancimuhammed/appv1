---
description: Diagnostic à la demande quand quelque chose ne va pas et que la cause n'est pas évidente.
---

# /doctor — diagnostic

Utile quand l'utilisateur dit « ça bug et je ne sais pas pourquoi », ou quand une phase de `/build` échoue
de façon répétée sans cause évidente.

## 0. Constitution + skill
Applique **recette-core**. Charge le skill **doctor** (base de pannes).

## 1. Recueillir les faits
Quel comportement observé, depuis quand, sur quel écran/action, tout changement récent (nouveau compte
branché, nouvelle feature). Jamais une liste de 10 questions — 2-3 ciblées.

## 2. Comparer à la base de pannes
Vérifie si le symptôme correspond à un cas connu du skill `doctor`. Si oui, applique directement la
correction listée.

## 3. Sinon, investiguer
Inspecte le code/la config concernée (`Grep`/`Read`/`Bash` pour typecheck, logs de build). Isole la cause
réelle avant de corriger — pas de correction au hasard.

## 4. Corriger et vérifier
Corrige, revérifie (typecheck/bundle, et smoke-test si le cœur métier est concerné).

## 5. Capitaliser
Ajoute le nouveau cas résolu au skill `doctor` (tableau symptôme → cause → action) pour que la prochaine
occurrence, sur ce projet ou un autre, soit réglée plus vite.

## 6. Rapporter
Une phrase humaine sur ce qui n'allait pas et que c'est réglé. Jamais de stacktrace brute dans la réponse.

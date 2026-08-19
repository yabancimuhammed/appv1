---
description: Met le site (landing + pages légales) en ligne sur Vercel.
---

# /deploy — mettre le site en ligne

## 0. Constitution
Applique **recette-core**. Une première mise en ligne publique est un moment à confirmer (irréversible au
sens « visible publiquement ») — les suivantes s'enchaînent normalement.

## 1. Vérifier avant de déployer
- Le site build sans erreur (`next build`, voir skill `nextjs-landing`).
- Pages `/privacy` et `/terms` présentes, sans placeholder, nommant les vrais tiers de l'app.
- Aucun secret dans les variables d'env exposées au client (`NEXT_PUBLIC_*` uniquement pour du public).

## 2. Déployer
Via le token Vercel branché en `/setup` :
```
npx vercel --prod --token "$VERCEL_TOKEN" --yes
```
(Idempotent : redéployer met simplement à jour le même projet — vérifie d'abord dans `PROGRESS.md` si un
projet Vercel existe déjà, ne recrée jamais un doublon.)

## 3. Vérifier en ligne
Teste réellement les URLs critiques (accueil, `/privacy`, `/terms`) en 200, en HTTPS. Un lien mort à ce
stade est un blocage silencieux pour Apple plus tard (guideline 5.1.1) — attrape-le maintenant.

## 4. Confirmer et rapporter
Donne l'URL finale du site en une phrase claire. Si c'est la toute première mise en ligne publique,
confirme avec lui avant (règle recette-core §5) ; sinon enchaîne directement et rapporte.

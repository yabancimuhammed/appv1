---
description: Branche les comptes (gratuits) nécessaires — un par un, guidé, vérifié — et range les clés en sécurité.
---

# /setup — brancher les comptes

La Recette a besoin d'« accès » pour agir à la place de l'utilisateur. Chaque service est demandé **un par
un**, avec l'URL exacte où aller, et **vérifié** avant de passer au suivant.

## 0. Constitution
Applique **recette-core**. Une clé = un mot de passe : rappelle-le une fois, sans être lourd.

## 1. Le noyau (obligatoire)

| Service | Sert à | Où obtenir | Prix |
|---|---|---|---|
| GitHub | Sauver le code | connexion via `gh auth login` (tu ouvres le navigateur) | Gratuit |
| Supabase | Base de données + connexion | supabase.com → Account → Access Tokens | Gratuit |
| Vercel | Héberger le site | vercel.com → Settings → Tokens | Gratuit |
| Expo | Fabriquer l'app | expo.dev/settings/access-tokens | Gratuit |

## 2. Selon l'app (voir APP-SPEC.md)
- **RevenueCat** (si abonnement) — app.revenuecat.com → projet → API keys. Gratuit.
- **OpenAI** (si IA) — platform.openai.com/api-keys. À l'usage (prévenir avant toute dépense réelle).

## 3. Pour chacun, dans l'ordre
1. Dis en une phrase à quoi sert ce service (zéro jargon).
2. Donne l'URL exacte et les clics précis pour obtenir la clé/le token.
3. Demande de coller la valeur.
4. **Vérifie immédiatement** (appel API minimal, ex. lister les projets Supabase) — ne stocke jamais une
   clé non vérifiée sans le dire.
5. Range-la dans `.recette/secrets.env` (jamais ailleurs, jamais commitée — voir `.gitignore`).
6. Passe au suivant.

Utilise `scripts/verify-secrets.mjs` pour vérifier chaque clé au fur et à mesure plutôt que d'attendre la
fin.

## 4. Récapitulatif
Une fois tous les comptes du périmètre requis branchés, affiche un tableau simple (✅/❌ par service) — la
« carte tout verte » promise. S'il reste un ❌, dis lequel et pourquoi, jamais de faux vert.

## 5. Enchaîner
Propose `/build` si `APP-SPEC.md` est déjà verrouillé, sinon `/new`.

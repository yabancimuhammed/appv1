---
description: Audite et améliore le référencement du site (Google + citations IA).
---

# /seo — être trouvé

## 0. Constitution + skill
Applique **recette-core**, charge le skill **seo-geo**.

## 1. Audit
Balaie le site (`Grep`/`Glob` sur `app/` et `content/blog/`) :
- Titres/descriptions manquants ou dupliqués entre pages.
- `sitemap.xml`/`robots.txt` à jour avec toutes les pages publiées.
- Articles sans `AnswerBlock` ou sans section FAQ.
- Maillage interne : articles orphelins (aucun lien entrant/sortant).

## 2. Corriger ce qui s'automatise
Complète les métadonnées manquantes, régénère le sitemap, ajoute `AnswerBlock`/FAQ manquants aux articles
existants — sans changer le fond du contenu déjà publié sans lui demander.

## 3. Rapporter simplement
Une phrase sur ce qui a été corrigé, et — s'il reste des décisions qui lui appartiennent (ex. changer un
titre déjà public) — pose la question précise plutôt que de trancher seul.

## 4. Enchaîner
Propose `/blog "sujet"` si le site manque encore de contenu (moins de ~10 articles, voir promesse initiale
du guide de démarrage).

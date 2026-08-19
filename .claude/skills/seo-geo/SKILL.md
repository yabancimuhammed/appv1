---
name: seo-geo
description: >
  Règles de référencement classique (SEO — Google) et de citation par les IA (GEO — ChatGPT, Google AI,
  Bing Copilot) pour la landing d'une app La Recette. Chargé par /seo et par auto-blog.
---

# seo-geo — être trouvé par Google, être cité par les IA

## SEO classique

- **Un `title` et une `description` uniques par page**, sans duplication entre pages.
- Une seule structure `H1` par page, hiérarchie `H2`/`H3` cohérente (pas de niveau sauté).
- `sitemap.xml` et `robots.txt` à jour, incluant toutes les pages de blog.
- Maillage interne : chaque article de blog lie vers la landing/l'app et vers 1-2 autres articles proches
  (jamais orphelin).
- Image `og:image` par page (au moins sur l'accueil et chaque article) pour un partage propre.
- Temps de chargement : pas d'images non compressées, pas de police bloquante.

## GEO — se faire citer par les IA

Les moteurs IA (ChatGPT, Google AI Overviews, Bing Copilot) citent des passages **auto-suffisants et
directement copiables**, pas des intros vagues. Deux mécanismes à poser sur chaque page/article pertinent :

- **AnswerBlock** : un paragraphe de 2-3 phrases en tête d'article qui répond **directement** à la question
  du titre, sans avoir besoin du reste du texte pour être compris.
- **FAQ en frontmatter** → génère automatiquement un schéma structuré `FAQPage` (JSON-LD). Les IA scannent
  ces schémas en priorité pour extraire des réponses courtes.

## `llms.txt`

Fichier à la racine du site (`public/llms.txt`) qui liste, en clair, les pages/articles clés avec une
ligne de description chacun — sert d'index simplifié pour les crawlers IA. Mets-le à jour à chaque nouvel
article publié (`/blog`).

## Audit `/seo`

Quand cette commande est lancée sur un site existant :
1. Vérifie titres/descriptions dupliqués ou manquants (`Grep` sur les fichiers de pages).
2. Vérifie que `sitemap.xml`/`robots.txt` référencent bien toutes les pages publiées.
3. Vérifie qu'un `AnswerBlock` + une `FAQ` existent sur les articles qui n'en ont pas encore.
4. Corrige ce qui peut l'être directement (titres manquants, maillage cassé) ; signale en une phrase ce
   qui reste à décider par le client (ex. changer un nom de domaine).

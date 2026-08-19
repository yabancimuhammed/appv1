---
name: auto-blog
description: >
  Rédaction d'articles de blog bilingues (FR/EN) pour la landing d'une app La Recette : un article = une
  intention de recherche, structure SEO propre, contenu humain d'abord. Chargé par /blog.
---

# auto-blog — écrire un article utile

## Principe

**Un article = une question précise** que de vraies personnes tapent dans un moteur de recherche, en lien
avec le domaine de l'app (ex. pour une app de suivi d'entraînements : « combien de temps pour voir des
résultats en musculation »). Écris pour répondre à un humain d'abord — l'optimisation vient en structurant
cette réponse, pas en la diluant.

## Structure d'un article

```mdx
---
title: "..."
description: "..."   # meta description, ~150-160 caractères, accrocheuse
date: "YYYY-MM-DD"
slug: "..."
tags: ["..."]
---

<AnswerBlock>
Réponse directe en 2-3 phrases, citable telle quelle par une IA — pas d'intro qui tourne autour du pot.
</AnswerBlock>

## Introduction courte (le problème que vit le lecteur)

## Corps (H2/H3 propres, un sous-sujet par section)

## FAQ
(3-5 questions proches, réponses courtes — génère le schéma FAQPage automatiquement depuis cette section)

## Conclusion + lien vers l'app / une page pertinente de la landing
```

## Bilingue — pas une traduction mot à mot

Écris la version EN et la version FR comme deux articles **équivalents dans le fond**, pas une traduction
automatique maladroite l'une de l'autre : les exemples, l'accroche, peuvent différer légèrement pour sonner
naturel dans chaque langue.

## Emplacement

`content/blog/en/<slug>.mdx` et `content/blog/fr/<slug>.mdx` (voir skill `nextjs-landing`). Relie l'article
au `llms.txt` / à l'index du blog du site.

## Avant de publier

- Les deux langues existent, mêmes sections, liens internes valides.
- Pas de placeholder/lorem, pas de titre dupliqué avec un article existant (vérifie via `Glob` sur
  `content/blog/`).
- Le site build sans erreur avec le nouvel article.

Voir le skill **seo-geo** pour le détail des règles de citation par les IA (AnswerBlock, FAQ schema, maillage).

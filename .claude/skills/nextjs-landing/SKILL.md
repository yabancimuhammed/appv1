---
name: nextjs-landing
description: >
  Phase 5 du build (Landing + légal) : site de présentation Next.js, SEO/GEO, pages légales obligatoires
  (Politique de confidentialité, Conditions) nommant les tiers utilisés — bloquant pour la review Apple.
  Chargé par l'agent `app-builder` en phase Landing, et par /deploy, /blog, /seo.
---

# nextjs-landing — le site qui accompagne l'app

## Structure minimale

```
app/
  page.tsx               # accueil : proposition de valeur + capture d'écran + lien App Store
  privacy/page.tsx        # Politique de confidentialité
  terms/page.tsx           # Conditions d'utilisation
  blog/
    [lang]/[slug]/page.tsx
content/
  blog/
    en/*.mdx
    fr/*.mdx
public/
  llms.txt                # index simple du contenu, pour les IA qui crawlent
```

## Pages légales — bloquantes pour Apple

Guideline 5.1.1 : la politique de confidentialité doit être **en ligne, en HTTPS, et nommer explicitement
chaque tiers** qui traite des données (ex. « Nous utilisons Supabase pour stocker vos données de compte,
RevenueCat pour gérer les abonnements, et OpenAI pour générer [X] si votre app a de l'IA »). Une politique
générique qui ne nomme personne est un motif de rejet.

- Génère ces pages à partir d'`APP-SPEC.md` (quelles données sont collectées, quels tiers sont réellement
  utilisés — n'invente jamais un tiers non utilisé, ni n'en omets un utilisé).
- Vérifie qu'elles répondent en **200** une fois déployées (`/deploy` puis test réel de l'URL).

## SEO de base

- Métadonnées (`title`, `description`) par page, `sitemap.xml`, `robots.txt`.
- Schéma `Organization`/`WebSite` en JSON-LD sur l'accueil.
- Voir le skill **seo-geo** pour l'optimisation avancée (citations IA) et **auto-blog** pour le contenu.

## Self-vérification de cette phase

- Le site build (`next build`) sans erreur.
- Pages `/privacy` et `/terms` en ligne, en HTTPS, nommant les vrais tiers de l'app.
- Lien vers l'App Store (ou vers `/preview` en attendant la publication) visible sur l'accueil.
- Aucune chaîne « lorem »/placeholder visible.

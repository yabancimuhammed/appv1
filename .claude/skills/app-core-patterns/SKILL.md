---
name: app-core-patterns
description: >
  Phase 3 du build (Features / cœur métier) : comment choisir, cloner et adapter un archétype depuis
  templates/archetypes/, et comment prouver que le « moment magique » marche vraiment (smoke-test runtime,
  pas juste le bundle). Chargé par l'agent `app-builder` en phase Features et par `/new` pour aider à
  choisir l'archétype le plus proche d'une idée.
---

# app-core-patterns — le cœur métier (le « moment magique »)

Le **moment magique**, c'est LA feature qui fait que l'app existe — celle sans laquelle ce ne serait qu'un
CRUD générique. Toutes les autres phases (auth, paywall, landing) sont du décor autour de celle-ci.

## 1. Choisir l'archétype le plus proche

`$CLAUDE_PROJECT_DIR/templates/archetypes/` contient des cœurs métier déjà pensés, testés et clonables.
Chaque archétype couvre une **famille d'idées**, pas une app précise :

| Archétype | Pattern couvert | Exemples d'idées client |
|---|---|---|
| `tracker-streak` | Suivi quotidien + séries (streaks) + progression | suivi d'entraînements, habitudes, méditation, lecture, jeûne |
| `content-library` | Collection personnelle d'éléments enrichis (+ IA en option) | notes, recettes, citations, articles sauvegardés, journal |

Si aucun archétype ne colle et que le cœur métier est vraiment inédit, dis-le honnêtement dans
`PROGRESS.md` (flag de faisabilité posé en `/new`) et construis la version la plus simple possible du
pattern demandé, en respectant quand même RLS + i18n + états loading/vide/erreur.

Si l'idée combine deux patterns (ex. « suivre mes lectures ET noter des citations »), clone les deux et
compose-les — n'invente pas un troisième pattern à la main si la combinaison des deux couvre le besoin.

## 2. Cloner puis adapter — jamais recréer à la main

```
cp -r "$CLAUDE_PROJECT_DIR/templates/archetypes/<archétype>/db"       supabase/migrations/
cp -r "$CLAUDE_PROJECT_DIR/templates/archetypes/<archétype>/screens"  app/(tabs)/
```

Puis adapte, dans cet ordre :
1. **Renomme l'entité** (ex. `item` → `habit`, `workout`, `note`…) partout : table, colonnes, composants,
   routes, clés i18n.
2. **Remplace les champs** par ceux de `APP-SPEC.md` (ajoute/retire des colonnes, adapte le formulaire).
3. **Branche l'onglet** dans la navigation (voir `expo-ios-app`).
4. **Ajoute les clés i18n FR et EN** pour tout texte nouveau (ne laisse jamais une clé dans une langue
   sans son équivalent).
5. (si IA) **Adapte le prompt** de l'edge function au domaine réel de l'app — jamais le prompt générique
   du template laissé tel quel.

## 3. Prouver que ça marche — smoke-test runtime (non négociable)

Le typecheck et le bundle vert **ne prouvent pas** que le moment magique fonctionne. Cette phase se prouve
en lançant `/preview` (Expo Go) et en cochant, en conditions réelles, la checklist d'acceptation dérivée
de l'archétype :

- [ ] L'app **boote** sans écran blanc ni crash.
- [ ] Le **parcours principal** se fait de bout en bout (créer → voir → modifier/compléter → supprimer
      l'élément central du moment magique).
- [ ] La **donnée persiste** : kill l'app, relance-la, la donnée est toujours là (persistance réelle en
      base, pas juste en mémoire locale).
- [ ] États **loading / vide / erreur** propres à chaque écran concerné.
- [ ] **Hors-ligne** : pas de crash si le réseau coupe (message clair, pas d'écran blanc).

Tant qu'un item n'est pas coché **après un test réel**, la phase n'est pas terminée — ne coche jamais sur
supposition.

## 4. Dégradation assumée (si nécessaire)

Si une partie du moment magique n'est pas fiable à 100 % (ex. une génération IA trop aléatoire, une
intégration externe instable), **ne livre jamais un bouton mort**. Livre une version réduite qui marche
vraiment (ex. 3 suggestions pré-calculées plutôt qu'une génération libre), et note explicitement dans
`PROGRESS.md` : quelle dégradation, pourquoi, et ce que ça change pour l'utilisateur final.

## Self-vérification de cette phase

Voir `app-builder.md` §Self-vérification — c'est la seule phase qui exige un smoke-test runtime en plus du
typecheck/bundle.

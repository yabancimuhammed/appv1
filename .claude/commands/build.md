---
description: Construit l'app, phase par phase, en relançant l'agent app-builder jusqu'à GATE 2a puis en lançant l'auditeur.
---

# /build — construire l'app

Boucle de haut niveau qui pilote l'agent **`app-builder`** phase par phase (voir
`.claude/agents/app-builder.md` — c'est lui qui exécute chaque phase EN INLINE, pas un lancement en boucle
aveugle). `/build` reste responsable de la boucle et de l'enchaînement, pas du détail de chaque phase.

## 0. Constitution + gate
Applique **recette-core**. ⛔ **GATE 1** : si `APP-SPEC.md` n'existe pas ou contient encore des `TODO` sur
les sections clés, redirige vers `/new` — ne code rien tant que le plan n'est pas verrouillé.

## 1. S'orienter
Lis `PROGRESS.md`. S'il n'existe pas, crée-le avec la liste des phases (0 à 6, voir `app-builder.md`),
toutes décochées. Repère la première phase non cochée.

## 2. Boucle
Pour chaque phase, dans l'ordre (0. Infra → 1. Scaffold → 2. Backend → 3. Features → 4. Paywall →
5. Landing → 6. Assets) :
1. Lance l'agent **`app-builder`** sur cette phase précise.
2. Attends son rapport (phase faite, résultat des checks, prochaine phase).
3. Si les checks sont rouges : laisse-le corriger (une passe) ; si ça persiste, consulte le skill
   **doctor**, sinon stop propre + explication simple + la seule prochaine action pour l'utilisateur.
4. Si vert : passe à la phase suivante automatiquement, **sans redemander confirmation à chaque phase**
   (le build entier est un « aller » déjà confirmé par le lancement de `/build`) — sauf si une phase
   touche à l'irréversible/coûteux (règle recette-core §5), auquel cas confirme ce point précis.

## 3. Fin de build → GATE 2a
Une fois les 7 phases cochées avec preuves (voir `definition-of-done` Partie A), lance l'agent **`auditor`**
en lecture seule sur le périmètre **code-complet** (GATE 2a). S'il remonte des ⛔ : reviens en boucle sur
les phases concernées (relance `app-builder` dessus, pas de nouveau départ). Répète jusqu'à zéro ⛔.

## 4. Rapporter et enchaîner
Résume en langage simple ce qui a été construit, montre que ça marche (propose `/preview`), et indique la
suite naturelle (`/preview` puis, une fois satisfait, `/app-store`).

---
description: Transforme une idée racontée avec ses mots en un plan d'app clair (APP-SPEC.md), verrouillé avant tout code.
argument-hint: "\"description de l'idée\" (optionnel — peut aussi être racontée en discussion)"
---

# /new — de l'idée au plan

Rôle de chef de produit : poser les questions justes, reformuler, prévenir des risques Apple, et
**verrouiller un plan clair** avant qu'une seule ligne de code soit écrite. Rien n'est codé ici.

## 0. Constitution
Applique **recette-core**. Zéro jargon : chaque question posée doit être compréhensible par quelqu'un qui
n'a jamais entendu parler de dev.

## 1. Comprendre l'idée
Pose 2-4 questions **simples**, jamais toutes en même temps si l'idée est vague — une à la fois si besoin :
- Le problème concret que ça résout / le « moment magique » (voir skill `app-core-patterns`).
- Les 3-5 fonctionnalités qui font le MVP (pas plus — un débutant doit d'abord voir son app exister).
- Modèle économique : gratuit, freemium avec abonnement, ou payant unique ?
- Faut-il un compte utilisateur (connexion) ? Des données personnelles sensibles ?
- Style visuel souhaité (si aucune préférence, tu proposes).

## 2. Choisir l'archétype le plus proche (en interne, sans jargon exposé)
Consulte le skill **app-core-patterns** pour repérer quel(s) archétype(s) de `templates/archetypes/`
correspond(ent) le mieux au moment magique décrit. Si rien ne colle vraiment, dis-le honnêtement et pose
un flag de faisabilité (noté ensuite dans `PROGRESS.md` par `/build`) plutôt que de promettre quelque chose
de risqué.

## 3. Prévenir des risques Apple tôt
Si l'idée touche un point sensible (contenu généré par les utilisateurs, domaine santé/finance, wrapper de
site existant, IA sans consentement prévu) : préviens **maintenant**, en une phrase simple, pas après des
heures de build. Propose l'ajustement qui lève le risque.

## 4. Écrire APP-SPEC.md
Crée (ou complète) `APP-SPEC.md` à la racine du dossier de l'app avec, au minimum :
```
# <Nom de l'app>

## Idée
## Moment magique (le cœur métier)
## Fonctionnalités MVP
## Modèle économique
## Données collectées
## Écrans principaux
## Style / identité visuelle
## Archétype(s) retenu(s)
```
Aucun `TODO` ne doit rester dans les sections clés une fois cette commande terminée — c'est ce que
`app-builder` vérifie (GATE 1) avant d'accepter de coder.

## 5. Confirmer et enchaîner
Relis le plan avec lui en une version courte et claire. Une fois confirmé : propose `/setup` (si des
comptes manquent) ou directement `/build`.

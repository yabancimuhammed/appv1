# Archétype : tracker-streak

**Pattern couvert** : suivi quotidien d'un ou plusieurs éléments + série (streak) + progression dans le
temps. Couvre des idées comme : suivi d'entraînements, suivi d'habitudes, méditation, lecture, jeûne
intermittent, arrêt d'une mauvaise habitude.

**Le moment magique** : cocher « fait aujourd'hui » et voir sa série (streak) progresser — la boucle de
gratification qui fait revenir l'utilisateur chaque jour.

## Comment adapter (voir skill `app-core-patterns`)

1. Renomme l'entité `item` → le nom du domaine réel (ex. `habit`, `workout`, `session`).
2. Adapte les colonnes de `db/0001_tracker_streak.sql` aux champs de `APP-SPEC.md` (ex. ajouter une
   `duration_minutes` pour un tracker d'entraînement).
3. Branche `screens/index.tsx` (liste + streaks), `screens/new-item.tsx` (créer un élément à suivre),
   `screens/item-detail.tsx` (historique + bouton « fait aujourd'hui ») dans la navigation.
4. Complète `i18n/fr.json` et `i18n/en.json` avec les libellés du domaine réel.
5. Applique la migration (`supabase/migrations/`) — voir skill `supabase-backend`.

## Calcul du streak

Le streak est **dérivé** de la table `entries` (une ligne = un jour où l'élément a été fait), jamais stocké
comme un compteur à part qui pourrait désynchroniser — recalcul simple à la lecture : nombre de jours
consécutifs jusqu'à aujourd'hui (ou hier, si pas encore fait aujourd'hui) sans trou.

## Checklist d'acceptation (smoke-test — voir skill `app-core-patterns` §3)

- [ ] Créer un élément à suivre.
- [ ] Le marquer « fait » aujourd'hui → le streak passe à 1 (ou s'incrémente si déjà en cours).
- [ ] Kill l'app, relance → l'élément et son streak sont toujours là.
- [ ] Liste vide au tout premier lancement → état vide clair, pas d'écran cassé.
- [ ] Coupure réseau pendant le marquage → message clair, pas de crash.

# Archétype : content-library

**Pattern couvert** : collection personnelle d'éléments enrichis, avec un enrichissement IA optionnel.
Couvre des idées comme : notes, recettes, citations sauvegardées, articles à lire plus tard, journal
personnel, carnet d'idées.

**Le moment magique** : sauvegarder rapidement un élément et le retrouver facilement (recherche/tags),
avec en option un résumé/une reformulation générée par IA au moment de la sauvegarde.

## Comment adapter (voir skill `app-core-patterns`)

1. Renomme l'entité `library_items` → le nom du domaine réel (ex. `notes`, `recipes`, `quotes`).
2. Adapte les colonnes de `db/0001_content_library.sql` (ex. `ingredients` pour des recettes plutôt que
   `tags` génériques).
3. Branche `screens/index.tsx` (liste + recherche), `screens/new-item.tsx` (créer, avec bouton
   d'enrichissement IA si l'app en a), `screens/item-detail.tsx` (voir/éditer) dans la navigation.
4. **Si IA** : adapte le prompt de `edge/summarize/index.ts` au domaine réel (jamais le prompt générique
   du template laissé tel quel) — et ajoute l'écran de consentement nommant le prestataire (guideline
   Apple 5.1.2, voir skill `definition-of-done`).
5. Complète `i18n/fr.json` et `i18n/en.json`.
6. Applique la migration — voir skill `supabase-backend`.

## Checklist d'acceptation (smoke-test — voir skill `app-core-patterns` §3)

- [ ] Créer un élément (titre + contenu).
- [ ] (si IA) L'enrichissement IA se déclenche et affiche un résultat cohérent.
- [ ] Le retrouver dans la liste, la recherche par titre fonctionne.
- [ ] Kill l'app, relance → l'élément est toujours là.
- [ ] Liste vide au premier lancement → état vide clair.
- [ ] Coupure réseau pendant la sauvegarde → message clair, pas de perte silencieuse de la saisie.

---
name: supabase-backend
description: >
  Phase 2 du build (Backend) : auth email + RLS, migrations, edge function proxy pour les clés tierces.
  Règle d'or — zéro secret dans le bundle client, toute clé tierce passe par le serveur. Chargé par
  l'agent `app-builder` pendant la phase Backend.
---

# supabase-backend — auth, données, secrets côté serveur

## Auth

- Email + mot de passe via `supabase.auth` (magic link en option si `APP-SPEC.md` le demande).
- Écran de connexion/inscription + réinitialisation de mot de passe (deep-link géré côté app).
- Session persistée (`AsyncStorage` + client Supabase configuré pour ça) pour ne pas redemander la
  connexion à chaque ouverture.

## RLS (Row Level Security) — non négociable

**Chaque table métier a RLS activé**, avec des policies qui garantissent qu'un utilisateur ne voit et ne
modifie que **ses propres lignes** (`auth.uid() = user_id`, typiquement). Sans RLS, n'importe quel
utilisateur connecté peut lire les données de tous les autres via l'API publique — c'est un rejet Apple
quasi certain (guideline 5) en plus d'une vraie faille.

```sql
create table public.<table> (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- ...
);

alter table public.<table> enable row level security;

create policy "own rows only"
on public.<table>
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

**`default auth.uid()` sur `user_id` — vérifié nécessaire en conditions réelles**, pas juste une précaution
en l'air : sans ce défaut, un insert qui oublie de préciser `user_id` (bug futur, champ retiré par erreur
lors d'une adaptation d'archétype) échoue avec une erreur RLS générique (`42501`) au lieu d'être rempli
automatiquement avec le bon utilisateur — un filet de sécurité manquant plutôt qu'un message clair.

## Piège vérifié en conditions réelles : confirmation e-mail activée par défaut = inscriptions bloquées

Un projet Supabase neuf a `mailer_autoconfirm: false` — l'inscription exige un e-mail de confirmation, envoyé
par le service SMTP intégré gratuit. Ce service a un quota **très bas** (quelques e-mails/heure) : dès qu'il
est épuisé (souvent par tes propres smoke-tests de la phase Backend), toute nouvelle inscription échoue
côté serveur avec un message générique — l'app affiche juste « impossible de te connecter », rien de plus
précis, ce qui ressemble à un bug alors que c'est un quota. Testable directement en dehors de l'app :
```
curl -s -X POST "$SUPABASE_URL/auth/v1/signup" -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'
# {"code":429,"error_code":"over_email_send_rate_limit",...} = c'est ce piège, pas un bug de l'app
```
Tant que l'app n'a pas son propre SMTP (domaine personnalisé, hors scope MVP), active la confirmation
automatique via l'API Management — aucun e-mail envoyé, l'inscription réussit immédiatement :
```
curl -s -X PATCH "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json" \
  -d '{"mailer_autoconfirm": true}'
```
C'est un changement de comportement auth (pas juste un secret) — confirme-le au client en une phrase avant
de l'appliquer (voir constitution : confirmer les changements non triviaux), même si c'est sans risque et
réversible. À faire systématiquement en phase Backend, avant le premier smoke-test d'inscription — pas
seulement quand le symptôme apparaît en `/preview`.

## Migrations

Toute évolution de schéma passe par un fichier de migration versionné dans `supabase/migrations/`
(jamais une modification manuelle dans le dashboard qui ne serait pas répercutée dans le repo — sinon
la reprise/l'idempotence casse). Les migrations des **archétypes clonés** (`templates/archetypes/<x>/db/`)
sont copiées ici telles quelles puis adaptées aux noms de champs de la spec.

## Piège : `npm:` plutôt que `jsr:` pour les imports des edge functions

Utilise **toujours** `npm:@supabase/supabase-js@2` (jamais `jsr:@supabase/supabase-js@2`) dans le code des
edge functions. Vérifié en conditions réelles : un déploiement via l'API Management (POST/PATCH
`/v1/projects/{ref}/functions`) tourne en mode `--no-remote` côté serveur — un import `jsr:` y échoue au
boot (`BOOT_ERROR`, la fonction répond 503 à chaque appel) parce que la résolution du package JSR exige un
accès réseau à ce moment-là, ce que `--no-remote` interdit. `npm:` fonctionne car les paquets npm sont
résolus différemment par le runtime des edge functions. Vérifie toujours qu'une fonction **démarre** après
déploiement (un simple appel qui doit renvoyer autre chose qu'un 503) — un déploiement qui renvoie 200/201
ne prouve pas que la fonction boote, seulement qu'elle a été acceptée.

## Edge function proxy — zéro secret côté client

**Aucune clé tierce (OpenAI, etc.) ne doit jamais apparaître dans le bundle app** (pas de `EXPO_PUBLIC_OPENAI_KEY`
— une variable `EXPO_PUBLIC_*` est visible par quiconque inspecte le bundle). À la place :

1. La clé vit **uniquement** côté serveur, en variable d'env de l'**edge function** Supabase (jamais
   préfixée `EXPO_PUBLIC_`).
2. L'app appelle l'edge function (avec le token de session de l'utilisateur, pas la clé tierce).
3. L'edge function vérifie la session, appelle le service tiers avec la clé secrète, renvoie le résultat.

```ts
// supabase/functions/<nom>/index.ts — squelette
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader! } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const thirdPartyKey = Deno.env.get("OPENAI_API_KEY")!; // jamais côté client
  // ... appel au service tiers avec thirdPartyKey ...
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
});
```

## Suppression de compte (obligatoire si auth — guideline Apple 5.1.1v)

Clone `templates/base/supabase/functions/delete-account/index.ts` **telle quelle** (pas de réécriture à
la main) et déploie-la. Elle exige la variable d'env serveur `SUPABASE_SERVICE_ROLE_KEY` (jamais préfixée
`EXPO_PUBLIC_`, jamais côté client) pour supprimer réellement le compte via l'API admin. L'écran
`app/(tabs)/settings.tsx` (cloné depuis `templates/base/`, voir skill `expo-ios-app`) l'appelle déjà.

## Self-vérification de cette phase

- `grep -rn "EXPO_PUBLIC_"` : uniquement URL Supabase + clé **anon** + clé publique RevenueCat — rien d'autre.
- Chaque table métier a RLS activé et une policy testée (un 2e compte de test ne voit pas les données du
  1er).
- Les migrations sont dans le repo, appliquées, et notées (nom + `project-ref`) dans `PROGRESS.md`.
- Toute clé tierce passe par une edge function — aucune requête directe depuis le client vers un service
  tiers avec une clé secrète.

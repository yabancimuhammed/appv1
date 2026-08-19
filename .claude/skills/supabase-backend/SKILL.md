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
alter table public.<table> enable row level security;

create policy "own rows only"
on public.<table>
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## Migrations

Toute évolution de schéma passe par un fichier de migration versionné dans `supabase/migrations/`
(jamais une modification manuelle dans le dashboard qui ne serait pas répercutée dans le repo — sinon
la reprise/l'idempotence casse). Les migrations des **archétypes clonés** (`templates/archetypes/<x>/db/`)
sont copiées ici telles quelles puis adaptées aux noms de champs de la spec.

## Edge function proxy — zéro secret côté client

**Aucune clé tierce (OpenAI, etc.) ne doit jamais apparaître dans le bundle app** (pas de `EXPO_PUBLIC_OPENAI_KEY`
— une variable `EXPO_PUBLIC_*` est visible par quiconque inspecte le bundle). À la place :

1. La clé vit **uniquement** côté serveur, en variable d'env de l'**edge function** Supabase (jamais
   préfixée `EXPO_PUBLIC_`).
2. L'app appelle l'edge function (avec le token de session de l'utilisateur, pas la clé tierce).
3. L'edge function vérifie la session, appelle le service tiers avec la clé secrète, renvoie le résultat.

```ts
// supabase/functions/<nom>/index.ts — squelette
import { createClient } from "jsr:@supabase/supabase-js@2";

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

## Self-vérification de cette phase

- `grep -rn "EXPO_PUBLIC_"` : uniquement URL Supabase + clé **anon** + clé publique RevenueCat — rien d'autre.
- Chaque table métier a RLS activé et une policy testée (un 2e compte de test ne voit pas les données du
  1er).
- Les migrations sont dans le repo, appliquées, et notées (nom + `project-ref`) dans `PROGRESS.md`.
- Toute clé tierce passe par une edge function — aucune requête directe depuis le client vers un service
  tiers avec une clé secrète.

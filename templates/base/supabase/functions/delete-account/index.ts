// Edge function — suppression de compte in-app (guideline Apple 5.1.1v : obligatoire dès qu'il y a
// un compte utilisateur, un vrai chemin DANS l'app, pas seulement "contactez-nous"). Copiée telle quelle
// en phase Backend (voir skill supabase-backend), aucune adaptation nécessaire par app.
//
// La suppression réelle exige la clé service_role (droits admin) — jamais exposée côté client. Le
// client appelle cette fonction avec son propre token de session ; la fonction vérifie qui est
// l'utilisateur, PUIS utilise service_role en interne pour supprimer son compte et ses données.
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("unauthorized", { status: 401 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // jamais côté client

  // 1. Vérifie qui fait la demande, avec ses propres droits (pas encore service_role).
  const asUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await asUser.auth.getUser();
  if (userError || !user) return new Response("unauthorized", { status: 401 });

  // 2. Supprime les données métier de l'utilisateur (RLS s'applique déjà avec son propre token —
  //    adapte cette liste de tables si l'app en a d'autres qui référencent user_id).
  //    Exemple générique : suppression en cascade déjà gérée par les FK `on delete cascade` des
  //    migrations d'archétype — donc supprimer l'utilisateur dans auth.users suffit (étape 3).

  // 3. Supprime le compte auth lui-même — exige service_role.
  const asAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { error: deleteError } = await asAdmin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
});

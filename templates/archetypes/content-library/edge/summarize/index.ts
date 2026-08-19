// Edge function d'enrichissement IA — squelette à adapter au domaine réel de l'app.
// La clé OpenAI vit UNIQUEMENT ici (variable d'env serveur), jamais côté client (voir skill
// supabase-backend). Adapte le PROMPT ci-dessous au domaine réel avant de livrer — ne laisse jamais le
// prompt générique du template tel quel.
import { createClient } from "npm:@supabase/supabase-js@2";

const PROMPT =
  "Tu résumes un élément personnel sauvegardé par l'utilisateur en 1-2 phrases claires, dans sa langue " +
  "d'origine. Adapte ce prompt au domaine réel de l'app (ex. 'résume une recette', 'reformule une note') " +
  "avant de livrer.";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("unauthorized", { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  const { itemId, text } = await req.json();
  if (!itemId || !text) return new Response("bad request", { status: 400 });

  const openaiKey = Deno.env.get("OPENAI_API_KEY")!; // jamais exposé côté client
  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PROMPT },
        { role: "user", content: text },
      ],
    }),
  });

  if (!completion.ok) {
    return new Response(JSON.stringify({ error: "ai_unavailable" }), { status: 502 });
  }

  const result = await completion.json();
  const summary = result.choices?.[0]?.message?.content ?? null;

  // Vérité serveur : on écrit directement le résultat en base plutôt que de faire confiance au client.
  await supabase
    .from("library_items")
    .update({ ai_summary: summary })
    .eq("id", itemId)
    .eq("user_id", user.id);

  return new Response(JSON.stringify({ summary }), { headers: { "content-type": "application/json" } });
});

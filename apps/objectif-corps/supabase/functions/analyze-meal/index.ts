// Edge function — analyse IA d'un repas (le moment magique, voir APP-SPEC.md). La clé OpenAI vit
// UNIQUEMENT ici (variable d'env serveur), jamais côté client (voir skill supabase-backend).
//
// Garde-fous de sécurité posés dans le prompt système (voir APP-SPEC.md §Risque Apple) :
// - jamais de restriction calorique extrême recommandée,
// - jamais formulé comme une prescription médicale,
// - toujours un ton bienveillant, jamais culpabilisant.
import { createClient } from "jsr:@supabase/supabase-js@2";

const SYSTEM_PROMPT = `Tu es un assistant nutrition bienveillant, jamais culpabilisant. Analyse la photo
d'un repas et réponds UNIQUEMENT en JSON valide avec ce format exact :
{
  "detectedFoods": string[],       // aliments identifiés, noms courts
  "caloriesEstimate": number,      // estimation raisonnable, entier
  "advice": string,                // 1-2 phrases, bienveillantes, jamais culpabilisantes
  "swapSuggestions": string[]      // 0 à 2 suggestions de remplacement concrètes et raisonnables
}
Règles impératives :
- Ne recommande JAMAIS une restriction calorique extrême ou un jeûne prolongé.
- Ne formule jamais de diagnostic ni de conseil médical — reste générique et prudent.
- Ton toujours positif : jamais de mots comme "mauvais", "interdit", "honte".
- Si l'image ne montre clairement pas de nourriture, renvoie detectedFoods: [] et advice expliquant que
  l'photo n'a pas pu être analysée.`;

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("unauthorized", { status: 401 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return new Response("unauthorized", { status: 401 });

  const { imageBase64 } = await req.json();
  if (!imageBase64) return new Response("bad request: imageBase64 required", { status: 400 });

  const openaiKey = Deno.env.get("OPENAI_API_KEY")!; // jamais exposé côté client
  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyse ce repas." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        },
      ],
    }),
  });

  if (!completion.ok) {
    return new Response(JSON.stringify({ error: "ai_unavailable" }), { status: 502 });
  }

  const result = await completion.json();
  let parsed;
  try {
    parsed = JSON.parse(result.choices?.[0]?.message?.content ?? "{}");
  } catch {
    return new Response(JSON.stringify({ error: "ai_bad_response" }), { status: 502 });
  }

  return new Response(
    JSON.stringify({
      detectedFoods: parsed.detectedFoods ?? [],
      caloriesEstimate: parsed.caloriesEstimate ?? 0,
      advice: parsed.advice ?? "",
      swapSuggestions: parsed.swapSuggestions ?? [],
    }),
    { headers: { "content-type": "application/json" } },
  );
});

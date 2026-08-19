// Client Supabase de base — copié tel quel en phase Scaffold (voir skill expo-ios-app).
// Toute app La Recette utilise EXACTEMENT ce client : mêmes noms d'env, mêmes options de session.
// Ne jamais dupliquer/réinventer ce fichier ailleurs dans le projet.
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY manquants. " +
      "Ce sont les DEUX seules variables Supabase publiques attendues côté client — " +
      "toute autre clé Supabase (service_role) ne doit jamais apparaître ici (voir skill supabase-backend).",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

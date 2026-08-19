// Écran liste + recherche — archétype content-library. Renomme `library_items` selon l'entité réelle.
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../theme/colors";

type LibraryItem = { id: string; title: string; body: string };

export default function LibraryListScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("library_items")
      .select("id, title, body")
      .order("created_at", { ascending: false });
    if (err) {
      setError(t("library.loadError"));
      return;
    }
    setItems(data ?? []);
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (items === null && !error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  const filtered = (items ?? []).filter((i) => i.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t("library.searchPlaceholder")}
        placeholderTextColor={colors.textMuted}
        style={{ margin: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text }}
      />

      {error && <Text style={{ color: colors.error, marginHorizontal: 16 }}>{error}</Text>}

      {items!.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: colors.textMuted, textAlign: "center" }}>{t("library.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/library/${item.id}`)}
              style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface }}
            >
              <Text style={{ fontWeight: "600", color: colors.text }}>{item.title}</Text>
              <Text numberOfLines={2} style={{ color: colors.textMuted, marginTop: 4 }}>{item.body}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

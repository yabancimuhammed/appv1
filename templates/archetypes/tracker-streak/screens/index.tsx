// Écran liste — archétype tracker-streak. Renomme `items`/`Item` selon l'entité réelle avant de brancher.
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next"; // ou l'équivalent i18n déjà en place dans le scaffold
import { supabase } from "../../lib/supabase";
import { computeStreak, type Entry } from "./streak";
import { colors } from "../../theme/colors";

type Item = { id: string; name: string };

export default function ItemsListScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[] | null>(null);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const { data: itemsData, error: itemsError } = await supabase
      .from("items")
      .select("id, name")
      .order("created_at", { ascending: false });
    if (itemsError) {
      setError(t("items.loadError"));
      return;
    }
    setItems(itemsData ?? []);

    const { data: entriesData } = await supabase.from("entries").select("item_id, done_on");
    const byItem: Record<string, Entry[]> = {};
    for (const e of entriesData ?? []) {
      (byItem[e.item_id] ??= []).push({ done_on: e.done_on });
    }
    const next: Record<string, number> = {};
    for (const item of itemsData ?? []) next[item.id] = computeStreak(byItem[item.id] ?? []);
    setStreaks(next);
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

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ color: colors.error }}>{error}</Text>
        <Pressable onPress={load}><Text style={{ color: colors.accent }}>{t("common.retry")}</Text></Pressable>
      </View>
    );
  }

  if (items!.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ color: colors.textMuted, textAlign: "center" }}>{t("items.empty")}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items!}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface }}>
          <Text style={{ fontWeight: "600", color: colors.text }}>{item.name}</Text>
          <Text style={{ color: colors.accent, marginTop: 4 }}>
            {t("items.streak", { count: streaks[item.id] ?? 0 })}
          </Text>
        </View>
      )}
    />
  );
}

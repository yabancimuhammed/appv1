// Écran détail/édition — archétype content-library.
import { useCallback, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useThemeColors } from "../../theme/colors";

export default function LibraryItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [item, setItem] = useState<{ title: string; body: string; ai_summary: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("library_items")
      .select("title, body, ai_summary")
      .eq("id", id)
      .single();
    if (err) {
      setError(t("library.loadError"));
      return;
    }
    setItem(data);
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (!item && !error) {
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
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{item!.title}</Text>
      {item!.ai_summary && (
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.surfaceMuted }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t("library.aiSummaryLabel")}</Text>
          <Text style={{ color: colors.text, marginTop: 4 }}>{item!.ai_summary}</Text>
        </View>
      )}
      <Text style={{ color: colors.text }}>{item!.body}</Text>
    </ScrollView>
  );
}

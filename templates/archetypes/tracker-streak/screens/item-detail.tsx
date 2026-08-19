// Écran détail — marquer « fait aujourd'hui », voir l'historique. Renomme selon l'entité réelle.
import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { computeStreak, type Entry } from "./streak";
import { useThemeColors } from "../../theme/colors";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("entries")
      .select("done_on")
      .eq("item_id", id)
      .order("done_on", { ascending: false });
    if (err) {
      setError(t("items.loadError"));
      return;
    }
    setEntries(data ?? []);
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const doneToday = entries?.some((e) => e.done_on === today) ?? false;

  const markToday = async () => {
    setMarking(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error: err } = await supabase.from("entries").insert({
      item_id: id,
      user_id: userData.user?.id,
      done_on: today,
    });
    setMarking(false);
    if (err) {
      setError(t("items.markError"));
      return;
    }
    await load(); // relit depuis la base — la donnée persistée fait foi, pas un état optimiste seul
  };

  if (entries === null && !error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  const streak = computeStreak(entries ?? []);

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 32, fontWeight: "700", color: colors.text }}>{streak}</Text>
      <Text style={{ color: colors.textMuted }}>{t("items.streakLabel")}</Text>

      {error && <Text style={{ color: colors.error }}>{error}</Text>}

      <Pressable
        disabled={doneToday || marking}
        onPress={markToday}
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: doneToday ? colors.surfaceMuted : colors.accent,
          alignItems: "center",
        }}
      >
        {marking ? (
          <ActivityIndicator color={colors.onAccent} />
        ) : (
          <Text style={{ color: doneToday ? colors.textMuted : colors.onAccent, fontWeight: "600" }}>
            {doneToday ? t("items.doneToday") : t("items.markDone")}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

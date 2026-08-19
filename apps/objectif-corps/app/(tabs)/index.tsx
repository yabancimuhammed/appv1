import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { computeStreak } from "../../lib/streak";
import { useThemeColors } from "../../theme/colors";

type Meal = {
  id: string;
  detected_foods: string[] | null;
  calories_estimate: number | null;
  created_at: string;
};

export default function JournalScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("meals")
      .select("id, detected_foods, calories_estimate, created_at")
      .order("created_at", { ascending: false });
    if (err) {
      setError(t("journal.loadError"));
      return;
    }
    setMeals(data ?? []);
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (meals === null && !error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator />
      </View>
    );
  }

  const streak = computeStreak(meals ?? []);
  const today = new Date().toISOString().slice(0, 10);
  const todaysMeals = (meals ?? []).filter((m) => m.created_at.slice(0, 10) === today);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>{t("disclaimer.banner")}</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>{t("journal.title")}</Text>
          <Text style={{ color: colors.accent, fontWeight: "600" }}>
            {t("journal.streak", { count: streak })}
          </Text>
        </View>

        {error && <Text style={{ color: colors.error }}>{error}</Text>}

        <Pressable
          onPress={() => router.push("/(tabs)/scan")}
          style={{ padding: 16, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center" }}
        >
          <Text style={{ color: colors.onAccent, fontWeight: "600" }}>{t("journal.scanCta")}</Text>
        </Pressable>
      </View>

      {todaysMeals.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: colors.textMuted, textAlign: "center" }}>{t("journal.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={todaysMeals}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface }}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                {(item.detected_foods ?? []).join(", ") || "—"}
              </Text>
              {item.calories_estimate != null && (
                <Text style={{ color: colors.textMuted, marginTop: 4 }}>
                  {t("scan.caloriesEstimate")} : {item.calories_estimate} kcal
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

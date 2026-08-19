import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { useThemeColors } from "../../theme/colors";

type Measurement = { id: string; weight_kg: number; measured_on: string };

export default function ProgressScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [measurements, setMeasurements] = useState<Measurement[] | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("measurements")
      .select("id, weight_kg, measured_on")
      .order("measured_on", { ascending: false });
    if (err) {
      setError(t("progress.loadError"));
      return;
    }
    setMeasurements(data ?? []);
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const addMeasurement = async () => {
    const weight = Number(newWeight.replace(",", "."));
    if (!weight || weight <= 0) return;
    setSaving(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const { error: err } = await supabase.from("measurements").insert({
      user_id: userData.user?.id,
      weight_kg: weight,
      measured_on: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);
    if (err) {
      setError(t("progress.saveError"));
      return;
    }
    setNewWeight("");
    await load();
  };

  if (measurements === null && !error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>{t("progress.title")}</Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TextInput
            value={newWeight}
            onChangeText={setNewWeight}
            placeholder={t("progress.weightPlaceholder")}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text }}
          />
          <Pressable
            onPress={addMeasurement}
            disabled={saving || !newWeight}
            style={{ paddingHorizontal: 20, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}
          >
            {saving ? (
              <ActivityIndicator color={colors.onAccent} />
            ) : (
              <Text style={{ color: colors.onAccent, fontWeight: "600" }}>{t("progress.addMeasurement")}</Text>
            )}
          </Pressable>
        </View>

        {error && <Text style={{ color: colors.error }}>{error}</Text>}
      </View>

      {measurements!.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: colors.textMuted, textAlign: "center" }}>{t("progress.empty")}</Text>
        </View>
      ) : (
        <FlatList
          data={measurements!}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 14,
                borderRadius: 12,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.textMuted }}>{item.measured_on}</Text>
              <Text style={{ color: colors.text, fontWeight: "600" }}>{item.weight_kg} kg</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

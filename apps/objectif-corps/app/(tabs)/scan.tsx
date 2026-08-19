// Scanner un repas — le moment magique (voir APP-SPEC.md). Photo → edge function `analyze-meal` (IA) →
// résultat éditable → enregistrement. L'IA n'est jamais présentée comme infaillible : tout est corrigeable
// avant sauvegarde (voir skill app-core-patterns).
import { useState } from "react";
import { View, Text, Pressable, Image, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useThemeColors } from "../../theme/colors";

type AnalysisResult = {
  detectedFoods: string[];
  caloriesEstimate: number;
  advice: string;
  swapSuggestions: string[];
};

export default function ScanScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const pickAndAnalyze = async (fromCamera: boolean) => {
    setError(null);
    setResult(null);

    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t("scan.analyzeError"));
      return;
    }

    const pickResult = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });
    if (pickResult.canceled || !pickResult.assets[0]) return;

    const asset = pickResult.assets[0];
    setPhotoUri(asset.uri);
    setPhotoBase64(asset.base64 ?? null);
    if (!asset.base64) {
      setError(t("scan.analyzeError"));
      return;
    }

    setAnalyzing(true);
    const { data: session } = await supabase.auth.getSession();
    const { data, error: fnError } = await supabase.functions.invoke("analyze-meal", {
      body: { imageBase64: asset.base64 },
      headers: { Authorization: `Bearer ${session.session?.access_token}` },
    });
    setAnalyzing(false);

    if (fnError || !data) {
      setError(t("scan.analyzeError"));
      return;
    }
    setResult(data as AnalysisResult);
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const { error: err } = await supabase.from("meals").insert({
      user_id: userData.user?.id,
      photo_uri: photoUri,
      detected_foods: result.detectedFoods,
      calories_estimate: result.caloriesEstimate,
      advice: result.advice,
      swap_suggestions: result.swapSuggestions,
    });
    setSaving(false);
    if (err) {
      setError(t("scan.saveError"));
      return;
    }
    router.push("/(tabs)");
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{t("scan.title")}</Text>

      {photoUri && (
        <Image source={{ uri: photoUri }} style={{ width: "100%", height: 220, borderRadius: 12 }} />
      )}

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => pickAndAnalyze(true)}
          style={{ flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center" }}
        >
          <Text style={{ color: colors.onAccent, fontWeight: "600" }}>{t("scan.takePhoto")}</Text>
        </Pressable>
        <Pressable
          onPress={() => pickAndAnalyze(false)}
          style={{ flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center" }}
        >
          <Text style={{ color: colors.text, fontWeight: "600" }}>{t("scan.pickPhoto")}</Text>
        </Pressable>
      </View>

      {analyzing && (
        <View style={{ alignItems: "center", gap: 8 }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ color: colors.textMuted }}>{t("scan.analyzing")}</Text>
        </View>
      )}

      {error && <Text style={{ color: colors.error }}>{error}</Text>}

      {result && (
        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t("scan.editBeforeSaving")}</Text>

          <View style={{ gap: 4 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t("scan.detectedFoods")}</Text>
            <TextInput
              value={result.detectedFoods.join(", ")}
              onChangeText={(v) => setResult({ ...result, detectedFoods: v.split(",").map((s) => s.trim()) })}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text }}
            />
          </View>

          <View style={{ gap: 4 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t("scan.caloriesEstimate")}</Text>
            <TextInput
              value={String(result.caloriesEstimate)}
              onChangeText={(v) => setResult({ ...result, caloriesEstimate: Number(v) || 0 })}
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text }}
            />
          </View>

          <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.surfaceMuted, gap: 4 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t("scan.advice")}</Text>
            <Text style={{ color: colors.text }}>{result.advice}</Text>
          </View>

          {result.swapSuggestions.length > 0 && (
            <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.surfaceMuted, gap: 4 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t("scan.swapSuggestions")}</Text>
              {result.swapSuggestions.map((s, i) => (
                <Text key={i} style={{ color: colors.text }}>
                  • {s}
                </Text>
              ))}
            </View>
          )}

          <Pressable
            onPress={save}
            disabled={saving}
            style={{ padding: 16, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center" }}
          >
            {saving ? (
              <ActivityIndicator color={colors.onAccent} />
            ) : (
              <Text style={{ color: colors.onAccent, fontWeight: "600" }}>{t("scan.confirmAndSave")}</Text>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

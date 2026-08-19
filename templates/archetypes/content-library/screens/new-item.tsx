// Écran création — archétype content-library. Le bouton IA n'apparaît que si l'app en a (voir APP-SPEC.md).
import { useState } from "react";
import { View, TextInput, Pressable, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useThemeColors } from "../../theme/colors";

const HAS_AI = false; // passe à true + branche le bouton ci-dessous si APP-SPEC.md prévoit de l'IA

export default function NewLibraryItemScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const { data, error: err } = await supabase
      .from("library_items")
      .insert({ title: title.trim(), body: body.trim(), user_id: userData.user?.id })
      .select("id")
      .single();
    setSaving(false);
    if (err || !data) {
      setError(t("library.saveError"));
      return;
    }
    if (HAS_AI && body.trim()) {
      setEnriching(true);
      const { data: session } = await supabase.auth.getSession();
      await supabase.functions
        .invoke("summarize", {
          body: { itemId: data.id, text: body.trim() },
          headers: { Authorization: `Bearer ${session.session?.access_token}` },
        })
        .catch(() => null); // l'enrichissement est un bonus — un échec ne bloque pas la sauvegarde
      setEnriching(false);
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={t("library.titlePlaceholder")}
        placeholderTextColor={colors.textMuted}
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, color: colors.text }}
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={t("library.bodyPlaceholder")}
        placeholderTextColor={colors.textMuted}
        multiline
        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, minHeight: 120, color: colors.text }}
      />
      {error && <Text style={{ color: colors.error }}>{error}</Text>}
      <Pressable
        onPress={save}
        disabled={saving || enriching || !title.trim()}
        style={{ padding: 16, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center" }}
      >
        {saving || enriching ? (
          <ActivityIndicator color={colors.onAccent} />
        ) : (
          <Text style={{ color: colors.onAccent, fontWeight: "600" }}>{t("common.save")}</Text>
        )}
      </Pressable>
    </View>
  );
}

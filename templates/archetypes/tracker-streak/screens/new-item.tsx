// Écran création — ajouter un élément à suivre. Renomme selon l'entité réelle.
import { useState } from "react";
import { View, TextInput, Pressable, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useThemeColors } from "../../theme/colors";

export default function NewItemScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const { error: err } = await supabase.from("items").insert({
      name: name.trim(),
      user_id: userData.user?.id,
    });
    setSaving(false);
    if (err) {
      setError(t("items.saveError"));
      return;
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, padding: 24, gap: 16 }}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t("items.namePlaceholder")}
        placeholderTextColor={colors.textMuted}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          padding: 14,
          color: colors.text,
        }}
      />
      {error && <Text style={{ color: colors.error }}>{error}</Text>}
      <Pressable
        onPress={save}
        disabled={saving || !name.trim()}
        style={{ padding: 16, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center" }}
      >
        {saving ? <ActivityIndicator color={colors.onAccent} /> : <Text style={{ color: colors.onAccent, fontWeight: "600" }}>{t("common.save")}</Text>}
      </Pressable>
    </View>
  );
}

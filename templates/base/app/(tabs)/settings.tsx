// Écran Réglages — copié tel quel en phase Scaffold, branché dans la navigation. Contient le
// chemin de suppression de compte obligatoire (guideline Apple 5.1.1v) : aucune app La Recette avec
// auth ne doit être livrée sans cet écran.
import { useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useThemeColors } from "../../theme/colors";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const confirmDelete = () => {
    Alert.alert(
      t("settings.deleteAccountConfirmTitle"),
      t("settings.deleteAccountConfirmBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.confirm"), style: "destructive", onPress: deleteAccount },
      ],
    );
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setError(null);
    const { data: session } = await supabase.auth.getSession();
    const { error: fnError } = await supabase.functions.invoke("delete-account", {
      headers: { Authorization: `Bearer ${session.session?.access_token}` },
    });
    setDeleting(false);
    if (fnError) {
      setError(t("settings.deleteAccountError"));
      return;
    }
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, padding: 24, gap: 24, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{t("settings.title")}</Text>

      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 13, color: colors.textMuted, textTransform: "uppercase" }}>
          {t("settings.account")}
        </Text>

        <Pressable
          onPress={signOut}
          style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface }}
        >
          <Text style={{ color: colors.text, fontWeight: "600" }}>{t("settings.signOut")}</Text>
        </Pressable>

        <Pressable
          onPress={confirmDelete}
          disabled={deleting}
          style={{ padding: 16, borderRadius: 12, backgroundColor: colors.surface }}
        >
          {deleting ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <Text style={{ color: colors.error, fontWeight: "600" }}>{t("settings.deleteAccount")}</Text>
          )}
        </Pressable>

        {error && <Text style={{ color: colors.error }}>{error}</Text>}
      </View>
    </View>
  );
}

import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { useThemeColors } from "../theme/colors";

export default function SignInScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    const { error: err } =
      mode === "signIn"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (err) setError(t("auth.genericError"));
    // Si succès : app/_layout.tsx redirige automatiquement via onAuthStateChange.
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
          {mode === "signIn" ? t("auth.signInTitle") : t("auth.signUpTitle")}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t("auth.emailPlaceholder")}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, color: colors.text }}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t("auth.passwordPlaceholder")}
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, color: colors.text }}
        />

        {error && <Text style={{ color: colors.error }}>{error}</Text>}

        <Pressable
          onPress={submit}
          disabled={loading || !email.trim() || !password}
          style={{ padding: 16, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center" }}
        >
          {loading ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <Text style={{ color: colors.onAccent, fontWeight: "600" }}>
              {mode === "signIn" ? t("auth.signIn") : t("auth.signUp")}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}>
          <Text style={{ color: colors.accent, textAlign: "center" }}>
            {mode === "signIn" ? t("auth.switchToSignUp") : t("auth.switchToSignIn")}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

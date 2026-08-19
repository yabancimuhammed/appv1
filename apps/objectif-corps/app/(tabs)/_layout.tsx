import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeColors } from "../../theme/colors";

export default function TabsLayout() {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("journal.title") }} />
      <Tabs.Screen name="scan" options={{ title: t("scan.title") }} />
      <Tabs.Screen name="progress" options={{ title: t("progress.title") }} />
      <Tabs.Screen name="settings" options={{ title: t("settings.title") }} />
    </Tabs>
  );
}

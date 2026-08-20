// Tokens de couleur — copié tel quel en phase Scaffold (voir skill expo-ios-app).
// Contrat de noms FIXE : tout écran/archétype de La Recette utilise ces clés exactes. N'en renomme
// aucune sans mettre à jour tous les écrans qui les consomment. Les clés "glass*"/"gradient*"/"accentSoft"/
// "aurora" portent le design system premium "glass" + fond animé (voir components/GlassCard.tsx,
// ScreenBackground.tsx, FluidBackground.tsx dans le même dossier `templates/base/`) — additives, jamais un
// remplacement des clés historiques. `accent`/`accentSoft`/`gradientAccent`/`aurora` sont à personnaliser
// par app (ici : valeurs neutres de départ) ; `/ui` peut les ajuster sans toucher au reste du contrat.
import { useColorScheme } from "react-native";

const light = {
  background: "#FFFFFF",
  backgroundGradient: ["#F4F6FF", "#F9FAFF", "#FFFFFF"] as [string, string, string],
  surface: "#F5F5F7",
  surfaceMuted: "#EBEBF0",
  text: "#111114",
  textMuted: "#6B6B75",
  border: "#E2E2E8",
  accent: "#3D5AFE",
  accentSoft: "#7B93FF",
  onAccent: "#FFFFFF",
  error: "#D92D20",
  glass: "rgba(255,255,255,0.6)",
  glassBorder: "rgba(17,17,20,0.1)",
  glassTint: "light" as "light" | "dark",
  gradientAccent: ["#3D5AFE", "#5B72FF", "#7B93FF"] as [string, string, string],
  aurora: ["#2DD4BF", "#8B5CF6", "#FF8A65"] as [string, string, string],
};

const dark = {
  background: "#0B0B0D",
  backgroundGradient: ["#050506", "#0C0C10", "#101018"] as [string, string, string],
  surface: "#18181B",
  surfaceMuted: "#232327",
  text: "#F5F5F7",
  textMuted: "#9A9AA2",
  border: "#2A2A2F",
  accent: "#5B7CFA",
  accentSoft: "#3D5AFE",
  onAccent: "#0B0B0D",
  error: "#F97066",
  glass: "rgba(24,24,27,0.5)",
  glassBorder: "rgba(255,255,255,0.12)",
  glassTint: "dark" as "light" | "dark",
  gradientAccent: ["#232349", "#3D5AFE", "#5B7CFA"] as [string, string, string],
  aurora: ["#2DD4BF", "#A78BFA", "#FB923C"] as [string, string, string],
};

export type ThemeColors = typeof light;

/** Palette réactive au thème système — à utiliser dans TOUT composant. */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? dark : light;
}

/**
 * Palette statique (clair) — UNIQUEMENT pour les contextes hors composant React où un hook est
 * impossible (ex. configuration d'une librairie tierce qui exige une couleur fixe au démarrage).
 * Dans un écran, utilise toujours useThemeColors(), jamais cet export direct.
 */
export const colors = light;

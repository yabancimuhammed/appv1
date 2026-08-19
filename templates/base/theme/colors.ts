// Tokens de couleur — copié tel quel en phase Scaffold (voir skill expo-ios-app).
// Contrat de noms FIXE : tout écran/archétype de La Recette utilise ces clés exactes. N'en renomme
// aucune sans mettre à jour tous les écrans qui les consomment.
import { useColorScheme } from "react-native";

const light = {
  background: "#FFFFFF",
  surface: "#F5F5F7",
  surfaceMuted: "#EBEBF0",
  text: "#111114",
  textMuted: "#6B6B75",
  border: "#E2E2E8",
  accent: "#3D5AFE",
  onAccent: "#FFFFFF",
  error: "#D92D20",
};

const dark = {
  background: "#0B0B0D",
  surface: "#18181B",
  surfaceMuted: "#232327",
  text: "#F5F5F7",
  textMuted: "#9A9AA2",
  border: "#2A2A2F",
  accent: "#5B7CFA",
  onAccent: "#0B0B0D",
  error: "#F97066",
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

// Fond premium de chaque écran — dégradé de base + bulles animées "fluides" (FluidBackground) qui
// mettent en valeur le "glass" de GlassCard.tsx. À utiliser comme wrapper racine de tout écran, en
// remplacement d'un simple <View style={{ backgroundColor: colors.background }}>. Le fond animé étant
// posé ici une seule fois, il s'applique automatiquement à tout écran qui utilise ce wrapper — pas besoin
// de le rebrancher ailleurs (ex. BackdropOrbs, désormais superflu, n'a plus besoin d'être ajouté à la main).
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { useThemeColors } from "../theme/colors";
import { FluidBackground } from "./FluidBackground";

export function ScreenBackground({ children }: { children: ReactNode }) {
  const colors = useThemeColors();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.backgroundGradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <FluidBackground />
      {children}
    </View>
  );
}

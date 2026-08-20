// Fond dégradé premium de chaque écran — pose le "glass" de GlassCard.tsx en valeur (voir
// theme/colors.ts backgroundGradient). À utiliser comme wrapper racine de tout écran, en remplacement
// d'un simple <View style={{ backgroundColor: colors.background }}>.
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { useThemeColors } from "../theme/colors";

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
      {children}
    </View>
  );
}

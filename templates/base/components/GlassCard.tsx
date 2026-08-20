// Carte "verre dépoli" premium — brique de base du design system glass (voir theme/colors.ts
// glass/glassBorder/glassTint). Utilisée sur tous les écrans à la place des View à fond plein.
import { BlurView } from "expo-blur";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { useThemeColors } from "../theme/colors";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
};

export function GlassCard({ children, style, intensity = 36 }: Props) {
  const colors = useThemeColors();
  return (
    <View style={[styles.wrapper, { borderColor: colors.glassBorder, backgroundColor: colors.glass }, style]}>
      <BlurView intensity={intensity} tint={colors.glassTint} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  content: {
    padding: 18,
  },
});

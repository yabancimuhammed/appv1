// Bulles floues décoratives en fond de header — apporte la profondeur "glass" sans dépendre d'une image
// externe. Purement décoratif, posé derrière le contenu (voir sign-in.tsx, paywall.tsx, index.tsx).
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { useThemeColors } from "../theme/colors";

export function BackdropOrbs() {
  const colors = useThemeColors();
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320, overflow: "hidden" }}>
      <LinearGradient
        colors={[colors.accentSoft, "transparent"]}
        style={{ position: "absolute", width: 220, height: 220, borderRadius: 110, top: -90, right: -60, opacity: 0.35 }}
      />
      <LinearGradient
        colors={[colors.accent, "transparent"]}
        style={{ position: "absolute", width: 160, height: 160, borderRadius: 80, top: 40, left: -70, opacity: 0.3 }}
      />
    </View>
  );
}

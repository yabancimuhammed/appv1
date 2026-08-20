// Fond "fluide" animé — 3 bulles de couleur qui dérivent lentement et pulsent, adoucies par un flou
// global (effet "aurora"/lava-lamp premium). Posé par ScreenBackground.tsx derrière chaque écran, donc
// actif partout sans avoir à le rebrancher écran par écran. Purement décoratif (pointerEvents "none"),
// n'intercepte jamais les touches des éléments au-dessus.
import { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useThemeColors } from "../theme/colors";

type BlobProps = {
  color: string;
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
};

function Blob({ color, size, startX, startY, endX, endY, duration }: BlobProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [duration, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [startX, endX]) },
      { translateY: interpolate(progress.value, [0, 1], [startY, endY]) },
      { scale: interpolate(progress.value, [0, 1], [1, 1.18]) },
    ],
  }));

  return (
    <Animated.View
      style={[
        { position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.5 },
        style,
      ]}
    />
  );
}

export function FluidBackground() {
  const colors = useThemeColors();
  const { width, height } = useWindowDimensions();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ flex: 1, overflow: "hidden" }}>
        <Blob
          color={colors.aurora[0]}
          size={width * 0.95}
          startX={-width * 0.35}
          startY={-height * 0.12}
          endX={-width * 0.15}
          endY={height * 0.05}
          duration={9000}
        />
        <Blob
          color={colors.aurora[1]}
          size={width * 0.85}
          startX={width * 0.35}
          startY={height * 0.05}
          endX={width * 0.55}
          endY={height * 0.25}
          duration={12000}
        />
        <Blob
          color={colors.aurora[2]}
          size={width * 0.75}
          startX={width * 0.05}
          startY={height * 0.55}
          endX={width * 0.25}
          endY={height * 0.72}
          duration={14000}
        />
        <BlurView intensity={85} tint={colors.glassTint} style={StyleSheet.absoluteFill} />
      </View>
    </View>
  );
}

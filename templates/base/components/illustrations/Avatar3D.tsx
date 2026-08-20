// Illustration "avatar" premium — un orbe en verre dégradé + silhouette abstraite, jamais une photo ou
// un corps réaliste (voir demande produit : maquettes 3D stylisées, pas de vrais corps). Trois variantes
// (feminine/masculine/neutral) différenciées par un simple contour de coiffure stylisé, pas par une
// morphologie — volontairement abstrait et inclusif.
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Circle, Path, Ellipse } from "react-native-svg";
import { useThemeColors } from "../../theme/colors";

export type AvatarVariant = "feminine" | "masculine" | "neutral";

type Props = {
  variant: AvatarVariant;
  size?: number;
};

export function Avatar3D({ variant, size = 120 }: Props) {
  const colors = useThemeColors();
  const id = `avatar-${variant}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <RadialGradient id={`${id}-orb`} cx="35%" cy="30%" r="75%">
          <Stop offset="0%" stopColor={colors.accentSoft} stopOpacity={0.95} />
          <Stop offset="55%" stopColor={colors.accent} stopOpacity={0.9} />
          <Stop offset="100%" stopColor={colors.accent} stopOpacity={0.55} />
        </RadialGradient>
        <LinearGradient id={`${id}-silhouette`} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.95} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.65} />
        </LinearGradient>
      </Defs>

      {/* Orbe de verre */}
      <Circle cx={60} cy={60} r={58} fill={`url(#${id}-orb)`} />
      <Ellipse cx={42} cy={38} rx={22} ry={14} fill="#FFFFFF" opacity={0.25} />

      {/* Silhouette abstraite (tête + épaules) — même forme de base pour les trois variantes */}
      <Path
        d="M60 78c-16 0-29 9-29 22v6h58v-6c0-13-13-22-29-22Z"
        fill={`url(#${id}-silhouette)`}
      />
      <Circle cx={60} cy={54} r={17} fill={`url(#${id}-silhouette)`} />

      {/* Accent de coiffure — seule différence entre variantes, purement décoratif */}
      {variant === "feminine" && (
        <Path
          d="M43 48c-2-14 8-24 17-24s19 10 17 24c0 4-1 8-3 11 1-9-3-15-14-15s-15 6-14 15c-2-3-3-7-3-11Z"
          fill={colors.accentSoft}
          opacity={0.85}
        />
      )}
      {variant === "masculine" && (
        <Path
          d="M44 46c-1-11 7-19 16-19s17 8 16 19c0 2 0 4-1 6-2-7-7-11-15-11s-13 4-15 11c-1-2-1-4-1-6Z"
          fill={colors.accentSoft}
          opacity={0.85}
        />
      )}
      {variant === "neutral" && <Circle cx={60} cy={44} r={15} fill={colors.accentSoft} opacity={0.5} />}
    </Svg>
  );
}

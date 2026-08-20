// Bouton "chip" sélectionnable — utilisé pour les choix courts à choix unique (environnement du repas,
// etc.). Style glass cohérent avec GlassCard mais plus léger (pas de blur, juste un fond translucide).
import { Pressable, Text } from "react-native";
import { useThemeColors } from "../theme/colors";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.glassBorder,
        backgroundColor: selected ? colors.accent : colors.glass,
      }}
    >
      <Text style={{ color: selected ? colors.onAccent : colors.text, fontWeight: "600", fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}

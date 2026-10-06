import { Pressable, Text } from 'react-native';
import { CHOICE_META } from '../../constants/game.constants';
import { useTheme } from '../../context/ThemeContext';
import type { Choice } from '../../types/types';
import { getStyles } from './ChoiceButton.styles';

interface ChoiceButtonProps {
  choice: Choice;
  selected: boolean;
  disabled: boolean;
  onPress: (choice: Choice) => void;
}

/** Reusable pick button (rock/paper/scissors/lizard/spock). */
export default function ChoiceButton({ choice, selected, disabled, onPress }: ChoiceButtonProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const meta = CHOICE_META[choice];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={meta.actionLabel}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={() => onPress(choice)}
      style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
    >
      <Text style={styles.choiceEmoji}>{meta.emoji}</Text>
      <Text style={styles.choiceLabel}>{meta.label}</Text>
    </Pressable>
  );
}

import { StyleSheet, type ViewStyle } from 'react-native';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    choiceButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderRadius: 16,
      backgroundColor: theme.background,
      borderWidth: 2,
      borderColor: theme.border,
      gap: 8,
    },
    choiceButtonSelected: {
      borderColor: theme.accent,
      borderWidth: 3,
      shadowColor: theme.accent,
      shadowOpacity: 0.6,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 6,
    },
    choiceButtonActive: {
      borderColor: theme.accent,
    },
    choiceEmoji: {
      fontSize: 40,
    },
    choiceLabel: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
};

export interface ChoiceButtonVisualState {
  selected: boolean;
  pressed?: boolean;
}

type ChoiceButtonStyles = ReturnType<typeof getStyles>;

/**
 * El brillo/border de selección persiste mientras `selected` sea true.
 * Game mantiene `selected={playerPick === choice}` durante toda la ronda
 * (pick -> thinking -> resultado) y solo lo limpia al resetear la ronda,
 * así el hover/pressed solo es un preview y nunca sustituye al seleccionado.
 */
export function resolveChoiceButtonStyle(
  styles: ChoiceButtonStyles,
  { selected, pressed }: ChoiceButtonVisualState,
): Array<ViewStyle> {
  if (selected) {
    return [styles.choiceButton, styles.choiceButtonSelected];
  }
  if (pressed === true) {
    return [styles.choiceButton, styles.choiceButtonActive];
  }
  return [styles.choiceButton];
}

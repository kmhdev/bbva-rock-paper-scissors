import { StyleSheet } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../../constants/layout.constants';
import type { ThemeColors } from '../../types/types';
import {
  SEGMENTED_TOGGLE_HEIGHT_COMPACT,
  SEGMENTED_TOGGLE_PADDING_COMPACT,
  SEGMENTED_TOGGLE_PADDING_FILL,
  SEGMENTED_TOGGLE_WIDTH_COMPACT,
} from './SegmentedToggle.helpers';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    wrapperFill: {
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
    },
    wrapperCompact: {
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    topLabel: {
      color: theme.textMuted,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    trackFill: {
      flexDirection: 'row',
      width: '100%',
      padding: SEGMENTED_TOGGLE_PADDING_FILL,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      position: 'relative',
    },
    trackCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      width: SEGMENTED_TOGGLE_WIDTH_COMPACT,
      height: SEGMENTED_TOGGLE_HEIGHT_COMPACT,
      padding: SEGMENTED_TOGGLE_PADDING_COMPACT,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      position: 'relative',
    },
    trackDisabled: {
      opacity: 0.5,
    },
    pillFill: {
      position: 'absolute',
      top: SEGMENTED_TOGGLE_PADDING_FILL,
      bottom: SEGMENTED_TOGGLE_PADDING_FILL,
      left: SEGMENTED_TOGGLE_PADDING_FILL,
      borderRadius: 999,
      backgroundColor: theme.accent,
      shadowColor: '#000000',
      shadowOpacity: 0.18,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    pillCompact: {
      position: 'absolute',
      top: SEGMENTED_TOGGLE_PADDING_COMPACT,
      bottom: SEGMENTED_TOGGLE_PADDING_COMPACT,
      left: SEGMENTED_TOGGLE_PADDING_COMPACT,
      borderRadius: 999,
      backgroundColor: theme.accent,
      shadowColor: '#000000',
      shadowOpacity: 0.18,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    segmentFill: {
      flex: 1,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 6,
      gap: 6,
      zIndex: 1,
    },
    segmentCompact: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    segmentEmoji: {
      fontSize: 16,
    },
    labelFill: {
      fontSize: 14,
      fontWeight: '700',
    },
    labelCompact: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    labelActive: {
      color: '#ffffff',
    },
    labelInactive: {
      color: theme.textMuted,
    },
  });
};

// ---------------------------------------------------------------------------
// Helpers de animación en ./SegmentedToggle.helpers.ts (según AGENTS.md la
// lógica propia vive en .helpers.ts; aquí solo quedan los estilos).
// ---------------------------------------------------------------------------

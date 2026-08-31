import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';

export function useColors() {
  const scheme = useColorScheme();
  const palette =
    scheme === 'dark' && 'dark' in colors
      ? (colors as unknown as Record<string, typeof colors.light>).dark
      : colors.light;

  return {
    ...palette,
    radius: colors.radius,
    // Keep the source design tokens available to newer screens.
    textSecondary: palette.mutedForeground,
    success: palette.online,
    error: palette.destructive,
    warning: palette.accent,
    cardBackground: palette.card,
  };
}
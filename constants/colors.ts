import { useColorScheme } from 'react-native';

const BRAND_COLORS = {
  primary: '#2c9931',
  primaryDark: '#207926',
  primaryLight: '#e5fae2',
  success: '#2e7d32',
  warning: '#ff9800',
  error: '#d32f2f',
  info: '#1976d2',
};

export const LIGHT_COLORS = {
  ...BRAND_COLORS,
  background: '#e6fde3',
  surface: '#ffffff',
  text: '#1b1b1b',
  textSecondary: '#666666',
  border: '#d6efd2',
  inputSurface: '#ffffff',
  mutedBorder: '#d6e4f0',
  emptyText: '#777777',
  iconMuted: '#999999',
  textTilte: '#207926'
};

export const DARK_COLORS = {
  ...BRAND_COLORS,
  primaryLight: '#2f5e33',
  // Le mode sombre ne remplace que les neutres pour préserver les couleurs de marque.
  background: '#0b0f0b',
  surface: '#383b38',
  text: '#f4f7f4',
  textSecondary: '#c7d0c7',
  border: '#334033',
  inputSurface: '#151c15',
  mutedBorder: '#1ed61e',
  emptyText: '#b5bdb5',
  iconMuted: '#aab3aa',
  textTilte: '#33b32f'
};

export type AppColors = typeof LIGHT_COLORS;

export const COLORS = LIGHT_COLORS;

export function getAppColors(isDark: boolean): AppColors {
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}

export function useAppColors(): AppColors {
  const colorScheme = useColorScheme();

  // Détection automatique du thème système Expo/React Native.
  return getAppColors(colorScheme === 'dark');
}

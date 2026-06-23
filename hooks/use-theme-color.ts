import { useColorScheme } from 'react-native';

import { useAppColors, type AppColors } from '@/constants/colors';

type ThemeProps = {
  light?: string;
  dark?: string;
};

export function useThemeColor(props: ThemeProps, colorName: keyof AppColors) {
  const scheme = useColorScheme();
  const colors = useAppColors();
  const colorFromProps = scheme === 'dark' ? props.dark : props.light;

  // Les composants génériques lisent aussi le thème centralisé.
  return colorFromProps ?? colors[colorName];
}

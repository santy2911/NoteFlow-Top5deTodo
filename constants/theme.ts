import { useColorScheme } from 'react-native';


export const colors = {

  categories: {
    musica: '#7c3aed',
    peliculas: '#e11d48',
    series: '#f6ff00',
    comida: '#d97706',
    deporte: '#059669',
    videojuegos: '#2563eb',
    otros: '#6b7280',
  },


  dark: {
    background: '#0f0f1a',
    surface: '#1a1a2e',
    card: '#16213e',
    border: '#2a2a4a',
    text: {
      primary: '#ffffff',
      secondary: '#a0a0b0',
      muted: '#666680',
    },
    primary: '#7c3aed',
    primaryLight: '#a855f7',
  },


  light: {
    background: '#f5f5f5',
    surface: '#ffffff',
    card: '#ffffff',
    border: '#e0e0e0',
    text: {
      primary: '#1a1a2e',
      secondary: '#4a4a6a',
      muted: '#9090a0',
    },
    primary: '#7c3aed',
    primaryLight: '#a855f7',
  },
};


export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};


export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};


export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};


export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    colors: isDark ? colors.dark : colors.light,
    categories: colors.categories,
    typography,
    spacing,
    borderRadius,
  };
}
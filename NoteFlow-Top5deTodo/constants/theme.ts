export const colors = {
  categories: {
    musica: '#ec4899',
    películas: '#f97316',
    peliculas: '#f97316',
    series: '#06b6d4',
    comida: '#f59e0b',
    deporte: '#10b981',
    deportes: '#10b981',
    videojuegos: '#3b82f6',
    libros: '#a855f7',
    viajes: '#14b8a6',
    otros: '#7c3aed',
  },
  dark: {
    background: '#090916',
    surface: '#151529',
    card: '#17172b',
    elevated: '#1c1c34',
    border: '#2a2a4a',
    text: {
      primary: '#ffffff',
      secondary: '#a2a0c5',
      muted: '#666684',
    },
    primary: '#8b3ff5',
    primaryLight: '#c084fc',
    pink: '#ec4899',
    gold: '#f59e0b',
    silver: '#a8b4c8',
    bronze: '#cd7c3a',
    danger: '#ef4444',
  },
  light: {
    background: '#f5f5f5',
    surface: '#ffffff',
    card: '#ffffff',
    elevated: '#ffffff',
    border: '#e0e0e0',
    text: {
      primary: '#1a1a2e',
      secondary: '#4a4a6a',
      muted: '#9090a0',
    },
    primary: '#7c3aed',
    primaryLight: '#a855f7',
    pink: '#ec4899',
    gold: '#f59e0b',
    silver: '#94a3b8',
    bronze: '#cd7c3a',
    danger: '#ef4444',
  },
};

export const palette = {
  background: '#090916',
  surface: '#151529',
  card: '#17172b',
  cardDark: '#242424',
  border: '#2a2a4a',
  borderSoft: '#252540',
  text: '#ffffff',
  textSoft: '#a2a0c5',
  textMuted: '#666684',
  purple: '#8b3ff5',
  purpleLight: '#c084fc',
  pink: '#ec4899',
  gold: '#f59e0b',
  silver: '#a8b4c8',
  bronze: '#cd7c3a',
  danger: '#ef4444',
};

export const medalColors = [palette.gold, palette.silver, palette.bronze];
export const medalEmojis = ['🏅', '🥈', '🥉'];

export function normalizeCategory(category: string) {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function getCategoryColor(category: string): string {
  const key = normalizeCategory(category) as keyof typeof colors.categories;
  return colors.categories[key] ?? colors.categories.otros;
}

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
  return {
    isDark: true,
    colors: colors.dark,
    categories: colors.categories,
    typography,
    spacing,
    borderRadius,
  };
}

export const theme = {
  colors: {
    background: '#0D0D0F',
    card: '#16161A',
    cardElevated: '#1C1C21',
    primary: '#D94B4B',
    primaryHover: '#E86A6A',
    primaryDark: '#8b0000',
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    border: '#27272A',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    accent: '#FBBF24',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
      fontFamily: 'Vazirmatn-Bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 32,
      fontFamily: 'Vazirmatn-Bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      fontFamily: 'Vazirmatn-Bold',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      fontFamily: 'Vazirmatn-Regular',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      fontFamily: 'Vazirmatn-Regular',
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 18,
      fontFamily: 'Vazirmatn-Regular',
    },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  opacity: {
    disabled: 0.5,
    hover: 0.9,
  },
  inputOutline: {
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  gradients: {
    primary: ['#D94B4B', '#E86A6A'] as const,
    header: ['#1a1a1e', '#0D0D0F'] as const,
  },
};

export type Theme = typeof theme;

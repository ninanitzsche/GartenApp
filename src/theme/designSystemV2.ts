/**
 * Modern 2026 Design System V2
 * Glassmorphism + Bold Cards + Dark Mode Support
 */

export const LightColors = {
  // Primary
  primary: '#2D9D4F',
  primaryLight: '#4CAF50',
  primaryDark: '#1B7A37',
  
  // Backgrounds
  bg: '#FAFAFA',
  bgSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  
  // Text
  text: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#999999',
  textLight: '#BBBBBB',
  
  // Glass
  glass: {
    light: 'rgba(255,255,255,0.72)',
    medium: 'rgba(255,255,255,0.85)',
    dark: 'rgba(0,0,0,0.15)',
    tint: 'rgba(45,157,79,0.08)',
    border: 'rgba(255,255,255,0.3)',
  },
  
  // Seasonal
  seasonal: {
    spring: { bg: '#F0FAF0', accent: '#2D9D4F' },
    summer: { bg: '#FFF8E7', accent: '#E8943A' },
    autumn: { bg: '#FFF0E7', accent: '#D4633A' },
    winter: { bg: '#F0F4FA', accent: '#5B8DEF' },
  },
  
  // Gradients
  gradients: {
    spring: ['#E8F5E9', '#C8E6C9'],
    summer: ['#FFF8E1', '#FFECB3'],
    autumn: ['#FBE9E7', '#FFCCBC'],
    winter: ['#E3F2FD', '#BBDEFB'],
  },
  
  // Status
  status: {
    success: '#2D9D4F',
    warning: '#FFA726',
    error: '#E53935',
    info: '#5B8DEF',
  },
  
  // Plant Status
  plantStatus: {
    geplant: '#5B8DEF',
    bestellt: '#FFA726',
    ausgesät: '#5B8DEF',
    pikiert: '#1976D2',
    ausgepflanzt: '#2D9D4F',
    etabliert: '#2D9D4F',
    geerntet: '#FF7043',
    unklar: '#999999',
    entfernt: '#BDBDBD',
  },
  
  // Priority
  priority: {
    hoch: '#E53935',
    mittel: '#FFA726',
    niedrig: '#2D9D4F',
  },
  
  // Tabs
  tab: {
    active: '#2D9D4F',
    inactive: '#9E9E9E',
  },
  
  // Borders
  border: '#E8E8E8',
  divider: '#F0F0F0',
};

export const DarkColors = {
  // Primary
  primary: '#4CAF50',
  primaryLight: '#66BB6A',
  primaryDark: '#388E3C',
  
  // Backgrounds
  bg: '#121212',
  bgSecondary: '#1E1E1E',
  surface: '#1E1E1E',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#777777',
  textLight: '#555555',
  
  // Glass
  glass: {
    light: 'rgba(30,30,30,0.72)',
    medium: 'rgba(30,30,30,0.85)',
    dark: 'rgba(0,0,0,0.4)',
    tint: 'rgba(76,175,80,0.15)',
    border: 'rgba(255,255,255,0.1)',
  },
  
  // Seasonal
  seasonal: {
    spring: { bg: '#1A2E1A', accent: '#4CAF50' },
    summer: { bg: '#2E2A1A', accent: '#FFA726' },
    autumn: { bg: '#2E1A1A', accent: '#FF7043' },
    winter: { bg: '#1A1E2E', accent: '#5B8DEF' },
  },
  
  // Gradients
  gradients: {
    spring: ['#2E3B2E', '#1E2B1E'],
    summer: ['#3B3A2E', '#2B2A1E'],
    autumn: ['#3B2E2E', '#2B1E1E'],
    winter: ['#2E2E3B', '#1E1E2B'],
  },
  
  // Status
  status: {
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#5B8DEF',
  },
  
  // Plant Status
  plantStatus: {
    geplant: '#5B8DEF',
    bestellt: '#FFA726',
    ausgesät: '#5B8DEF',
    pikiert: '#64B5F6',
    ausgepflanzt: '#4CAF50',
    etabliert: '#4CAF50',
    geerntet: '#FF7043',
    unklar: '#777777',
    entfernt: '#555555',
  },
  
  // Priority
  priority: {
    hoch: '#EF5350',
    mittel: '#FFA726',
    niedrig: '#4CAF50',
  },
  
  // Tabs
  tab: {
    active: '#4CAF50',
    inactive: '#777777',
  },
  
  // Borders
  border: '#333333',
  divider: '#2A2A2A',
};

export type ThemeColors = typeof LightColors;

export const Spacing2026 = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius2026 = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  round: 999,
};

export const Typography2026 = {
  display: {
    fontSize: 34,
    fontWeight: '800' as const,
    letterSpacing: -1.5,
    lineHeight: 40,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 16,
  },
};

export const Shadows2026 = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  glow: {
    shadowColor: '#2D9D4F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const getSeasonalColor = (zeitraum: string, colors: ThemeColors = LightColors): { bg: string; accent: string } => {
  if (zeitraum.includes('fruehjahr') || zeitraum.includes('spring')) return colors.seasonal.spring;
  if (zeitraum.includes('sommer') || zeitraum.includes('summer')) return colors.seasonal.summer;
  if (zeitraum.includes('herbst') || zeitraum.includes('autumn')) return colors.seasonal.autumn;
  if (zeitraum.includes('winter')) return colors.seasonal.winter;
  return colors.seasonal.spring;
};

export const getSeasonalGradient = (zeitraum: string): string[] => {
  if (zeitraum.includes('fruehjahr')) return LightColors.gradients.spring;
  if (zeitraum.includes('sommer')) return LightColors.gradients.summer;
  if (zeitraum.includes('herbst')) return LightColors.gradients.autumn;
  if (zeitraum.includes('winter')) return LightColors.gradients.winter;
  return LightColors.gradients.spring;
};

// Backwards compatibility
export const Colors2026 = LightColors;

export default {
  light: LightColors,
  dark: DarkColors,
  spacing: Spacing2026,
  radius: Radius2026,
  typography: Typography2026,
  shadows: Shadows2026,
};

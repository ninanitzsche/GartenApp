/**
 * Premium Design System V3
 * Eleganter 2026er Style mit warmen Erdtönen
 */

export const PremiumColors = {
  // Primary - Waldgrün (elegant, ruhevoll)
  primary: '#2D4739',
  primaryLight: '#3D5A4A',
  primaryDark: '#1E3329',
  
  // Accent - Teal (modern, transformativ)
  accent: '#006064',
  accentLight: '#00838F',
  
  // Background - Off-White/Beige (warm, hochwertig)
  bg: '#F5F2ED',
  bgSecondary: '#EDE9E3',
  surface: '#FDFCFA',
  
  // Text - Warm-dark
  text: '#2C2C2C',
  textSecondary: '#5A5A5A',
  textMuted: '#8A8A8A',
  textLight: '#B0B0B0',
  textDisabled: '#C0C0B0',
  background: '#F5F2ED', // Alias for bg
  
  // Glass
  glass: {
    light: 'rgba(253,252,250,0.72)',
    medium: 'rgba(253,252,250,0.85)',
    dark: 'rgba(44,44,44,0.08)',
    tint: 'rgba(45,87,57,0.08)',
    border: 'rgba(253,252,250,0.5)',
  },
  
  // Seasonal - angepasst
  seasonal: {
    spring: { bg: '#F0F5F0', accent: '#2D4739' },
    summer: { bg: '#F5F0E8', accent: '#006064' },
    autumn: { bg: '#F5EDE8', accent: '#8D5B3E' },
    winter: { bg: '#EDF0F5', accent: '#4A6FA5' },
  },
  
  // Status
  status: {
    success: '#2D4739',
    warning: '#8D5B3E',  // Terracotta statt Orange
    error: '#B33A3A',
    info: '#4A6FA5',
  },
  
  // Plant Status
  plantStatus: {
    geplant: '#4A6FA5',
    bestellt: '#8D5B3E',
    ausgesät: '#4A6FA5',
    pikiert: '#006064',
    ausgepflanzt: '#2D4739',
    etabliert: '#2D4739',
    geerntet: '#C67B4A',
    unklar: '#8A8A8A',
    entfernt: '#C0C0C0',
  },
  
  // Priority
  priority: {
    hoch: '#B33A3A',
    mittel: '#8D5B3E',
    niedrig: '#2D4739',
  },
  
  // Borders - weicher
  border: '#E5E2DC',
  divider: '#F0EDE8',
  
  // Tab
  tab: {
    active: '#2D4739',
    inactive: '#8A8A8A',
  },
};

export const PremiumSpacing = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 32,
  xxxl: 48,
};

export const PremiumTouchTargets = {
  minimum: 44,
  medium: 48,
  large: 56,
  icon: 44,
};

export const PremiumRadius = {
  sm: 16,   // Erhöht
  md: 20,   // Erhöht
  lg: 24,   // Erhöht
  xl: 32,   // Erhöht
  round: 999,
};

export const PremiumTypography = {
  display: {
    fontSize: 36,      // Etwas größer
    fontWeight: '700' as const,
    letterSpacing: -1.2,
    lineHeight: 44,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 26,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
};

export const PremiumShadows = {
  soft: {
    shadowColor: '#2D4739',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  medium: {
    shadowColor: '#2D4739',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  strong: {
    shadowColor: '#2D4739',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 12,
  },
  sm: {
    shadowColor: '#2D4739',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D4739',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 6,
  },
  lg: {
    shadowColor: '#2D4739',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 36,
    elevation: 10,
  },
  glass: {
    shadowColor: '#2D4739',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
};

// Alias für Kompatibilität
export const LightColors = PremiumColors;
export const Spacing2026 = PremiumSpacing;
export const Radius2026 = PremiumRadius;
export const Typography2026 = PremiumTypography;
export const Shadows2026 = PremiumShadows;
export const Colors2026 = PremiumColors;
export const TouchTargets2026 = PremiumTouchTargets;

export type ThemeColors = typeof PremiumColors;

export const DarkColors: ThemeColors = {
  ...PremiumColors,
  primary: '#5B8A6F',
  primaryLight: '#7BA88D',
  primaryDark: '#3D5A4A',
  bg: '#1A1A1A',
  bgSecondary: '#242424',
  background: '#1A1A1A',
  surface: '#2A2A2A',
  text: '#F5F0EB',
  textSecondary: '#B8B0A8',
  textMuted: '#7A7268',
  textLight: '#5A5248',
  textDisabled: '#4A4238',
  border: '#3A3A3A',
  divider: '#2E2E2E',
  glass: {
    light: 'rgba(255,255,255,0.08)',
    medium: 'rgba(255,255,255,0.12)',
    dark: 'rgba(0,0,0,0.4)',
    tint: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.15)',
  },
  seasonal: {
    spring: { bg: '#1E2E1E', accent: '#5B8A6F' },
    summer: { bg: '#2E2A1E', accent: '#4A8A8F' },
    autumn: { bg: '#2E241E', accent: '#A07050' },
    winter: { bg: '#1E2230', accent: '#6090C0' },
  },
  status: {
    success: '#5B8A6F',
    warning: '#C08050',
    error: '#D05050',
    info: '#6090C0',
  },
  tab: {
    active: '#5B8A6F',
    inactive: '#7A7268',
  },
};

export function getSeasonalColor(zeitraum: string, colors: typeof PremiumColors = PremiumColors): { bg: string; accent: string } {
  if (zeitraum.includes('fruehjahr') || zeitraum.includes('spring')) return colors.seasonal.spring;
  if (zeitraum.includes('sommer') || zeitraum.includes('summer')) return colors.seasonal.summer;
  if (zeitraum.includes('herbst') || zeitraum.includes('autumn')) return colors.seasonal.autumn;
  if (zeitraum.includes('winter')) return colors.seasonal.winter;
  return colors.seasonal.spring;
}

export default {
  colors: PremiumColors,
  spacing: PremiumSpacing,
  radius: PremiumRadius,
  typography: PremiumTypography,
  shadows: PremiumShadows,
};

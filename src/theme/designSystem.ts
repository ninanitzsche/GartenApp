/**
 * Modern 2026 Design System
 */

export const Theme = {
  colors: {
    // Primary
    primary: '#2D9D4F',
    primaryLight: '#4CAF50',
    
    // Backgrounds
    bg: '#FAFAFA',
    bgSecondary: '#F5F5F5',
    surface: '#FFFFFF',
    
    // Text
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    
    // Status
    success: '#2D9D4F',
    warning: '#FFA726',
    error: '#E53935',
    info: '#5B8DEF',
    
    // Borders
    border: '#E8E8E8',
    
    // Seasonal
    spring: { bg: '#F0FAF0', accent: '#2D9D4F' },
    summer: { bg: '#FFF8E7', accent: '#E8943A' },
    autumn: { bg: '#FFF0E7', accent: '#D4633A' },
    winter: { bg: '#F0F4FA', accent: '#5B8DEF' },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 999,
  },
  
  typography: {
    title: {
      fontSize: 34,
      fontWeight: '800' as const,
      letterSpacing: -1,
    },
    headline: {
      fontSize: 24,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    section: {
      fontSize: 18,
      fontWeight: '700' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '500' as const,
    },
    caption: {
      fontSize: 13,
      fontWeight: '500' as const,
    },
    small: {
      fontSize: 11,
      fontWeight: '500' as const,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

export const PlantColors: Record<string, string> = {
  tomate: '#E53935', paprika: '#FB8C00', gurke: '#43A047',
  zucchini: '#7CB342', moehre: '#FF7043', radieschen: '#EC407A',
  spinat: '#66BB6A', salat: '#26A69A', rucola: '#9CCC65',
  zwiebel: '#8D6E63', knoblauch: '#A1887F', basilikum: '#4CAF50',
  petersilie: '#2E7D32', schnittlauch: '#689F38', bohne: '#558B2F',
  erbsen: '#7CB342', kohl: '#388E3C', brokkoli: '#4CAF50',
  kartoffeln: '#A1887F', kuerbis: '#EF6C00', lauch: '#43A047',
  default: '#56AB2F',
};

export const getPlantColor = (name: string): string => {
  const n = name.toLowerCase().replace(/[öüä]/g, (c: string) => ({ö:'o',ü:'u',ä:'a'}[c] || c));
  for (const [k, v] of Object.entries(PlantColors)) if (n.includes(k)) return v;
  return PlantColors.default;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    geplant: '#5B8DEF',
    bestellt: '#FFA726',
    ausgesät: '#5B8DEF',
    pikiert: '#1976D2',
    ausgepflanzt: '#2D9D4F',
    etabliert: '#2D9D4F',
    geerntet: '#FF7043',
    unklar: '#999999',
    entfernt: '#BDBDBD',
  };
  return colors[status.toLowerCase()] || '#999999';
};

export const getStatusLabel = (statusValue: string): string => {
  const statusMap: Record<string, string> = {
    geplant: 'Geplant',
    bestellt: 'Bestellt',
    ausgesät: 'Ausgesät',
    pikiert: 'Pikiert',
    ausgepflanzt: 'Ausgepflanzt',
    etabliert: 'Etabliert',
    geerntet: 'Geerntet',
    unklar: 'Unklar',
    entfernt: 'Entfernt',
  };
  return statusMap[statusValue.toLowerCase()] || statusValue;
};

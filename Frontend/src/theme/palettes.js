export const PALETTES = [
  {
    key: 'classicBlue',
    name: 'Classic Blue',
    colors: {
      primary: '#2563EB',
      secondary: '#1E3A8A',
      accent: '#F59E0B',
      neutral: '#334155',
      base100: '#FFFFFF',
      base200: '#F1F5F9',
      baseContent: '#0F172A'
    }
  },
  {
    key: 'emerald',
    name: 'Emerald Fresh',
    colors: {
      primary: '#059669',
      secondary: '#065F46',
      accent: '#FBBF24',
      neutral: '#374151',
      base100: '#FFFFFF',
      base200: '#F0FDF4',
      baseContent: '#111827'
    }
  },
  {
    key: 'sunset',
    name: 'Sunset Glow',
    colors: {
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#6366F1',
      neutral: '#404040',
      base100: '#FFFFFF',
      base200: '#FFF7ED',
      baseContent: '#1C1917'
    }
  },
  {
    key: 'royal',
    name: 'Royal Purple',
    colors: {
      primary: '#6D28D9',
      secondary: '#4C1D95',
      accent: '#06B6D4',
      neutral: '#312E81',
      base100: '#FFFFFF',
      base200: '#EDE9FE',
      baseContent: '#111827'
    }
  },
  {
    key: 'graphite',
    name: 'Graphite Dark',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#10B981',
      neutral: '#1E293B',
      base100: '#0F172A',
      base200: '#1E293B',
      baseContent: '#F1F5F9'
    }
  },
  {
    key: 'vibrant',
    name: 'Vibrant Fusion',
    colors: {
      primary: '#D946EF',
      secondary: '#F43F5E',
      accent: '#22D3EE',
      neutral: '#334155',
      base100: '#FFFFFF',
      base200: '#FDF2F8',
      baseContent: '#111827'
    }
  }
];

export function paletteToCssVars(colors){
  return {
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
    '--color-neutral': colors.neutral,
    '--color-base-100': colors.base100,
    '--color-base-200': colors.base200,
    '--color-base-content': colors.baseContent
  };
}

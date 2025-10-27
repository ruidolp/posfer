// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeType } from '@/types';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'high_contrast',
      setTheme: (theme) => {
        set({ theme });
        // Aplicar tema al documento
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
    }),
    {
      name: 'pos-theme-storage',
    }
  )
);

export const themes = [
  {
    id: 'high_contrast' as ThemeType,
    name: 'Alto Contraste',
    description: 'Máxima legibilidad, ideal para cualquier condición',
    preview: {
      primary: '#000000',
      secondary: '#F5F5F5',
      background: '#FFFFFF',
    },
  },
  {
    id: 'sunny_day' as ThemeType,
    name: 'Día Soleado',
    description: 'Optimizado para luz brillante',
    preview: {
      primary: '#1E40AF',
      secondary: '#FCD34D',
      background: '#EFF6FF',
    },
  },
  {
    id: 'cloudy' as ThemeType,
    name: 'Nublado',
    description: 'Suave y cómodo para días grises',
    preview: {
      primary: '#059669',
      secondary: '#CBD5E1',
      background: '#F1F5F9',
    },
  },
  {
    id: 'sunset' as ThemeType,
    name: 'Atardecer',
    description: 'Cálido y agradable',
    preview: {
      primary: '#DC2626',
      secondary: '#FDE68A',
      background: '#FEF3C7',
    },
  },
];

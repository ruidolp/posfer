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
        // Aplicar el tema al HTML
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
        set({ theme });
      },
    }),
    {
      name: 'pos-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Aplicar tema guardado al cargar
        if (state?.theme && typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);

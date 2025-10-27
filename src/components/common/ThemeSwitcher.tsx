// src/components/common/ThemeSwitcher.tsx
'use client';

import { useThemeStore, themes } from '@/stores/themeStore';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'min-h-touch bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80 transition-colors'
        )}
      >
        <Palette className="w-5 h-5" />
        <span className="font-medium">Tema</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-lg">Selecciona un Tema</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Optimizado para uso en exteriores
              </p>
            </div>

            <div className="p-2 max-h-96 overflow-y-auto">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg',
                    'hover:bg-secondary transition-colors',
                    theme === t.id && 'bg-primary/10'
                  )}
                >
                  {/* Preview */}
                  <div className="flex gap-1 mt-1">
                    <div
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: t.preview.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: t.preview.secondary }}
                    />
                    <div
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: t.preview.background }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{t.name}</h4>
                      {theme === t.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

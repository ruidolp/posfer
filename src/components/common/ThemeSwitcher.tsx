// src/components/common/ThemeSwitcher.tsx
'use client';

import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

const THEMES = [
  { value: 'high_contrast', label: 'Alto Contraste', emoji: '⚫' },
  { value: 'sunny_day', label: 'Día Soleado', emoji: '☀️' },
  { value: 'cloudy', label: 'Nublado', emoji: '☁️' },
  { value: 'sunset', label: 'Atardecer', emoji: '🌅' },
] as const;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="bg-card border-2 border-border rounded-xl p-4">
      <h3 className="font-bold text-foreground mb-3">TEMA</h3>
      <div className="grid grid-cols-2 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={cn(
              'p-3 rounded-lg border-2 font-medium text-left transition-all',
              theme === t.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-foreground hover:border-primary/50'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-sm">{t.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

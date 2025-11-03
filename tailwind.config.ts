// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      fontSize: {
        // Tamaños optimizados para móvil y legibilidad exterior
        'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'base': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
      },
      spacing: {
        // Espaciados optimizados para touch (mínimo 44px)
        'touch': '44px',
        'touch-lg': '56px',
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '56px',
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '56px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

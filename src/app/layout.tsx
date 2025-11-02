// src/app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'POSFER — POS móvil para ferias libres y pequeños negocios',
  description: 'Controla tu negocio desde tu celular. Construido especialmente para comerciantes minoristas y trabajadores independientes. Fácil de usar, sin complicaciones. Prueba gratis 14 días.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = JSON.parse(localStorage.getItem('pos-theme-storage') || '{}').state?.theme || 'high_contrast';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {
                document.documentElement.setAttribute('data-theme', 'high_contrast');
              }
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

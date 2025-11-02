// src/app/layout.tsx
import './globals.css';
import Script from 'next/script';

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
      
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-VFFM0NHGMY"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-VFFM0NHGMY');
        `}
      </Script>
    </html>
  );
}

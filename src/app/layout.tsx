import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/components/ui/notifications";

export const metadata: Metadata = {
  title: "Tablero Estadístico de Interconexión Nacional",
  description: "Sistema de Cobertura del SAEM - Optimizado para rendimiento",
  keywords: ["tablero", "estadístico", "SAEM", "Morelos", "dashboard", "analytics"],
  authors: [{ name: "SAEM Morelos" }],
  creator: "SAEM Morelos",
  publisher: "SAEM Morelos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tablero SAEM",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.png", sizes: "any" },
      { url: "/favicon.png", sizes: "any" },
    ],
    shortcut: "/icons/favicon.png",
    apple: "/icons/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    title: "Tablero Estadístico SAEM",
    description: "Sistema de Control Estadístico del SAEM Morelos",
    siteName: "Tablero SAEM",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* AmCharts 5 Libraries */}
        <script src="/lib/mapa/index.js" async />
        <script src="/lib/mapa/map.js" async />
        <script src="/lib/mapa/themes/Animated.js" async />
        <script src="/lib/mapa/geodata/region/mexico/morLow.js" async />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevenir FOUC y optimizar carga inicial
              (function() {
                // Marcar como cargado cuando el DOM esté listo
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    document.documentElement.classList.add('loaded');
                  });
                } else {
                  document.documentElement.classList.add('loaded');
                }
              })();
            `
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
        
        {/* Script para registrar Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Registrar Service Worker si está soportado
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registrado:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW falló:', error);
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}

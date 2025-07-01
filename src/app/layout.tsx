import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/components/ui/notifications";
import { ToastProvider } from "@/contexts/toast-context";

export const metadata: Metadata = {
  title: "Plataforma de Seguimiento, Ejecución y Evaluación del Sistema Anticorrupción del Estado de Morelos",
  description: "Plataforma integral para el seguimiento, ejecución y evaluación del SAEM - Optimizada para rendimiento",
  keywords: ["plataforma", "seguimiento", "evaluación", "SAEM", "Morelos", "anticorrupción", "dashboard", "analytics"],
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
    title: "Plataforma SAEM",
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
    title: "Plataforma de Seguimiento SAEM",
    description: "Plataforma de Seguimiento, Ejecución y Evaluación del Sistema Anticorrupción del Estado de Morelos",
    siteName: "Plataforma SAEM",
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
            <ToastProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
        
        {/* Script para cargar AmCharts de manera segura */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Cargar AmCharts de manera segura con verificaciones adicionales
              (function() {
                if (typeof window === 'undefined') return;
                
                // Verificar si ya se están cargando las librerías
                if (window.amChartsLoading) return;
                window.amChartsLoading = true;
                
                const scripts = [
                  '/lib/mapa/index.js',
                  '/lib/mapa/map.js',
                  '/lib/mapa/themes/Animated.js',
                  '/lib/mapa/geodata/region/mexico/morLow.js'
                ];
                
                function loadScript(src) {
                  return new Promise((resolve, reject) => {
                    // Verificar si el script ya existe
                    const existingScript = document.querySelector('script[src="' + src + '"]');
                    if (existingScript) {
                      resolve();
                      return;
                    }
                    
                    const script = document.createElement('script');
                    script.src = src;
                    script.async = true;
                    script.setAttribute('data-amcharts', 'true');
                    
                    script.onload = function() {
                      console.log('AmCharts script loaded:', src);
                      resolve();
                    };
                    
                    script.onerror = function(error) {
                      console.warn('Failed to load AmCharts script:', src, error);
                      resolve(); // Continuar aunque falle
                    };
                    
                    document.head.appendChild(script);
                  });
                }
                
                // Cargar scripts secuencialmente con delay
                let promise = Promise.resolve();
                scripts.forEach((src, index) => {
                  promise = promise.then(() => {
                    return new Promise(resolve => {
                      // Pequeño delay entre scripts para evitar conflictos
                      setTimeout(() => {
                        loadScript(src).then(resolve);
                      }, index * 100);
                    });
                  });
                });
                
                promise.finally(() => {
                  window.amChartsLoading = false;
                  window.amChartsLoaded = true;
                  console.log('🎉 AmCharts loading completed - Librerías disponibles:', {
                    am5: !!window.am5,
                    am5map: !!window.am5map,
                    am5themes_Animated: !!window.am5themes_Animated,
                    am5geodata_region_mexico_morLow: !!window.am5geodata_region_mexico_morLow
                  });
                });
              })();
            `
          }}
        />
        
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

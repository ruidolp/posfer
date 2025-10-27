// src/app/(dashboard)/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Wifi, WifiOff } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useThemeStore();

  // Aplicar tema al cargar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Monitorear conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-72">
        {/* Header Mobile */}
        <header className="sticky top-0 z-30 bg-card border-b border-border safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg min-h-touch min-w-touch flex items-center justify-center"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h1 className="text-lg font-bold text-foreground lg:ml-0 ml-2">
              {user?.businessName}
            </h1>

            <div className="flex items-center gap-2">
              {/* Indicador de conexión */}
              <div
                className={cn(
                  'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                  isOnline
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                )}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    <span className="hidden sm:inline">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6 safe-bottom">
          {children}
        </main>
      </div>
    </div>
  );
}

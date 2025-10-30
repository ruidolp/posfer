// src/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const PUBLIC_PATHS = ['/login', '/register'];

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Esperar a que Zustand termine de cargar desde localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // No hacer nada hasta que Zustand termine de hidratar
    if (!isHydrated) return;

    const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

    // Si no está autenticado y no es ruta pública, redirigir a login
    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
    }

    // Si está autenticado y está en login/register, redirigir a dashboard
    if (isAuthenticated && isPublicPath) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, pathname, router, isHydrated]);

  return { isAuthenticated, user, isHydrated };
}

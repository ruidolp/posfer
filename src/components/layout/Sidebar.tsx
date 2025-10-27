// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Users, 
  MapPin,
  LogOut,
  X
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    label: 'Ventas',
    icon: DollarSign,
    href: '/dashboard/ventas',
  },
  {
    label: 'Productos',
    icon: Package,
    href: '/dashboard/productos',
  },
  {
    label: 'Compras',
    icon: ShoppingBag,
    href: '/dashboard/compras',
  },
  {
    label: 'Proveedores',
    icon: Users,
    href: '/dashboard/proveedores',
  },
  {
    label: 'Ubicaciones',
    icon: MapPin,
    href: '/dashboard/ubicaciones',
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">
              {user?.businessName || 'POS Ferias'}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (pathname.startsWith(item.href + '/') && item.href !== '/dashboard/ventas');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  'min-h-touch text-base font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg w-full',
              'min-h-touch text-base font-medium',
              'text-destructive hover:bg-destructive/10 transition-colors'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

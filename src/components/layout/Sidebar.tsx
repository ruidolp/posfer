// src/components/layout/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home,
  DollarSign, 
  Package, 
  ShoppingBag, 
  Users, 
  MapPin,
  LogOut,
  X,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    label: 'Inicio',
    icon: Home,
    href: '/dashboard',
  },
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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        <div className="flex items-center justify-between p-4">
          <h2 className="text-2xl font-bold text-foreground">
            POSFER
          </h2>
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
              (pathname.startsWith(item.href + '/') && item.href !== '/dashboard/ventas' && item.href !== '/dashboard');

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

        {/* Footer - User Menu */}
        <div className="p-4 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg w-full',
              'hover:bg-secondary transition-colors'
            )}
          >
            {/* Avatar con iniciales */}
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
              {getInitials(user?.name || 'U')}
            </div>
            
            <span className="flex-1 text-left text-sm font-medium text-foreground truncate">
              {user?.name}
            </span>
            
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0",
              showUserMenu && "rotate-180"
            )} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-card border-2 border-border rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleLogout}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 w-full',
                    'text-destructive hover:bg-destructive/10 transition-colors',
                    'text-sm font-medium'
                  )}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

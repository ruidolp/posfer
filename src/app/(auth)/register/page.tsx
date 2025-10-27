// src/app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { UserPlus, User, Phone, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Concatenar +569 con el número ingresado
      const fullPhone = `+569${formData.phone}`;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          businessName: formData.name, // Usamos el mismo nombre por ahora
          phone: fullPhone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      setUser(data.data.user, data.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            POS Ferias
          </h1>
          <p className="text-muted-foreground text-lg">
            Sistema de Punto de Venta
          </p>
        </div>

        {/* Card de Registro */}
        <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Crear Cuenta
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Completa tus datos para comenzar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Campo Nombre */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre completo"
                  className={cn(
                    'w-full pl-12 pr-4 py-4 rounded-xl border-2 border-input',
                    'bg-background text-foreground text-lg',
                    'min-h-touch',
                    'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                    'transition-all'
                  )}
                  required
                  minLength={2}
                />
              </div>
            </div>

            {/* Campo Teléfono con prefijo fijo */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Teléfono
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-2 pointer-events-none">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span className="text-lg font-semibold text-foreground">+569</span>
                  <span className="text-muted-foreground">|</span>
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    // Solo permitir números y máximo 8 dígitos
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setFormData({ ...formData, phone: value });
                  }}
                  placeholder="1234 5678"
                  className={cn(
                    'w-full pl-32 pr-4 py-4 rounded-xl border-2 border-input',
                    'bg-background text-foreground text-lg',
                    'min-h-touch',
                    'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                    'transition-all'
                  )}
                  required
                  maxLength={8}
                  pattern="[0-9]{8}"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 ml-1">
                Este será tu nombre de usuario
              </p>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className={cn(
                    'w-full pl-12 pr-4 py-4 rounded-xl border-2 border-input',
                    'bg-background text-foreground text-lg',
                    'min-h-touch',
                    'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                    'transition-all'
                  )}
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 ml-1">
                Mínimo 6 caracteres
              </p>
            </div>

            {/* Botón de Registro */}
            <button
              type="submit"
              disabled={loading || formData.phone.length !== 8}
              className={cn(
                'w-full px-6 py-4 rounded-xl',
                'min-h-touch text-lg font-bold',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 active:scale-98',
                'transition-all shadow-lg hover:shadow-xl',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'flex items-center justify-center gap-2'
              )}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Crear Cuenta</span>
                </>
              )}
            </button>
          </form>

          {/* Link a Login */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?
            </p>
            <Link 
              href="/login" 
              className="inline-block mt-2 text-primary font-bold hover:underline text-base"
            >
              Iniciar sesión →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Sistema optimizado para ferias libres
        </p>
      </div>
    </div>
  );
}

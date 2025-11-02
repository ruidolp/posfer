// src/app/(dashboard)/dashboard/caja/abrir/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, MapPin } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function AbrirCajaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    openingAmount: '',
    locationId: '',
    notes: '',
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await fetch('/api/locations?active=true');
      const data = await response.json();
      
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.openingAmount || parseFloat(formData.openingAmount) < 0) {
      alert('Ingresa un monto válido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/cash-register/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openingAmount: parseFloat(formData.openingAmount),
          locationId: formData.locationId || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al abrir caja');
      }

      alert('✅ Caja abierta exitosamente');
      router.push('/dashboard/ventas/nueva');
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [0, 10000, 20000, 50000, 100000];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Abrir Caja
        </h1>
        <p className="text-muted-foreground mt-1">
          Ingresa el monto inicial con el que comenzarás
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monto inicial */}
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Monto Inicial
          </label>
          
          {/* Botones rápidos */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setFormData({ ...formData, openingAmount: amount.toString() })}
                className={cn(
                  'py-3 rounded-lg font-semibold text-base border-2',
                  formData.openingAmount === amount.toString()
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {amount === 0 ? 'Sin efectivo' : formatCurrency(amount)}
              </button>
            ))}
          </div>

          {/* Input manual */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              O ingresa otro monto:
            </label>
            <input
              type="number"
              value={formData.openingAmount}
              onChange={(e) => setFormData({ ...formData, openingAmount: e.target.value })}
              placeholder="0"
              className={cn(
                'w-full px-4 py-4 rounded-lg border-2 border-input',
                'bg-background text-foreground text-2xl font-bold text-center',
                'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
              )}
              step="1"
              min="0"
              required
            />
          </div>
        </div>

        {/* Ubicación */}
        {locations.length > 0 && (
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Ubicación (Opcional)
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              className={cn(
                'w-full px-4 py-3 rounded-lg border-2 border-input',
                'bg-background text-foreground text-base',
                'focus:outline-none focus:border-primary'
              )}
            >
              <option value="">Sin ubicación</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notas */}
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <label className="block text-lg font-semibold mb-4">
            Notas (Opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Ej: Turno mañana, caja chica, etc."
            rows={3}
            className={cn(
              'w-full px-4 py-3 rounded-lg border-2 border-input',
              'bg-background text-foreground text-base',
              'focus:outline-none focus:border-primary resize-none'
            )}
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className={cn(
              'flex-1 px-6 py-4 rounded-lg',
              'min-h-touch text-lg font-semibold',
              'bg-secondary text-secondary-foreground',
              'hover:bg-secondary/80 transition-colors'
            )}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className={cn(
              'flex-1 px-6 py-4 rounded-lg',
              'min-h-touch text-lg font-bold',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            disabled={loading}
          >
            {loading ? 'Abriendo...' : 'Abrir Caja'}
          </button>
        </div>
      </form>
    </div>
  );
}

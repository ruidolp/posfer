// src/app/(dashboard)/dashboard/caja/cerrar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function CerrarCajaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cashRegister, setCashRegister] = useState<any>(null);
  const [closingAmount, setClosingAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadCashRegister();
  }, []);

  const loadCashRegister = async () => {
    try {
      const response = await fetch('/api/cash-register/current');
      const data = await response.json();
      
      if (!data.success || !data.data) {
        alert('No hay una caja abierta para cerrar');
        router.push('/dashboard');
        return;
      }

      setCashRegister(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!closingAmount || parseFloat(closingAmount) < 0) {
      alert('Ingresa un monto válido');
      return;
    }

    if (!confirm('¿Estás seguro de cerrar la caja?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/cash-register/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingAmount: parseFloat(closingAmount),
          notes: notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cerrar caja');
      }

      alert('✅ Caja cerrada exitosamente');
      router.push('/dashboard');
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!cashRegister) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  const totalSales = cashRegister.sales?.reduce((sum: number, sale: any) => 
    sum + Number(sale.total), 0
  ) || 0;
  
  const expectedAmount = Number(cashRegister.opening_amount) + totalSales;
  const difference = closingAmount ? parseFloat(closingAmount) - expectedAmount : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Cerrar Caja
        </h1>
        <p className="text-muted-foreground mt-1">
          Revisa el resumen y cierra la caja del día
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resumen */}
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Resumen del Día</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Apertura</span>
              <span className="font-semibold">
                {formatCurrency(Number(cashRegister.opening_amount))}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Ventas del día</span>
              <span className="font-semibold text-green-600">
                +{formatCurrency(totalSales)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">N° de ventas</span>
              <span className="font-semibold">
                {cashRegister.sales?.length || 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 bg-primary/10 rounded-lg px-4">
              <span className="font-bold">Total Esperado</span>
              <span className="font-bold text-xl text-primary">
                {formatCurrency(expectedAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Monto de cierre */}
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Monto Real en Caja
          </label>
          
          <input
            type="number"
            value={closingAmount}
            onChange={(e) => setClosingAmount(e.target.value)}
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

          {closingAmount && (
            <div className={cn(
              'mt-4 p-4 rounded-lg',
              difference >= 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            )}>
              <div className="flex items-center gap-2">
                {difference >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {difference >= 0 ? 'Sobrante' : 'Faltante'}
                </span>
              </div>
              <div className={cn(
                'text-2xl font-bold mt-1',
                difference >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {formatCurrency(Math.abs(difference))}
              </div>
            </div>
          )}
        </div>

        {/* Notas */}
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <label className="block text-lg font-semibold mb-4">
            Notas de Cierre (Opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Faltante por vuelto mal dado, sobrante por..."
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
              'bg-destructive text-destructive-foreground',
              'hover:bg-destructive/90 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            disabled={loading}
          >
            {loading ? 'Cerrando...' : 'Cerrar Caja'}
          </button>
        </div>
      </form>
    </div>
  );
}

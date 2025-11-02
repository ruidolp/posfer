// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  DollarSign,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import ThemeSwitcher from '@/components/common/ThemeSwitcher';
import CloseCashModal from '@/components/cash/CloseCashModal';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [cashRegister, setCashRegister] = useState<any>(null);
  const [todaySales, setTodaySales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar caja actual
      const cashResponse = await fetch('/api/cash-register/current');
      const cashData = await cashResponse.json();
      if (cashData.success && cashData.data) {
        setCashRegister(cashData.data);
        
        // Si hay caja abierta, cargar sus ventas
        const salesResponse = await fetch(`/api/sales?cashRegisterId=${cashData.data.id}`);
        const salesData = await salesResponse.json();
        if (salesData.success) {
          setTodaySales(salesData.data);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSalesToday = todaySales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const salesCount = todaySales.length;

  // Calcular desglose de métodos de pago
  const paymentBreakdown = {
    cash: 0,
    debit: 0,
    credit: 0,
    transfer: 0,
  };

  todaySales.forEach((sale) => {
    if (sale.payments) {
      sale.payments.forEach((payment: any) => {
        const amount = Number(payment.amount);
        switch (payment.payment_method) {
          case 'cash':
            paymentBreakdown.cash += amount;
            break;
          case 'debit':
            paymentBreakdown.debit += amount;
            break;
          case 'credit':
            paymentBreakdown.credit += amount;
            break;
          case 'transfer':
            paymentBreakdown.transfer += amount;
            break;
        }
      });
    }
  });

  const handleCloseCash = async (notes?: string) => {
    try {
      const response = await fetch('/api/cash-register/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      // Verificar si la respuesta es OK antes de parsear JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert('Error al cerrar caja: ' + (errorText || 'Error desconocido'));
        return;
      }

      const result = await response.json();

      if (result.success) {
        setCashRegister(null);
        setTodaySales([]);
        setShowCloseModal(false);
        alert('Caja cerrada exitosamente');
        await loadDashboardData(); // Recargar datos
      } else {
        alert(result.error || 'Error al cerrar caja');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cerrar caja: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const salesTodayData = {
    totalSales: totalSalesToday,
    paymentBreakdown,
    salesCount,
  };

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          ¡Hola, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {formatDate(new Date(), 'long')}
        </p>
      </div>

      {/* Estado de Caja */}
      {loading ? (
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <div className="text-center py-4 text-muted-foreground">
            Cargando estado de caja...
          </div>
        </div>
      ) : cashRegister ? (
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Caja Abierta
            </h2>
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Activa
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Apertura</div>
              <div className="text-lg font-bold">
                {formatCurrency(Number(cashRegister.opening_amount))}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Ventas Hoy</div>
              <div className="text-lg font-bold text-primary">
                {salesCount}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Total Vendido</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(totalSalesToday)}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Hora Apertura</div>
              <div className="text-lg font-bold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(cashRegister.opened_at).toLocaleTimeString('es-CL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href="/dashboard/ventas/nueva"
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
                'min-h-touch text-base font-semibold',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 transition-colors'
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              Nueva Venta
            </Link>

            <button
              onClick={() => setShowCloseModal(true)}
              className={cn(
                'px-6 py-3 rounded-lg',
                'min-h-touch text-base font-semibold',
                'bg-destructive/10 text-destructive',
                'hover:bg-destructive/20 transition-colors'
              )}
            >
              Cerrar Caja
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-muted-foreground" />
              No hay caja abierta
            </h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Debes abrir una caja para comenzar a vender
          </p>
          <Link
            href="/dashboard/caja/abrir"
            className={cn(
              'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
              'min-h-touch text-base font-semibold',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <DollarSign className="w-5 h-5" />
            Abrir Caja
          </Link>
        </div>
      )}

      {/* Selector de Tema */}
      <ThemeSwitcher />

      {/* Resumen de ventas recientes */}
      {todaySales.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Últimas Ventas</h2>
            <Link
              href="/dashboard/ventas"
              className="text-primary hover:underline text-sm font-semibold"
            >
              Ver todas
            </Link>
          </div>

          <div className="space-y-2">
            {todaySales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">
                    {new Date(sale.sale_date).toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sale.items?.length || 0} items
                  </div>
                </div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(Number(sale.total))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Modal Cerrar Caja */}
      {showCloseModal && cashRegister && (
        <CloseCashModal
          cashRegister={cashRegister}
          salesToday={salesTodayData}
          onClose={() => setShowCloseModal(false)}
          onCloseCash={handleCloseCash}
        />
      )}
    </>
  );
}

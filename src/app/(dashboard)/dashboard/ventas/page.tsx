// src/app/(dashboard)/dashboard/ventas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Calendar, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import CloseCashModal from '@/components/cash/CloseCashModal';

interface CashRegister {
  id: string;
  opening_amount: number;
  opened_at: string;
  status: string;
  location?: {
    id: string;
    name: string;
  };
}

interface SalesToday {
  totalSales: number;
  paymentBreakdown: {
    cash: number;
    debit: number;
    credit: number;
    transfer: number;
  };
  salesCount: number;
}

export default function VentasPage() {
  const router = useRouter();
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [salesToday, setSalesToday] = useState<SalesToday | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);

  useEffect(() => {
    loadCashRegister();
  }, []);

  useEffect(() => {
    if (cashRegister) {
      loadSalesToday();
    }
  }, [cashRegister]);

  const loadCashRegister = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cash-register/current');
      const data = await response.json();

      if (data.success) {
        setCashRegister(data.data);
      }
    } catch (error) {
      console.error('Error al cargar caja:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesToday = async () => {
    if (!cashRegister) return;

    try {
      const response = await fetch(`/api/sales/today?cashRegisterId=${cashRegister.id}`);
      const data = await response.json();

      if (data.success) {
        setSalesToday(data.data);
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    }
  };

  const handleCloseCash = async (notes?: string) => {
    try {
      const response = await fetch('/api/cash-register/close', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      const result = await response.json();

      if (result.success) {
        setCashRegister(null);
        setSalesToday(null);
        setShowCloseModal(false);
        alert('Caja cerrada exitosamente');
        loadCashRegister();
      } else {
        alert(result.error || 'Error al cerrar caja');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cerrar caja');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Ventas</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tus ventas y caja
        </p>
      </div>

      {/* Estado del Día */}
      <div className="bg-card border-2 border-border rounded-xl p-4 mb-4">
        <h2 className="text-sm font-bold text-foreground mb-4">ESTADO DEL DÍA</h2>

        {/* Total Vendido */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Vendido</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(salesToday?.totalSales || 0)}
          </div>
          {salesToday && salesToday.salesCount > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {salesToday.salesCount} venta{salesToday.salesCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Estado Caja */}
        <div className="space-y-3">
          {cashRegister ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium text-foreground">Caja Abierta</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Apertura:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(Number(cashRegister.opening_amount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Abierta:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(cashRegister.opened_at)}
                  </span>
                </div>
                {cashRegister.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ubicación:</span>
                    <span className="font-medium text-foreground">
                      {cashRegister.location.name}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="font-medium text-foreground">Sin Caja Abierta</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Debes abrir una caja para comenzar a vender
              </p>
            </>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="space-y-3">
        <button
          onClick={() => router.push('/dashboard/ventas/nueva')}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Venta
        </button>

        {cashRegister ? (
          <button
            onClick={() => setShowCloseModal(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-destructive text-destructive hover:bg-destructive/5 font-bold transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Cerrar Caja
          </button>
        ) : (
          <button
            onClick={() => router.push('/dashboard/caja/abrir')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-primary text-primary hover:bg-primary/5 font-bold transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Abrir Caja
          </button>
        )}
      </div>

      {/* Modal Cerrar Caja */}
      {showCloseModal && cashRegister && salesToday && (
        <CloseCashModal
          cashRegister={cashRegister}
          salesToday={salesToday}
          onClose={() => setShowCloseModal(false)}
          onCloseCash={handleCloseCash}
        />
      )}
    </div>
  );
}

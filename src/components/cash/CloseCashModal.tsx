// src/components/cash/CloseCashModal.tsx
'use client';

import { useState } from 'react';
import { X, Calendar, DollarSign } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface CashRegister {
  id: string;
  opening_amount: number;
  opened_at: string;
}

interface SalesToday {
  totalSales: number;
  paymentBreakdown: {
    EFECTIVO: number;
    DEBITO: number;
    CREDITO: number;
    TRANSFERENCIA: number;
  };
  salesCount: number;
}

interface CloseCashModalProps {
  cashRegister: CashRegister;
  salesToday: SalesToday;
  onClose: () => void;
  onCloseCash: (notes?: string) => void;
}

const PAYMENT_LABELS = {
  cash: 'Efectivo',
  debit: 'Débito',
  credit: 'Crédito',
  transfer: 'Transferencia',
};

export default function CloseCashModal({ 
  cashRegister, 
  salesToday, 
  onClose, 
  onCloseCash 
}: CloseCashModalProps) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirm('¿Estás seguro de cerrar la caja? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    onCloseCash(notes.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={cn(
          'bg-card w-full sm:max-w-md sm:rounded-xl rounded-t-2xl',
          'max-h-[90vh] overflow-y-auto',
          'animate-in slide-in-from-bottom-4 sm:zoom-in-95'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Calendar className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Cerrar Caja</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Apertura */}
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">Apertura</div>
            <div className="text-xl font-bold text-foreground">
              {formatCurrency(Number(cashRegister.opening_amount))}
            </div>
          </div>

          {/* Total Vendido */}
          <div className="bg-primary/10 rounded-lg p-3 border-2 border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Total Vendido</div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(salesToday.totalSales)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {salesToday.salesCount} venta{salesToday.salesCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Desglose por Método de Pago */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">
              DESGLOSE POR MÉTODO DE PAGO
            </h4>
            <div className="space-y-2">
              {Object.entries(salesToday.paymentBreakdown).map(([method, amount]) => (
                <div
                  key={method}
                  className="flex justify-between items-center py-2 px-3 bg-secondary/30 rounded-lg"
                >
                  <span className="text-sm font-medium text-foreground">
                    • {PAYMENT_LABELS[method as keyof typeof PAYMENT_LABELS]}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notas de Cierre (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Cuadró perfecto, todo ok..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border-2 border-yellow-500/20 rounded-lg p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ Al cerrar la caja no podrás registrar más ventas. Asegúrate de haber ingresado todas las ventas del día.
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-3 rounded-lg bg-secondary hover:bg-secondary/80 font-bold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Cerrando...' : 'Cerrar Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// src/components/sales/PaymentMethodModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface PaymentMethodModalProps {
  total: number;
  onComplete: (data: { received: number; change: number }) => void;
  onClose: () => void;
}

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

export default function PaymentMethodModal({ total, onComplete, onClose }: PaymentMethodModalProps) {
  const [received, setReceived] = useState(0);

  const change = received - total;
  const canComplete = received >= total;

  const handleQuickAmount = (amount: number) => {
    setReceived(received + amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-md">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold">Efectivo con Vuelto</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Total */}
          <div className="bg-secondary rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground">Total a pagar</div>
            <div className="text-3xl font-bold">{formatCurrency(total)}</div>
          </div>

          {/* Botones rápidos */}
          <div>
            <div className="font-semibold mb-2">¿Cuánto pagó?</div>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className="py-3 bg-secondary rounded-lg font-semibold text-base active:scale-95 transition-transform"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>

          {/* Monto recibido */}
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Recibido</div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(received)}
            </div>
          </div>

          {/* Vuelto */}
          {received > 0 && (
            <div className={cn(
              'rounded-lg p-4',
              canComplete ? 'bg-green-50 border-2 border-green-500' : 'bg-destructive/10 border-2 border-destructive'
            )}>
              <div className="text-sm font-semibold mb-1">
                {canComplete ? 'Vuelto' : 'Falta'}
              </div>
              <div className={cn(
                'text-3xl font-bold',
                canComplete ? 'text-green-600' : 'text-destructive'
              )}>
                {formatCurrency(Math.abs(change))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={() => setReceived(0)}
              className="flex-1 py-3 bg-secondary rounded-lg font-semibold"
            >
              LIMPIAR
            </button>
            <button
              onClick={() => onComplete({ received, change })}
              disabled={!canComplete}
              className={cn(
                'flex-1 py-3 rounded-lg font-bold text-lg',
                'bg-primary text-primary-foreground',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'active:scale-95 transition-transform'
              )}
            >
              FINALIZAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

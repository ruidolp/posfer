// src/components/sales/PaymentModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ChangeCalculator from './ChangeCalculator';
import type { Payment } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (payments: Payment[]) => void;
  total: number;
  mode: 'exact' | 'change' | 'card';
}

export default function PaymentModal({
  isOpen,
  onClose,
  onComplete,
  total,
  mode,
}: PaymentModalProps) {
  const [selectedCard, setSelectedCard] = useState<'debit' | 'credit' | 'transfer'>('debit');
  const [reference, setReference] = useState('');

  if (!isOpen) return null;

  const handleChangePayment = (amountPaid: number) => {
    const payment: Payment = {
      paymentMethod: 'cash',
      amount: total,
    };
    onComplete([payment]);
  };

  const handleCardPayment = () => {
    // ✅ CORRECCIÓN: Si es transferencia y no hay referencia, generar una automática
    const finalReference = selectedCard === 'transfer' && !reference.trim()
      ? `TRANS-${Date.now()}`
      : reference.trim();

    const payment: Payment = {
      paymentMethod: selectedCard,
      amount: total,
      reference: finalReference || undefined,
    };
    onComplete([payment]);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-card border-2 border-border rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10 rounded-t-2xl">
            <h2 className="text-xl font-bold text-foreground">
              {(mode === 'exact' || mode === 'change') && 'Pago Efectivo'}
              {mode === 'card' && 'Pago con Tarjeta'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Efectivo - Ambos modos usan la calculadora */}
            {(mode === 'exact' || mode === 'change') && (
              <ChangeCalculator
                total={total}
                onConfirm={handleChangePayment}
                onCancel={onClose}
              />
            )}

            {/* Tarjeta */}
            {mode === 'card' && (
              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Total a pagar:
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {formatCurrency(total)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Método de pago:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedCard('debit')}
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${
                        selectedCard === 'debit'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-secondary/30 text-foreground hover:border-primary/50'
                      }`}
                    >
                      Débito
                    </button>
                    <button
                      onClick={() => setSelectedCard('credit')}
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${
                        selectedCard === 'credit'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-secondary/30 text-foreground hover:border-primary/50'
                      }`}
                    >
                      Crédito
                    </button>
                    <button
                      onClick={() => setSelectedCard('transfer')}
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${
                        selectedCard === 'transfer'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-secondary/30 text-foreground hover:border-primary/50'
                      }`}
                    >
                      Transfer.
                    </button>
                  </div>
                </div>

                {selectedCard === 'transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Número de transferencia (opcional):
                    </label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Ej: 123456"
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="py-4 rounded-xl bg-secondary hover:bg-secondary/80 font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCardPayment}
                    className="py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

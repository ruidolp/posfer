// src/components/sales/PaymentModal.tsx
'use client';

import { useState } from 'react';
import { X, CreditCard, Smartphone, Banknote, Wallet } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency, cn } from '@/lib/utils';
import type { Payment } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (payments: Payment[]) => void;
  total: number;
}

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Efectivo', icon: Banknote, color: 'bg-green-500' },
  { id: 'transfer', label: 'Transferencia', icon: Smartphone, color: 'bg-blue-500' },
  { id: 'debit', label: 'Débito', icon: CreditCard, color: 'bg-purple-500' },
  { id: 'credit', label: 'Crédito', icon: Wallet, color: 'bg-orange-500' },
];

export default function PaymentModal({ isOpen, onClose, onComplete, total }: PaymentModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentMethod, setCurrentMethod] = useState<'cash' | 'transfer' | 'debit' | 'credit'>('cash');
  const [currentAmount, setCurrentAmount] = useState('');
  const [reference, setReference] = useState('');

  if (!isOpen) return null;

  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - paidAmount;
  const change = paidAmount > total ? paidAmount - total : 0;

  const handleAddPayment = () => {
    const amount = parseFloat(currentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newPayment: Payment = {
      id: `payment_${Date.now()}`,
      paymentMethod: currentMethod,
      amount,
      reference: reference || undefined,
    };

    setPayments([...payments, newPayment]);
    setCurrentAmount('');
    setReference('');
  };

  const handleRemovePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const handleComplete = () => {
    if (paidAmount < total) {
      alert('El monto pagado es menor al total');
      return;
    }

    onComplete(payments);
  };

  const handleQuickAmount = (amount: number) => {
    setCurrentAmount(amount.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-card w-full sm:max-w-2xl sm:rounded-xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Procesar Pago</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Resumen */}
          <div className="bg-primary/10 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Total a Pagar</div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(total)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Restante</div>
                <div className={cn(
                  "text-2xl font-bold",
                  remaining > 0 ? "text-destructive" : "text-green-600"
                )}>
                  {formatCurrency(remaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setCurrentMethod(method.id as any)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                      currentMethod === method.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className={cn('p-3 rounded-full text-white', method.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monto rápido (solo efectivo) */}
          {currentMethod === 'cash' && remaining > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Monto Rápido
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1000, 2000, 5000, 10000, 20000, remaining].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className={cn(
                      'px-4 py-3 rounded-lg font-semibold',
                      'bg-secondary text-secondary-foreground',
                      'hover:bg-secondary/80 transition-colors',
                      'min-h-touch'
                    )}
                  >
                    {amount === remaining ? 'Exacto' : formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Monto
            </label>
            <input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="Ingrese el monto"
              className={cn(
                'w-full px-4 py-3 rounded-lg border border-input',
                'bg-background text-foreground text-xl font-semibold',
                'min-h-touch',
                'focus:outline-none focus:ring-2 focus:ring-primary'
              )}
              step="1"
              min="0"
            />
          </div>

          {/* Referencia (transferencia/débito/crédito) */}
          {currentMethod !== 'cash' && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Referencia / Voucher (Opcional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Número de operación"
                className={cn(
                  'w-full px-4 py-3 rounded-lg border border-input',
                  'bg-background text-foreground',
                  'min-h-touch',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
              />
            </div>
          )}

          {/* Botón agregar pago */}
          <button
            onClick={handleAddPayment}
            disabled={!currentAmount || parseFloat(currentAmount) <= 0}
            className={cn(
              'w-full px-6 py-3 rounded-lg',
              'min-h-touch text-lg font-semibold',
              'bg-secondary text-secondary-foreground',
              'hover:bg-secondary/80 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            Agregar Pago
          </button>

          {/* Lista de pagos agregados */}
          {payments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Pagos Agregados:</h3>
              <div className="space-y-2">
                {payments.map((payment) => {
                  const method = PAYMENT_METHODS.find(m => m.id === payment.paymentMethod);
                  const Icon = method?.icon || Banknote;
                  
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <div className="font-semibold">{method?.label}</div>
                          {payment.reference && (
                            <div className="text-sm text-muted-foreground">
                              Ref: {payment.reference}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">
                          {formatCurrency(payment.amount)}
                        </span>
                        <button
                          onClick={() => handleRemovePayment(payment.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vuelto */}
          {change > 0 && (
            <div className="bg-green-500/10 border-2 border-green-500 rounded-xl p-4">
              <div className="text-center">
                <div className="text-sm font-semibold text-green-700">Vuelto</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(change)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={handleComplete}
            disabled={paidAmount < total}
            className={cn(
              'w-full px-6 py-4 rounded-xl',
              'min-h-touch-lg text-xl font-bold',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {paidAmount < total 
              ? `Falta ${formatCurrency(remaining)}`
              : 'Completar Venta'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

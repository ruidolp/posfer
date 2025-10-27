// src/app/(dashboard)/dashboard/ventas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, cn } from '@/lib/utils';

export default function VentasPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashRegister, setCashRegister] = useState<any>(null);

  useEffect(() => {
    checkCashRegister();
    loadSales();
  }, []);

  const checkCashRegister = async () => {
    try {
      const response = await fetch('/api/cash-register/current');
      const data = await response.json();

      if (data.success && data.data) {
        setCashRegister(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sales');
      const data = await response.json();

      if (data.success) {
        setSales(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando ventas...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Ventas
          </h1>
          <p className="text-muted-foreground mt-1">
            Historial de ventas realizadas
          </p>
        </div>

        {cashRegister ? (
          <Link
            href="/dashboard/ventas/nueva"
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg',
              'min-h-touch text-base font-semibold',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus className="w-5 h-5" />
            Nueva Venta
          </Link>
        ) : (
          <Link
            href="/dashboard/caja/abrir"
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg',
              'min-h-touch text-base font-semibold',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            Abrir Caja
          </Link>
        )}
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No hay ventas registradas
          </p>
          {cashRegister && (
            <Link
              href="/dashboard/ventas/nueva"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-lg',
                'min-h-touch text-base font-semibold',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 transition-colors'
              )}
            >
              <Plus className="w-5 h-5" />
              Crear Primera Venta
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-card border-2 border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {formatDate(sale.sale_date)} - {formatTime(sale.sale_date)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {sale.items?.length || 0} productos
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(Number(sale.total))}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {sale.synced ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {sale.synced ? 'Sincronizado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              {sale.items && sale.items.length > 0 && (
                <div className="border-t border-border pt-3 space-y-1">
                  {sale.items.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="text-foreground">
                        {item.product?.name || item.product_name}
                        {item.is_special_price && (
                          <span className="text-xs text-muted-foreground ml-1">(Precio especial)</span>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        {item.quantity && `${item.quantity}x `}{formatCurrency(Number(item.subtotal))}
                      </div>
                    </div>
                  ))}
                  {sale.items.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{sale.items.length - 3} productos más
                    </div>
                  )}
                </div>
              )}

              {sale.payments && sale.payments.length > 0 && (
                <div className="border-t border-border pt-3 mt-3 space-y-1">
                  {sale.payments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        {payment.payment_method === 'cash' && 'Efectivo'}
                        {payment.payment_method === 'transfer' && 'Transferencia'}
                        {payment.payment_method === 'debit' && 'Débito'}
                        {payment.payment_method === 'credit' && 'Crédito'}
                        {payment.reference && (
                          <span className="text-xs ml-1">({payment.reference})</span>
                        )}
                      </div>
                      <div className="text-foreground font-medium">
                        {formatCurrency(Number(payment.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

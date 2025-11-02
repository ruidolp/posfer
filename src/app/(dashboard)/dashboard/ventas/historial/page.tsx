// src/app/(dashboard)/dashboard/ventas/historial/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, TrendingUp, ArrowUpDown } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SalesSummary {
  date: string;
  total: number;
  salesCount: number;
  paymentBreakdown: {
    cash: number;
    debit: number;
    credit: number;
    transfer: number;
  };
  cashRegisters: {
    id: string;
    openedAt: string;
    closedAt: string;
  }[];
  sales: Array<{
    id: string;
    time: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
    }>;
  }>;
}

export default function HistorialVentasPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [daysWithSales, setDaysWithSales] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'amount'>('time');

  useEffect(() => {
    loadDaysWithSales();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      loadDaySummary(selectedDate);
    }
  }, [selectedDate]);

  const loadDaysWithSales = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await fetch(`/api/sales/days-with-sales?year=${year}&month=${month}`);
      const data = await response.json();
      
      if (data.success) {
        setDaysWithSales(new Set(data.days));
      }
    } catch (error) {
      console.error('Error cargando días:', error);
    }
  };

  const loadDaySummary = async (date: Date) => {
    try {
      setLoading(true);
      // Usar fecha local sin conversión UTC
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const response = await fetch(`/api/sales/day-summary?date=${dateStr}`);
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
      } else {
        setSummary(null);
      }
    } catch (error) {
      console.error('Error cargando resumen:', error);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDayWithSales = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return daysWithSales.has(dateStr);
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const sortedSales = summary?.sales
    ? [...summary.sales].sort((a, b) => {
        if (sortBy === 'time') {
          return a.time.localeCompare(b.time);
        }
        return b.total - a.total;
      })
    : [];

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historial de Ventas</h1>
        <p className="text-muted-foreground mt-1">Revisa las ventas de días anteriores</p>
      </div>

      {/* Calendario */}
      <div className="bg-card border-2 border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="px-3 py-2 hover:bg-secondary rounded-lg transition-colors"
          >
            ←
          </button>
          <h2 className="text-xl font-bold capitalize">{monthName}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="px-3 py-2 hover:bg-secondary rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} />;
            }

            const hasSales = isDayWithSales(day);
            const isSelected = isSelectedDate(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => hasSales && setSelectedDate(day)}
                disabled={!hasSales}
                className={cn(
                  'aspect-square rounded-lg text-sm font-medium transition-all',
                  'flex items-center justify-center',
                  hasSales
                    ? isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                    : 'text-muted-foreground/30 cursor-not-allowed'
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen del día */}
      {loading ? (
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <div className="text-center py-8 text-muted-foreground">
            Cargando...
          </div>
        </div>
      ) : summary ? (
        <>
          {/* Resumen */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">
                {formatDate(selectedDate, 'long')}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground">Total Vendido</div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(summary.total)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Ventas</div>
                <div className="text-2xl font-bold">{summary.salesCount}</div>
              </div>

              <div className="col-span-2">
                <div className="text-sm text-muted-foreground mb-2">Métodos de Pago</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>💵 Efectivo: {formatCurrency(summary.paymentBreakdown.cash)}</div>
                  <div>💳 Débito: {formatCurrency(summary.paymentBreakdown.debit)}</div>
                  <div>💳 Crédito: {formatCurrency(summary.paymentBreakdown.credit)}</div>
                  <div>🏦 Transfer: {formatCurrency(summary.paymentBreakdown.transfer)}</div>
                </div>
              </div>
            </div>

            {/* Horarios de caja */}
            <div className="border-t border-border pt-4">
              <div className="text-sm text-muted-foreground mb-2">Horarios de Caja</div>
              {summary.cashRegisters.map((register, idx) => (
                <div key={register.id} className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    Caja {idx + 1}: {new Date(register.openedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(register.closedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Listado de ventas */}
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Ventas del Día</h3>
              <button
                onClick={() => setSortBy(sortBy === 'time' ? 'amount' : 'time')}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortBy === 'time' ? 'Por hora' : 'Por monto'}
              </button>
            </div>

            <div className="space-y-3">
              {sortedSales.map((sale) => (
                <div key={sale.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{sale.time}</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(sale.total)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sale.items.map((item, idx) => (
                      <div key={idx}>
                        • {item.name} ({item.quantity})
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <div className="text-center py-8 text-muted-foreground">
            Selecciona un día con ventas en el calendario
          </div>
        </div>
      )}
    </div>
  );
}

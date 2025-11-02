// CORRECCIÓN 3: Página de compras con combobox y calendario
// Archivo: src/app/(dashboard)/dashboard/compras/page.tsx

// REEMPLAZAR TODO EL ARCHIVO CON ESTE:

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar as CalendarIcon, ShoppingCart, Truck, Package, Users, Megaphone, Home, AlertCircle, Filter } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface Purchase {
  id: string;
  category: string;
  total: number;
  purchase_date: string;
  notes: string | null;
  supplier: {
    name: string;
  } | null;
  items: Array<{
    quantity: number;
    variety: {
      name: string;
      parent: {
        name: string;
      };
    };
  }>;
}

const CATEGORIES = [
  { value: 'ALL', label: 'Todas', icon: Filter },
  { value: 'MERCADERIA', label: 'Mercadería', icon: ShoppingCart },
  { value: 'TRANSPORTE_BENCINA', label: 'Transporte/Bencina', icon: Truck },
  { value: 'MATERIALES', label: 'Materiales', icon: Package },
  { value: 'SUELDOS', label: 'Sueldos', icon: Users },
  { value: 'PUBLICIDAD', label: 'Publicidad', icon: Megaphone },
  { value: 'GASTOS_FIJOS', label: 'Gastos Fijos', icon: Home },
  { value: 'IMPREVISTOS_OTROS', label: 'Imprevistos/Otros', icon: AlertCircle },
];

export default function ComprasPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysWithPurchases, setDaysWithPurchases] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDaysWithPurchases();
  }, [currentMonth]);

  useEffect(() => {
    loadPurchases();
  }, [selectedCategory, selectedDate]);

  const loadDaysWithPurchases = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await fetch(`/api/purchases/days-with-purchases?year=${year}&month=${month}`);
      const data = await response.json();
      
      if (data.success) {
        setDaysWithPurchases(new Set(data.days));
      }
    } catch (error) {
      console.error('Error cargando días:', error);
    }
  };

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }
      if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        params.append('date', `${year}-${month}-${day}`);
      }

      const response = await fetch(`/api/purchases?${params}`);
      const data = await response.json();

      if (data.success) {
        setPurchases(data.data);
      }
    } catch (error) {
      console.error('Error al cargar compras:', error);
      alert('Error al cargar compras');
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
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDayWithPurchases = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return daysWithPurchases.has(dateStr);
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    const Icon = cat?.icon || ShoppingCart;
    return <Icon className="w-5 h-5" />;
  };

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.label || category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compras</h1>
          <p className="text-sm text-muted-foreground">
            Registro de todas tus compras y gastos
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/compras/nueva')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nueva
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-card border-2 border-border rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Combobox de categorías */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Filtrar por categoría:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none bg-background text-foreground"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botón limpiar fecha */}
          {selectedDate && (
            <div className="flex items-end">
              <button
                onClick={() => setSelectedDate(null)}
                className="px-4 py-3 rounded-xl border-2 border-border hover:border-destructive hover:text-destructive transition"
              >
                Limpiar fecha
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-card border-2 border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="px-3 py-2 hover:bg-secondary rounded-lg transition"
          >
            ←
          </button>
          <h2 className="text-xl font-bold capitalize flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {monthName}
          </h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="px-3 py-2 hover:bg-secondary rounded-lg transition"
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

            const hasPurchases = isDayWithPurchases(day);
            const isSelected = isSelectedDate(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => hasPurchases && setSelectedDate(day)}
                disabled={!hasPurchases}
                className={cn(
                  'aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center',
                  hasPurchases
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

      {/* List */}
      <div className="bg-card border-2 border-border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedDate 
            ? `Compras del ${selectedDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : 'Todas las compras'}
        </h2>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Cargando compras...
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {selectedCategory === 'ALL' 
                ? 'No hay compras registradas' 
                : `No hay compras de ${getCategoryLabel(selectedCategory).toLowerCase()}`}
            </p>
            <button
              onClick={() => router.push('/dashboard/compras/nueva')}
              className="text-primary hover:underline"
            >
              Registrar primera compra
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => (
              <button
                key={purchase.id}
                onClick={() => router.push(`/dashboard/compras/${purchase.id}`)}
                className="w-full bg-card border-2 border-border rounded-xl p-4 text-left hover:border-primary transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getCategoryIcon(purchase.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">
                        {getCategoryLabel(purchase.category)}
                      </h3>
                      {purchase.supplier && (
                        <p className="text-sm text-muted-foreground">
                          {purchase.supplier.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-foreground">
                      {formatCurrency(Number(purchase.total))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(purchase.purchase_date)}
                    </div>
                  </div>
                </div>

                {purchase.items.length > 0 && (
                  <div className="text-sm text-muted-foreground mb-2">
                    {purchase.items.slice(0, 2).map((item, idx) => (
                      <span key={idx}>
                        {item.variety.parent.name} - {item.variety.name} ({item.quantity})
                        {idx < Math.min(purchase.items.length, 2) - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {purchase.items.length > 2 && ` y ${purchase.items.length - 2} más`}
                  </div>
                )}

                {purchase.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    💬 {purchase.notes}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

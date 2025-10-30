// src/app/(dashboard)/dashboard/compras/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, ShoppingCart, Truck, Package, Users, Megaphone, Home, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    loadPurchases();
  }, [selectedCategory]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
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

      {/* Category Filter */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
                  selectedCategory === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border-2 border-border text-foreground hover:bg-secondary'
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
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
  );
}

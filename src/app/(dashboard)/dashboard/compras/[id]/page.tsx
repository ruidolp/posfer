// CORRECCIÓN 4c: Página de detalle de compra
// Archivo: src/app/(dashboard)/dashboard/compras/[id]/page.tsx
// ESTE ES UN ARCHIVO NUEVO - Crear la carpeta [id] y el archivo page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, Package, ShoppingCart, Truck, Users, Megaphone, Home, AlertCircle, Filter } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, any> = {
  MERCADERIA: ShoppingCart,
  TRANSPORTE_BENCINA: Truck,
  MATERIALES: Package,
  SUELDOS: Users,
  PUBLICIDAD: Megaphone,
  GASTOS_FIJOS: Home,
  IMPREVISTOS_OTROS: AlertCircle,
};

const CATEGORY_LABELS: Record<string, string> = {
  MERCADERIA: 'Mercadería',
  TRANSPORTE_BENCINA: 'Transporte/Bencina',
  MATERIALES: 'Materiales',
  SUELDOS: 'Sueldos',
  PUBLICIDAD: 'Publicidad',
  GASTOS_FIJOS: 'Gastos Fijos',
  IMPREVISTOS_OTROS: 'Imprevistos/Otros',
};

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadPurchase();
    }
  }, [params.id]);

  const loadPurchase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/purchases/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setPurchase(data.data);
      } else {
        alert('Compra no encontrada');
        router.push('/dashboard/compras');
      }
    } catch (error) {
      console.error('Error cargando compra:', error);
      alert('Error al cargar la compra');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const Icon = CATEGORY_ICONS[category] || ShoppingCart;
    return <Icon className="w-5 h-5" />;
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORY_LABELS[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl font-semibold text-muted-foreground">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-xl font-semibold text-muted-foreground">Compra no encontrada</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Detalle de Compra</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(purchase.purchase_date).toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Información general */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            {getCategoryIcon(purchase.category)}
            <span className="text-sm font-semibold text-muted-foreground">Categoría</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {getCategoryLabel(purchase.category)}
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">Proveedor</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {purchase.supplier?.name || 'Sin proveedor'}
          </div>
        </div>

        <div className="bg-card border-2 border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">Total</span>
          </div>
          <div className="text-2xl font-black text-primary">
            {formatCurrency(Number(purchase.total))}
          </div>
        </div>
      </div>

      {/* Items de la compra */}
      <div className="bg-card border-2 border-border rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Productos Comprados</h2>

        {purchase.items && purchase.items.length > 0 ? (
          <div className="space-y-3">
            {purchase.items.map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border-2 border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-bold text-foreground">
                      {item.variety?.parent?.name} - {item.variety?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Number(item.quantity)} {item.variety?.unit_type} × {formatCurrency(Number(item.unit_cost))}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(Number(item.total_cost))}
                  </div>
                </div>
                
                {item.add_to_sales !== null && (
                  <div className={cn(
                    'mt-2 text-xs px-2 py-1 rounded inline-block',
                    item.add_to_sales 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  )}>
                    {item.add_to_sales ? '✓ Agregado a ventas' : '○ No agregado a ventas'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">Sin productos registrados</p>
        )}
      </div>

      {/* Notas */}
      {purchase.notes && (
        <div className="bg-card border-2 border-border rounded-xl p-6">
          <h2 className="text-xl font-bold mb-2">Notas</h2>
          <p className="text-muted-foreground">{purchase.notes}</p>
        </div>
      )}
    </div>
  );
}

// src/app/(dashboard)/dashboard/productos/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Package } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface PriceOption {
  id: string;
  quantity: number;
  total_price: number;
}

interface Variety {
  id: string;
  name: string;
  unit_type: string;
  base_price: number;
  current_stock: number | null;
  price_options: PriceOption[];
}

interface Product {
  id: string;
  name: string;
  varieties: Variety[];
}

export default function ProductosPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.tenantId) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    if (!user?.tenantId) {
      console.error('No hay tenantId');
      return;
    }

    setLoading(true);
    try {
      console.log('📦 Cargando productos para tenant:', user.tenantId);
      
      const response = await fetch(
        `/api/products?tenantId=${user.tenantId}&active=true`
      );
      
      const data = await response.json();
      
      console.log('📦 Respuesta:', data);

      if (data.success) {
        setProducts(data.data || []);
      } else {
        console.error('Error:', data.error);
        alert('Error al cargar productos: ' + data.error);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUnitLabel = (unitType: string) => {
    const labels: Record<string, string> = {
      'un': 'unidad',
      'kg': 'kg',
      'atado': 'atado',
      'bandeja': 'bandeja'
    };
    return labels[unitType] || unitType;
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    if (!user?.tenantId) {
      alert('Error: No hay sesión activa');
      return;
    }

    try {
      const response = await fetch(
        `/api/products/${productId}?tenantId=${user.tenantId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        // Recargar productos
        loadProducts();
      } else {
        alert('Error al eliminar: ' + data.error);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el producto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b-2 border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Productos</h1>
            <button
              onClick={() => router.push('/dashboard/productos/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo
            </button>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No se encontraron productos' : 'No hay productos'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Intenta con otro término de búsqueda'
                : 'Comienza agregando tu primer producto'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/dashboard/productos/nuevo')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Agregar Producto
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-card border-2 border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
              >
                {/* Card clickeable */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => router.push(`/dashboard/productos/${product.id}/editar`)}
                >
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    {product.name}
                  </h3>

                  {/* Variedades */}
                  <div className="space-y-2">
                    {product.varieties.map((variety) => (
                      <div
                        key={variety.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="font-medium text-foreground">
                            {variety.name}
                          </span>
                          {variety.current_stock !== null && (
                            <span className="text-muted-foreground ml-2">
                              • Stock: {variety.current_stock} {getUnitLabel(variety.unit_type)}
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-foreground">
                          ${variety.base_price.toLocaleString()}/{getUnitLabel(variety.unit_type)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paquetes */}
                  {product.varieties.some(v => v.price_options.length > 0) && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground mb-1">Paquetes disponibles:</div>
                      <div className="flex flex-wrap gap-2">
                        {product.varieties.map(variety =>
                          variety.price_options.map(option => (
                            <span
                              key={option.id}
                              className="text-xs px-2 py-1 bg-secondary rounded"
                            >
                              {option.quantity} {getUnitLabel(variety.unit_type)} → ${option.total_price.toLocaleString()}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón eliminar en footer */}
                <div className="border-t border-border bg-secondary/30 px-4 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product.id, product.name);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar producto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

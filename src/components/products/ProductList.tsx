// src/components/products/ProductList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import type { Product } from '@/types';
import { formatCurrency, debounce } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?active=true');
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-lg border border-input',
              'bg-background text-foreground',
              'min-h-touch text-base',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          />
        </div>

        <Link
          href="/dashboard/productos/nuevo"
          className={cn(
            'flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
            'min-h-touch text-base font-semibold',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
            'whitespace-nowrap'
          )}
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search ? 'No se encontraron productos' : 'No hay productos registrados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {product.unitType || 'Unidad'}
                  </p>
                </div>

                {product.stock !== null && product.alertStock && product.stock <= product.alertStock && (
                  <div className="bg-destructive/10 text-destructive p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(Number(product.price))}
                </div>
                {product.stock !== null && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Stock: {product.stock} {product.unitType || 'unidades'}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/productos/${product.id}`}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
                    'min-h-touch text-sm font-medium',
                    'bg-secondary text-secondary-foreground',
                    'hover:bg-secondary/80 transition-colors'
                  )}
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Link>

                <button
                  onClick={() => handleDelete(product.id)}
                  className={cn(
                    'flex items-center justify-center px-4 py-2 rounded-lg',
                    'min-h-touch min-w-touch',
                    'bg-destructive/10 text-destructive',
                    'hover:bg-destructive/20 transition-colors'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

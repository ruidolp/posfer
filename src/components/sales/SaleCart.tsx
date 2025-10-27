// src/components/sales/SaleCart.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

interface SaleCartProps {
  onCheckout: () => void;
}

export default function SaleCart({ onCheckout }: SaleCartProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { items, addItem, updateQuantity, removeItem, getTotal, getItemCount } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) && p.active
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

  const handleAddProduct = (product: Product) => {
    addItem({
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.price),
      quantity: 1,
    });
    setSearch('');
  };

  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <div className="flex flex-col h-full">
      {/* Búsqueda de productos */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto para agregar..."
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-lg border border-input',
              'bg-background text-foreground',
              'min-h-touch text-base',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          />
        </div>

        {/* Sugerencias de productos */}
        {search && (
          <div className="mt-2 max-h-64 overflow-y-auto bg-card border border-border rounded-lg">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No se encontraron productos
              </div>
            ) : (
              filteredProducts.slice(0, 5).map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  className={cn(
                    'w-full flex items-center justify-between p-3',
                    'hover:bg-secondary transition-colors',
                    'border-b border-border last:border-0'
                  )}
                >
                  <div className="text-left">
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.unitType || 'Unidad'}
                    </div>
                  </div>
                  <div className="font-bold text-primary">
                    {formatCurrency(Number(product.price))}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Items del carrito */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Carrito vacío</p>
            <p className="text-sm mt-1">Busca productos para agregar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.unitPrice)} c/u
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-lg',
                        'bg-secondary text-secondary-foreground',
                        'hover:bg-secondary/80 transition-colors'
                      )}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          updateQuantity(item.productId, val);
                        }
                      }}
                      className={cn(
                        'w-20 text-center py-2 rounded-lg border border-input',
                        'bg-background text-foreground font-semibold text-lg',
                        'focus:outline-none focus:ring-2 focus:ring-primary'
                      )}
                      step="0.01"
                      min="0"
                    />

                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-lg',
                        'bg-secondary text-secondary-foreground',
                        'hover:bg-secondary/80 transition-colors'
                      )}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con total y botón de pago */}
      {items.length > 0 && (
        <div className="p-4 border-t-2 border-border bg-card">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Items:</span>
              <span className="font-semibold">{itemCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">Total:</span>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className={cn(
              'w-full px-6 py-4 rounded-xl',
              'min-h-touch-lg text-xl font-bold',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'shadow-lg'
            )}
          >
            Proceder al Pago
          </button>
        </div>
      )}
    </div>
  );
}

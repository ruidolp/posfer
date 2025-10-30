// src/components/purchases/ProductSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/lib/utils';

interface Variety {
  id: string;
  name: string;
  unit_type: string;
  base_price: number;
  parent: {
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  varieties: Variety[];
}

interface PurchaseItem {
  varietyId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ProductSelectorProps {
  onAdd: (item: PurchaseItem) => void;
}

export default function ProductSelector({ onAdd }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVariety, setSelectedVariety] = useState<{ product: Product; variety: Variety } | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.tenantId) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?tenantId=${user?.tenantId}&active=true`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectVariety = (product: Product, variety: Variety) => {
    setSelectedVariety({ product, variety });
    setQuantity('');
    setUnitPrice(variety.base_price.toString());
  };

  const handleAdd = () => {
    if (!selectedVariety) return;

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);

    if (!qty || qty <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    if (!price || price <= 0) {
      alert('Ingresa un precio válido');
      return;
    }

    const subtotal = qty * price;

    onAdd({
      varietyId: selectedVariety.variety.id,
      productName: `${selectedVariety.product.name} - ${selectedVariety.variety.name}`,
      quantity: qty,
      unitPrice: price,
      subtotal: subtotal,
    });

    // Reset
    setSelectedVariety(null);
    setQuantity('');
    setUnitPrice('');
    setSearch('');
  };

  return (
    <div className="space-y-3">
      {!selectedVariety ? (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Products List */}
          {loading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Cargando productos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              {search ? 'No se encontraron productos' : 'No hay productos'}
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredProducts.map((product) => (
                <div key={product.id} className="space-y-2">
                  {product.varieties.map((variety) => (
                    <button
                      key={variety.id}
                      type="button"
                      onClick={() => handleSelectVariety(product, variety)}
                      className="w-full bg-card border-2 border-border rounded-lg p-3 text-left hover:border-primary transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-foreground">
                            {product.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {variety.name} • {formatCurrency(variety.base_price)}/{variety.unit_type}
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // Add Item Form
        <div className="bg-primary/5 border-2 border-primary rounded-lg p-4 space-y-4">
          <div>
            <div className="font-bold text-foreground mb-1">
              {selectedVariety.product.name} - {selectedVariety.variety.name}
            </div>
            <div className="text-sm text-muted-foreground">
              Precio base: {formatCurrency(selectedVariety.variety.base_price)}/{selectedVariety.variety.unit_type}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cantidad ({selectedVariety.variety.unit_type})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Unit Price */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Precio por {selectedVariety.variety.unit_type}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0"
                step="1"
                min="0"
                className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Subtotal Preview */}
          {quantity && unitPrice && (
            <div className="bg-background rounded-lg p-3">
              <div className="text-sm text-muted-foreground mb-1">Subtotal</div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(parseFloat(quantity) * parseFloat(unitPrice))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedVariety(null)}
              className="py-2 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

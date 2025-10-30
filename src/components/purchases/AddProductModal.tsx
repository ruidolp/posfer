// src/components/purchases/AddProductModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface Variety {
  id: string;
  name: string;
  unit_type: string;
  parent: {
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  varieties: Variety[];
}

interface AddProductModalProps {
  onClose: () => void;
  onAdd: (data: {
    varietyId: string;
    productName: string;
    quantity: number;
    totalPaid: number;
  }) => void;
}

const UNIT_TYPES = [
  { value: 'kg', label: 'Kilogramo' },
  { value: 'unidad', label: 'Unidad' },
  { value: 'atado', label: 'Atado' },
];

export default function AddProductModal({ onClose, onAdd }: AddProductModalProps) {
  const { user } = useAuthStore();
  
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null);
  
  const [newParentName, setNewParentName] = useState('');
  const [newVarietyName, setNewVarietyName] = useState('');
  const [unitType, setUnitType] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [totalPaid, setTotalPaid] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`/api/products?tenantId=${user?.tenantId}&active=true`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const filteredVarieties = products.flatMap(product =>
    product.varieties.map(variety => ({
      ...variety,
      parent: { name: product.name }, // Asegurar que parent existe
      displayName: `${product.name} - ${variety.name}`,
    }))
  ).filter(v => 
    v.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddExisting = () => {
    if (!selectedVariety) {
      alert('Selecciona un producto');
      return;
    }

    const qty = parseFloat(quantity);
    const total = parseFloat(totalPaid);

    if (!qty || qty <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    if (!total || total <= 0) {
      alert('Ingresa el total pagado');
      return;
    }

    onAdd({
      varietyId: selectedVariety.id,
      productName: `${selectedVariety.parent.name} - ${selectedVariety.name}`,
      quantity: qty,
      totalPaid: total,
    });
  };

  const handleCreateNew = async () => {
    if (!newParentName.trim()) {
      alert('Ingresa el nombre del producto');
      return;
    }
    if (!newVarietyName.trim()) {
      alert('Ingresa el nombre de la variedad');
      return;
    }

    const qty = parseFloat(quantity);
    const total = parseFloat(totalPaid);

    if (!qty || qty <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    if (!total || total <= 0) {
      alert('Ingresa el total pagado');
      return;
    }

    setSaving(true);

    try {
      // 1. Buscar si existe el producto parent
      let parentId: string | undefined;
      const existingProduct = products.find(
        p => p.name.toLowerCase() === newParentName.trim().toLowerCase()
      );

      if (existingProduct) {
        // Usar el parent existente
        parentId = existingProduct.id;
      } else {
        // Crear nuevo parent
        const parentResponse = await fetch('/api/products/parents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newParentName.trim(),
            suggestedUnit: unitType,
          }),
        });

        const parentData = await parentResponse.json();
        if (!parentData.success) {
          throw new Error(parentData.error || 'Error al crear producto');
        }
        parentId = parentData.data.id;
      }

      // 2. Buscar si existe la variedad
      let varietyId: string | undefined;
      const existingVariety = existingProduct?.varieties.find(
        v => v.name.toLowerCase() === newVarietyName.trim().toLowerCase()
      );

      if (existingVariety) {
        // La variedad ya existe, usarla directamente
        varietyId = existingVariety.id;
        alert('Este producto ya existía. Se agregará stock.');
      } else {
        // Crear nueva variedad
        const varietyResponse = await fetch('/api/products/varieties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parentId,
            name: newVarietyName.trim(),
            unitType,
            basePrice: 0,
            currentStock: qty,
          }),
        });

        const varietyData = await varietyResponse.json();
        if (!varietyData.success) {
          throw new Error(varietyData.error || 'Error al crear variedad');
        }
        varietyId = varietyData.data.id;
      }

      // 3. Agregar al carrito
      onAdd({
        varietyId,
        productName: `${newParentName.trim()} - ${newVarietyName.trim()}`,
        quantity: qty,
        totalPaid: total,
      });

    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al procesar producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={cn(
          'bg-card w-full sm:max-w-md sm:rounded-xl rounded-t-2xl',
          'max-h-[90vh] overflow-y-auto',
          'animate-in slide-in-from-bottom-4 sm:zoom-in-95'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">
            Agregar Producto
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={cn(
                'py-2 px-3 rounded-lg border-2 font-medium transition-all',
                mode === 'existing'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground hover:border-primary/50'
              )}
            >
              Usar Existente
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={cn(
                'py-2 px-3 rounded-lg border-2 font-medium transition-all',
                mode === 'new'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground hover:border-primary/50'
              )}
            >
              Crear Nuevo
            </button>
          </div>

          {/* MODO: EXISTENTE */}
          {mode === 'existing' && (
            <>
              <div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                {selectedVariety ? (
                  <div className="bg-primary/10 border-2 border-primary rounded-lg p-3 flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      {selectedVariety.parent.name} - {selectedVariety.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedVariety(null)}
                      className="text-destructive hover:text-destructive/80 font-bold px-2"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredVarieties.map((variety) => (
                      <button
                        key={variety.id}
                        type="button"
                        onClick={() => setSelectedVariety(variety)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
                      >
                        <div className="font-medium">{variety.displayName}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MODO: NUEVO */}
          {mode === 'new' && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="Ej: Pera Asiática"
                  className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Variedad
                </label>
                <input
                  type="text"
                  value={newVarietyName}
                  onChange={(e) => setNewVarietyName(e.target.value)}
                  placeholder="Ej: Grande, Chica"
                  className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Unidad de Medida
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {UNIT_TYPES.map((unit) => (
                    <button
                      key={unit.value}
                      type="button"
                      onClick={() => setUnitType(unit.value)}
                      className={cn(
                        'py-2 px-3 rounded-lg border-2 font-medium text-sm transition-all',
                        unitType === unit.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground hover:border-primary/50'
                      )}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CANTIDAD Y TOTAL (ambos modos) */}
          <div className="border-t-2 border-border pt-4">
            <h4 className="font-bold text-foreground mb-3">LO QUE COMPRÉ</h4>

            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-2">
                Cantidad
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Total Pagado
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  value={totalPaid}
                  onChange={(e) => setTotalPaid(e.target.value)}
                  placeholder="0"
                  step="1"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {mode === 'new' && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                ⚠️ El producto se agregará al catálogo pero <strong>sin precio de venta</strong>. 
                Configúralo después en Productos.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="py-3 rounded-lg bg-secondary hover:bg-secondary/80 font-bold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={mode === 'existing' ? handleAddExisting : handleCreateNew}
              disabled={saving}
              className="py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/purchases/CreateProductModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface ProductParent {
  id: string;
  name: string;
}

interface CreateProductModalProps {
  onClose: () => void;
  onCreated: (data: {
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
  { value: 'caja', label: 'Caja' },
  { value: 'bolsa', label: 'Bolsa' },
];

export default function CreateProductModal({ onClose, onCreated }: CreateProductModalProps) {
  const { user } = useAuthStore();
  
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [searchParent, setSearchParent] = useState('');
  const [parents, setParents] = useState<ProductParent[]>([]);
  const [selectedParent, setSelectedParent] = useState<ProductParent | null>(null);
  
  const [newParentName, setNewParentName] = useState('');
  const [varietyName, setVarietyName] = useState('');
  const [unitType, setUnitType] = useState('kg');
  const [quantity, setQuantity] = useState('');
  const [totalPaid, setTotalPaid] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'existing') {
      loadParents();
    }
  }, [mode]);

  const loadParents = async () => {
    try {
      const response = await fetch(`/api/products?tenantId=${user?.tenantId}`);
      const data = await response.json();
      if (data.success) {
        setParents(data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const filteredParents = parents.filter(p =>
    p.name.toLowerCase().includes(searchParent.toLowerCase())
  );

  const handleCreate = async () => {
    // Validaciones
    if (mode === 'new' && !newParentName.trim()) {
      alert('Ingresa el nombre del producto');
      return;
    }
    if (mode === 'existing' && !selectedParent) {
      alert('Selecciona un producto base');
      return;
    }
    if (!varietyName.trim()) {
      alert('Ingresa el nombre de la variedad');
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }
    if (!totalPaid || parseFloat(totalPaid) <= 0) {
      alert('Ingresa el total pagado');
      return;
    }

    setSaving(true);

    try {
      // 1. Crear o usar parent existente
      let parentId = selectedParent?.id;

      if (mode === 'new') {
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

      // 2. Crear variedad
      const qty = parseFloat(quantity);
      const total = parseFloat(totalPaid);
      const calculatedUnitPrice = total / qty;

      const varietyResponse = await fetch('/api/products/varieties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId,
          name: varietyName.trim(),
          unitType,
          basePrice: 0, // Sin precio de venta
          currentStock: qty, // Stock inicial
        }),
      });

      const varietyData = await varietyResponse.json();
      if (!varietyData.success) {
        throw new Error(varietyData.error || 'Error al crear variedad');
      }

      // 3. Retornar datos para agregar al carrito
      onCreated({
        varietyId: varietyData.data.id,
        productName: `${mode === 'new' ? newParentName : selectedParent?.name} - ${varietyName}`,
        quantity: qty,
        totalPaid: total,
      });

      alert('Producto creado exitosamente');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al crear producto');
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
            Crear Producto Nuevo
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              PRODUCTO BASE
            </label>
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
                Usar existente
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
                Crear nuevo
              </button>
            </div>
          </div>

          {/* Existing Parent Search */}
          {mode === 'existing' && (
            <div>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchParent}
                  onChange={(e) => setSearchParent(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {selectedParent ? (
                <div className="bg-primary/10 border-2 border-primary rounded-lg p-3 flex items-center justify-between">
                  <span className="font-medium text-foreground">{selectedParent.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedParent(null)}
                    className="text-destructive hover:text-destructive/80 font-bold px-2"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredParents.map((parent) => (
                    <button
                      key={parent.id}
                      type="button"
                      onClick={() => setSelectedParent(parent)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm"
                    >
                      {parent.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Parent Name */}
          {mode === 'new' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={newParentName}
                onChange={(e) => setNewParentName(e.target.value)}
                placeholder="Ej: Pera Asiática"
                className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Variety Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Variedad *
            </label>
            <input
              type="text"
              value={varietyName}
              onChange={(e) => setVarietyName(e.target.value)}
              placeholder="Ej: Grande, Chica, Exportación"
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Unit Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Unidad de Medida *
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

          <div className="border-t-2 border-border pt-4">
            <h4 className="font-bold text-foreground mb-3">LO QUE COMPRÉ</h4>

            {/* Quantity */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-2">
                Cantidad ({UNIT_TYPES.find(u => u.value === unitType)?.label}) *
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

            {/* Total Paid */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Total Pagado *
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

          {/* Warning */}
          <div className="bg-yellow-500/10 border-2 border-yellow-500/20 rounded-lg p-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ El producto se agregará al catálogo pero <strong>sin precio de venta</strong>. 
              Configúralo después en la sección Productos.
            </p>
          </div>

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
              onClick={handleCreate}
              disabled={saving}
              className="py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors disabled:opacity-50"
            >
              {saving ? 'Creando...' : 'Crear y Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

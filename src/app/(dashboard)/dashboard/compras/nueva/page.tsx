// src/app/(dashboard)/dashboard/compras/nueva/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Plus } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import CreateSupplierInline from '@/components/purchases/CreateSupplierInline';
import AddProductModal from '@/components/purchases/AddProductModal';

const CATEGORIES = [
  { value: 'MERCADERIA', label: 'Mercadería' },
  { value: 'TRANSPORTE_BENCINA', label: 'Transporte/Bencina' },
  { value: 'MATERIALES', label: 'Materiales' },
  { value: 'SUELDOS', label: 'Sueldos' },
  { value: 'PUBLICIDAD', label: 'Publicidad' },
  { value: 'GASTOS_FIJOS', label: 'Gastos Fijos' },
  { value: 'IMPREVISTOS_OTROS', label: 'Imprevistos/Otros' },
];

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
}

interface PurchaseItem {
  varietyId: string;
  productName: string;
  quantity: number;
  totalPaid: number;
}

export default function NuevaCompraPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [category, setCategory] = useState('MERCADERIA');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [manualTotal, setManualTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isMercaderia = category === 'MERCADERIA';

  useEffect(() => {
    if (isMercaderia) {
      loadSuppliers();
    }
  }, [isMercaderia]);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await fetch('/api/suppliers?active=true');
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddProduct = (item: PurchaseItem) => {
    setItems([...items, item]);
    setShowAddProduct(false);
  };

  const calculateTotal = () => {
    if (isMercaderia) {
      return items.reduce((sum, item) => sum + item.totalPaid, 0);
    }
    return parseFloat(manualTotal) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (isMercaderia) {
      if (!supplierId) {
        alert('Selecciona un proveedor');
        return;
      }
      if (items.length === 0) {
        alert('Agrega al menos un producto');
        return;
      }
    } else {
      if (!manualTotal || parseFloat(manualTotal) <= 0) {
        alert('Ingresa el monto total');
        return;
      }
    }

    setSaving(true);

    try {
      const data = {
        category,
        ...(isMercaderia && {
          supplierId,
          items: items.map(item => ({
            varietyId: item.varietyId,
            quantity: Number(item.quantity),
            subtotal: Number(item.totalPaid),
          })),
        }),
        total: Number(calculateTotal()),
        notes: notes.trim() || undefined,
      };

      console.log('📤 Enviando compra:', data);

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert('¡Compra registrada exitosamente!');
        router.push('/dashboard/compras');
      } else {
        alert(result.error || 'Error al registrar compra');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al registrar compra');
    } finally {
      setSaving(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Compra</h1>
          <p className="text-sm text-muted-foreground">
            Registra una nueva compra o gasto
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* CATEGORÍA */}
        <div className="bg-card border-2 border-border rounded-xl p-4">
          <label className="block text-sm font-bold text-foreground mb-3">
            CATEGORÍA
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSupplierId('');
                setItems([]);
                setManualTotal('');
              }}
              className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-input bg-background text-foreground font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* PROVEEDOR (solo Mercadería) */}
        {isMercaderia && (
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <label className="block text-sm font-bold text-foreground mb-3">
              PROVEEDOR
            </label>

            {showCreateSupplier ? (
              <CreateSupplierInline
                onCreated={(id) => {
                  setSupplierId(id);
                  setShowCreateSupplier(false);
                  loadSuppliers();
                }}
                onCancel={() => setShowCreateSupplier(false)}
              />
            ) : (
              <>
                <div className="relative mb-3">
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-input bg-background text-foreground font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateSupplier(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-primary text-primary hover:bg-primary/5 font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Crear nuevo proveedor
                </button>
              </>
            )}
          </div>
        )}

        {/* PRODUCTOS (solo Mercadería) */}
        {isMercaderia && (
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <label className="block text-sm font-bold text-foreground mb-3">
              PRODUCTOS
            </label>

            {items.length > 0 && (
              <div className="space-y-2 mb-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-primary/5 border-2 border-primary rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {item.productName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} por {formatCurrency(item.totalPaid)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="ml-3 text-destructive hover:text-destructive/80 font-bold px-2 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAddProduct(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-primary text-primary hover:bg-primary/5 font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar Producto
            </button>
          </div>
        )}

        {/* MONTO TOTAL (solo si NO es Mercadería) */}
        {!isMercaderia && (
          <div className="bg-card border-2 border-border rounded-xl p-4">
            <label className="block text-sm font-bold text-foreground mb-3">
              MONTO TOTAL
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                $
              </span>
              <input
                type="number"
                value={manualTotal}
                onChange={(e) => setManualTotal(e.target.value)}
                placeholder="0"
                step="1"
                min="0"
                required={!isMercaderia}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input bg-background text-foreground text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* COMENTARIO */}
        <div className="bg-card border-2 border-border rounded-xl p-4">
          <label className="block text-sm font-bold text-foreground mb-3">
            COMENTARIO
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales sobre esta compra..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* TOTAL */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border-2 border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">TOTAL</span>
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-72 z-40 px-4 py-3 bg-card border-t-2 border-border">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="py-3 rounded-lg bg-secondary hover:bg-secondary/80 font-bold transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || total <= 0}
            className="py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Compra'}
          </button>
        </div>
      </div>

      {/* Modal agregar producto */}
      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  );
}

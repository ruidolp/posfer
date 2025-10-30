// src/app/(dashboard)/dashboard/productos/[id]/editar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import VarietyAccordion from '@/components/products/VarietyAccordion';

interface Variety {
  id: string;
  name: string;
  unit_type: string;
  base_price: string;
  current_stock: string;
  packages: Array<{ quantity: string; total_price: string }>;
}

// Función para generar IDs únicos compatible con todos los navegadores
const generateId = () => {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function EditarProductoPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productName, setProductName] = useState('');
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [expandedVariety, setExpandedVariety] = useState<number>(0);

  useEffect(() => {
    if (user?.tenantId && productId) {
      loadProduct();
    }
  }, [user, productId]);

  const loadProduct = async () => {
    if (!user?.tenantId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/products/${productId}?tenantId=${user.tenantId}`
      );
      const data = await response.json();

      if (data.success) {
        const product = data.data;
        setProductName(product.name);

        // Mapear variedades existentes
        const mappedVarieties = product.varieties.map((v: any) => ({
          id: v.id,
          name: v.name,
          unit_type: v.unit_type,
          base_price: v.base_price.toString(),
          current_stock: v.current_stock ? v.current_stock.toString() : '',
          packages: v.price_options.map((opt: any) => ({
            quantity: opt.quantity.toString(),
            total_price: opt.total_price.toString()
          }))
        }));

        setVarieties(mappedVarieties);
      } else {
        alert('Error al cargar producto: ' + data.error);
        router.push('/dashboard/productos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar producto');
      router.push('/dashboard/productos');
    } finally {
      setLoading(false);
    }
  };

  const addVariety = () => {
    const newVariety: Variety = {
      id: generateId(),
      name: '',
      unit_type: '',
      base_price: '',
      current_stock: '',
      packages: []
    };

    setVarieties([...varieties, newVariety]);
    setExpandedVariety(varieties.length);
  };

  const updateVariety = (index: number, updated: Variety) => {
    const newVarieties = [...varieties];
    newVarieties[index] = updated;
    setVarieties(newVarieties);
  };

  const removeVariety = (index: number) => {
    if (varieties.length === 1) {
      alert('Debe haber al menos una variedad');
      return;
    }

    setVarieties(varieties.filter((_, i) => i !== index));
    if (expandedVariety >= varieties.length - 1) {
      setExpandedVariety(Math.max(0, varieties.length - 2));
    }
  };

  const validateForm = (): string | null => {
    if (!productName.trim()) {
      return 'El nombre del producto es obligatorio';
    }

    if (varieties.length === 0) {
      return 'Debes tener al menos una variedad';
    }

    for (let i = 0; i < varieties.length; i++) {
      const v = varieties[i];

      if (!v.name.trim()) {
        return `Completa el nombre de la variedad ${i + 1}`;
      }

      if (!v.unit_type) {
        return `Selecciona la unidad de la variedad ${i + 1}`;
      }

      if (!v.base_price || parseFloat(v.base_price) <= 0) {
        return `Ingresa el precio de la variedad ${i + 1}`;
      }

      for (let j = 0; j < v.packages.length; j++) {
        const pkg = v.packages[j];
        if (pkg.quantity || pkg.total_price) {
          if (!pkg.quantity || parseFloat(pkg.quantity) <= 0) {
            return `Completa la cantidad del paquete ${j + 1} en variedad ${i + 1}`;
          }
          if (!pkg.total_price || parseFloat(pkg.total_price) <= 0) {
            return `Completa el precio del paquete ${j + 1} en variedad ${i + 1}`;
          }
        }
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    if (!user?.tenantId) {
      alert('No hay usuario autenticado');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: user.tenantId,
          parentName: productName,
          varieties: varieties.map(v => ({
            id: v.id,
            name: v.name,
            unit_type: v.unit_type,
            base_price: parseFloat(v.base_price),
            current_stock: v.current_stock ? parseFloat(v.current_stock) : null,
            packages: v.packages
              .filter(p => p.quantity && p.total_price)
              .map(p => ({
                quantity: parseFloat(p.quantity),
                total_price: parseFloat(p.total_price)
              }))
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('¡Producto actualizado exitosamente!');
        router.push('/dashboard/productos');
      } else {
        alert(data.error || 'Error al actualizar producto');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/products/${productId}?tenantId=${user?.tenantId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        alert('Producto eliminado');
        router.push('/dashboard/productos');
      } else {
        alert(data.error || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar producto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b-2 border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">
            Editar Producto
          </h1>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Nombre del producto */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre del producto
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej: Manzana, Papa"
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Variedades */}
          <div>
            <div className="mb-3">
              <h3 className="font-semibold text-foreground mb-1">VARIEDADES</h3>
              <p className="text-xs text-muted-foreground">
                💡 Edita, agrega o elimina variedades
              </p>
            </div>

            <div className="space-y-3">
              {varieties.map((variety, index) => (
                <VarietyAccordion
                  key={variety.id}
                  variety={variety}
                  index={index}
                  isFirst={varieties.length === 1}
                  isExpanded={expandedVariety === index}
                  onToggle={() => setExpandedVariety(index)}
                  onChange={(updated) => updateVariety(index, updated)}
                  onRemove={() => removeVariety(index)}
                />
              ))}
            </div>

            {/* Agregar variedad */}
            <button
              type="button"
              onClick={addVariety}
              className="w-full mt-3 px-4 py-3 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-lg text-foreground font-semibold transition-colors"
            >
              + Agregar otra variedad
            </button>
          </div>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-3 pt-4">
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
              disabled={saving}
              className="py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

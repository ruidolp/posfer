// src/components/products/ProductForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

const productSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  unitType: z.string().optional(),
  stock: z.number().int().nonnegative().optional().nullable(),
  alertStock: z.number().int().nonnegative().optional().nullable(),
});

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

const UNIT_TYPES = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'gr', label: 'Gramo (gr)' },
  { value: 'lt', label: 'Litro (lt)' },
  { value: 'mt', label: 'Metro (mt)' },
  { value: 'caja', label: 'Caja' },
  { value: 'paquete', label: 'Paquete' },
];

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useStock, setUseStock] = useState(product?.stock !== null && product?.stock !== undefined);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price ? Number(product.price) : 0,
    unitType: product?.unitType || 'unidad',
    stock: product?.stock || 0,
    alertStock: product?.alertStock || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar datos
      const dataToValidate = {
        ...formData,
        stock: useStock ? formData.stock : null,
        alertStock: useStock ? formData.alertStock : null,
      };

      const validation = productSchema.safeParse(dataToValidate);
      if (!validation.success) {
        setError(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      // Crear o actualizar
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToValidate),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar producto');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/productos');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Nombre del Producto *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={cn(
            'w-full px-4 py-3 rounded-lg border border-input',
            'bg-background text-foreground',
            'min-h-touch text-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary'
          )}
          placeholder="Ej: Tomate"
          required
        />
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Precio *
        </label>
        <input
          type="number"
          step="1"
          min="0"
          value={formData.price || ''}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          className={cn(
            'w-full px-4 py-3 rounded-lg border border-input',
            'bg-background text-foreground',
            'min-h-touch text-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary'
          )}
          placeholder="0"
          required
        />
      </div>

      {/* Unidad de Medida */}
      <div>
        <label className="block text-sm font-semibold mb-2">
          Unidad de Medida
        </label>
        <select
          value={formData.unitType}
          onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
          className={cn(
            'w-full px-4 py-3 rounded-lg border border-input',
            'bg-background text-foreground',
            'min-h-touch text-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary'
          )}
        >
          {UNIT_TYPES.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>

      {/* Control de Stock */}
      <div className="border border-border rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useStock}
            onChange={(e) => setUseStock(e.target.checked)}
            className="w-6 h-6 rounded border-input"
          />
          <div>
            <div className="font-semibold">Controlar Inventario</div>
            <div className="text-sm text-muted-foreground">
              Activar para descontar stock automáticamente
            </div>
          </div>
        </label>

        {useStock && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Stock Actual
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.stock || ''}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className={cn(
                  'w-full px-4 py-3 rounded-lg border border-input',
                  'bg-background text-foreground',
                  'min-h-touch text-lg',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Alerta Stock Bajo
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.alertStock || ''}
                onChange={(e) => setFormData({ ...formData, alertStock: Number(e.target.value) })}
                className={cn(
                  'w-full px-4 py-3 rounded-lg border border-input',
                  'bg-background text-foreground',
                  'min-h-touch text-lg',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                placeholder="0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className={cn(
            'flex-1 px-6 py-3 rounded-lg',
            'min-h-touch text-lg font-semibold',
            'bg-secondary text-secondary-foreground',
            'hover:bg-secondary/80 transition-colors'
          )}
          disabled={loading}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className={cn(
            'flex-1 px-6 py-3 rounded-lg',
            'min-h-touch text-lg font-semibold',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          disabled={loading}
        >
          {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}

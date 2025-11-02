// src/components/locations/CreateLocationInline.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateLocationInlineProps {
  onCreated: (locationId: string) => void;
  onCancel: () => void;
}

export default function CreateLocationInline({ onCreated, onCancel }: CreateLocationInlineProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Ingresa el nombre de la ubicación');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          address: formData.address.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onCreated(data.data.id);
      } else {
        alert(data.error || 'Error al crear ubicación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear ubicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary/30 rounded-lg p-4 border-2 border-primary">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">Nueva Ubicación</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-secondary rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Feria Lo Valledor"
            className={cn(
              'w-full px-3 py-2 rounded-lg border-2 border-input',
              'bg-background text-foreground',
              'focus:outline-none focus:border-primary'
            )}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Dirección (Opcional)
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Ej: Av. Lo Valledor 1000"
            className={cn(
              'w-full px-3 py-2 rounded-lg border-2 border-input',
              'bg-background text-foreground',
              'focus:outline-none focus:border-primary'
            )}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}

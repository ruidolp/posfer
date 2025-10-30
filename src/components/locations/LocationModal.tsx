// src/components/locations/LocationModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
}

interface LocationModalProps {
  location: Location | null;
  onClose: () => void;
  onSave: (data: { name: string; address?: string; notes?: string }) => void;
}

export default function LocationModal({ location, onClose, onSave }: LocationModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location) {
      setName(location.name);
      setAddress(location.address || '');
      setNotes(location.notes || '');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
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
            {location ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Feria Lo Valledor"
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Av. San Pablo 5200"
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Comentario
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
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
              type="submit"
              disabled={saving}
              className="py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : location ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

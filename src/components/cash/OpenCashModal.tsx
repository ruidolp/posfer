// src/components/cash/OpenCashModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  name: string;
}

interface OpenCashModalProps {
  onClose: () => void;
  onOpen: (data: { openingAmount: number; locationId?: string; notes?: string }) => void;
}

export default function OpenCashModal({ onClose, onOpen }: OpenCashModalProps) {
  const [openingAmount, setOpeningAmount] = useState('');
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await fetch('/api/locations?active=true');
      const data = await response.json();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(openingAmount);
    if (!amount || amount < 0) {
      alert('Ingresa un monto válido');
      return;
    }

    setLoading(true);
    onOpen({
      openingAmount: amount,
      locationId: locationId || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={cn(
          'bg-card w-full sm:max-w-md sm:rounded-xl rounded-t-2xl',
          'animate-in slide-in-from-bottom-4 sm:zoom-in-95'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-foreground">Abrir Caja</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Monto Inicial */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Monto Inicial *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">
                $
              </span>
              <input
                type="number"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                placeholder="0"
                step="1"
                min="0"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input bg-background text-foreground text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Ubicación */}
          {locations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ubicación (opcional)
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Ninguna</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Notas (opcional)
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
              disabled={loading}
              className="py-3 rounded-lg bg-secondary hover:bg-secondary/80 font-bold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Abriendo...' : 'Abrir Caja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

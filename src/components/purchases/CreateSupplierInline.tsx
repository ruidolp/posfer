// src/components/purchases/CreateSupplierInline.tsx
'use client';

import { useState } from 'react';

interface CreateSupplierInlineProps {
  onCreated: (id: string) => void;
  onCancel: () => void;
}

export default function CreateSupplierInline({ onCreated, onCancel }: CreateSupplierInlineProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          location: location.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onCreated(result.data.id);
      } else {
        alert(result.error || 'Error al crear proveedor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear proveedor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-primary/5 border-2 border-primary rounded-lg p-4 space-y-3">
      <h4 className="font-bold text-foreground text-sm">NUEVO PROVEEDOR</h4>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">
          Nombre *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Feria Lo Valledor"
          className="w-full px-3 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+56 9 1234 5678"
          className="w-full px-3 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">
          Ubicación
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Feria Lo Valledor, sector A"
          className="w-full px-3 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="py-2 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-colors disabled:opacity-50 text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className="py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 text-sm"
        >
          {saving ? 'Creando...' : 'Crear'}
        </button>
      </div>
    </div>
  );
}

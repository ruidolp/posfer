// src/components/purchases/SupplierSelectorSimple.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
}

interface SupplierSelectorSimpleProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function SupplierSelectorSimple({ selectedId, onSelect }: SupplierSelectorSimpleProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  
  // Form fields para crear
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/suppliers?active=true');
      const data = await response.json();

      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

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
        await loadSuppliers();
        onSelect(result.data.id);
        setShowCreate(false);
        // Reset
        setName('');
        setPhone('');
        setLocation('');
        setNotes('');
        alert('Proveedor creado');
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

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSupplier = suppliers.find(s => s.id === selectedId);

  if (showCreate) {
    return (
      <div className="bg-primary/5 border-2 border-primary rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-foreground">Nuevo Proveedor</h4>
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nombre *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Feria Lo Valledor"
            className="w-full px-4 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+56 9 1234 5678"
            className="w-full px-4 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Ubicación
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Feria Lo Valledor, sector A"
            className="w-full px-4 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales..."
            rows={2}
            className="w-full px-4 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            disabled={saving}
            className="py-2 rounded-lg bg-secondary hover:bg-secondary/80 font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Selected */}
      {selectedSupplier && (
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-3">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground">{selectedSupplier.name}</div>
              {selectedSupplier.phone && (
                <div className="text-sm text-muted-foreground">{selectedSupplier.phone}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSelect('')}
              className="text-destructive hover:text-destructive/80 font-bold px-2 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {!selectedId && (
        <>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Cargando proveedores...
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              {search ? 'No se encontraron proveedores' : 'No hay proveedores'}
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredSuppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => onSelect(supplier.id)}
                  className="w-full bg-card border-2 border-border rounded-lg p-3 text-left hover:border-primary transition-all"
                >
                  <div className="font-medium text-foreground">{supplier.name}</div>
                  {supplier.phone && (
                    <div className="text-sm text-muted-foreground">📞 {supplier.phone}</div>
                  )}
                  {supplier.location && (
                    <div className="text-sm text-muted-foreground">📍 {supplier.location}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Create New */}
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-primary text-primary hover:bg-primary/5 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crear nuevo proveedor
          </button>
        </>
      )}
    </div>
  );
}

// src/components/purchases/SupplierSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import SupplierModal from '@/components/suppliers/SupplierModal';

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
}

interface SupplierSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function SupplierSelector({ selectedId, onSelect }: SupplierSelectorProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  const handleCreateSupplier = async (data: {
    name: string;
    phone?: string;
    location?: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        await loadSuppliers();
        onSelect(result.data.id);
        setShowModal(false);
        alert('Proveedor creado');
      } else {
        alert(result.error || 'Error al crear proveedor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear proveedor');
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSupplier = suppliers.find(s => s.id === selectedId);

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
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-primary text-primary hover:bg-primary/5 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crear nuevo proveedor
          </button>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <SupplierModal
          supplier={null}
          onClose={() => setShowModal(false)}
          onSave={handleCreateSupplier}
        />
      )}
    </div>
  );
}

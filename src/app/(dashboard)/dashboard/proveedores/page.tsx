// src/app/(dashboard)/dashboard/proveedores/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, User, Phone, MapPin, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import SupplierModal from '@/components/suppliers/SupplierModal';

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  _count?: {
    purchases: number;
  };
}

export default function ProveedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    const filtered = suppliers.filter(sup =>
      sup.name.toLowerCase().includes(search.toLowerCase()) ||
      sup.phone?.toLowerCase().includes(search.toLowerCase()) ||
      sup.location?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  }, [search, suppliers]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/suppliers');
      const data = await response.json();

      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      alert('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    const hasPurchases = supplier._count && supplier._count.purchases > 0;
    const message = hasPurchases
      ? `El proveedor "${supplier.name}" tiene ${supplier._count?.purchases} compra(s) asociadas. Se desactivará en lugar de eliminarse. ¿Continuar?`
      : `¿Eliminar proveedor "${supplier.name}"?`;

    if (!confirm(message)) return;

    try {
      const response = await fetch(`/api/suppliers?id=${supplier.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Proveedor eliminado');
        loadSuppliers();
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar proveedor');
    }
  };

  const handleSave = async (data: {
    name: string;
    phone?: string;
    location?: string;
    notes?: string;
  }) => {
    try {
      const url = '/api/suppliers';
      const method = selectedSupplier ? 'PATCH' : 'POST';
      const body = selectedSupplier
        ? { id: selectedSupplier.id, ...data }
        : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        alert(selectedSupplier ? 'Proveedor actualizado' : 'Proveedor creado');
        setShowModal(false);
        loadSuppliers();
      } else {
        alert(result.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar proveedor');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus proveedores
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proveedor..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Cargando proveedores...
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? 'No se encontraron proveedores' : 'No hay proveedores registrados'}
          </p>
          {!search && (
            <button
              onClick={handleCreate}
              className="mt-4 text-primary hover:underline"
            >
              Crear primer proveedor
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className={cn(
                'bg-card border-2 border-border rounded-xl p-4',
                !supplier.active && 'opacity-50'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-primary flex-shrink-0" />
                    <h3 className="font-bold text-foreground text-lg truncate">
                      {supplier.name}
                    </h3>
                    {!supplier.active && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                        Inactivo
                      </span>
                    )}
                  </div>

                  <div className="ml-7 space-y-1">
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {supplier.phone}
                      </div>
                    )}
                    {supplier.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {supplier.location}
                      </div>
                    )}
                    {supplier.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        💬 {supplier.notes}
                      </p>
                    )}
                    {supplier._count && supplier._count.purchases > 0 && (
                      <p className="text-xs text-primary font-medium">
                        📦 {supplier._count.purchases} compra{supplier._count.purchases !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Pencil className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

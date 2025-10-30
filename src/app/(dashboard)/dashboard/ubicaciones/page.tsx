// src/app/(dashboard)/dashboard/ubicaciones/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import LocationModal from '@/components/locations/LocationModal';

interface Location {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export default function UbicacionesPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    const filtered = locations.filter(loc =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.address?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [search, locations]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations');
      const data = await response.json();

      if (data.success) {
        setLocations(data.data);
      }
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
      alert('Error al cargar ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedLocation(null);
    setShowModal(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setShowModal(true);
  };

  const handleDelete = async (location: Location) => {
    if (!confirm(`¿Eliminar ubicación "${location.name}"?`)) return;

    try {
      const response = await fetch(`/api/locations?id=${location.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Ubicación eliminada');
        loadLocations();
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar ubicación');
    }
  };

  const handleSave = async (data: {
    name: string;
    address?: string;
    notes?: string;
  }) => {
    try {
      const url = selectedLocation ? '/api/locations' : '/api/locations';
      const method = selectedLocation ? 'PATCH' : 'POST';
      const body = selectedLocation
        ? { id: selectedLocation.id, ...data }
        : data;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        alert(selectedLocation ? 'Ubicación actualizada' : 'Ubicación creada');
        setShowModal(false);
        loadLocations();
      } else {
        alert(result.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar ubicación');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ubicaciones</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus ubicaciones y ferias
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nueva
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ubicación..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Cargando ubicaciones...
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? 'No se encontraron ubicaciones' : 'No hay ubicaciones registradas'}
          </p>
          {!search && (
            <button
              onClick={handleCreate}
              className="mt-4 text-primary hover:underline"
            >
              Crear primera ubicación
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className={cn(
                'bg-card border-2 border-border rounded-xl p-4',
                !location.active && 'opacity-50'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <h3 className="font-bold text-foreground text-lg truncate">
                      {location.name}
                    </h3>
                    {!location.active && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                        Inactiva
                      </span>
                    )}
                  </div>
                  {location.address && (
                    <p className="text-sm text-muted-foreground ml-7 mb-2">
                      📍 {location.address}
                    </p>
                  )}
                  {location.notes && (
                    <p className="text-sm text-muted-foreground ml-7 line-clamp-2">
                      💬 {location.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(location)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Pencil className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(location)}
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
        <LocationModal
          location={selectedLocation}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

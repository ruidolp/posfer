// src/app/(dashboard)/dashboard/productos/nuevo/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import ProductSearch from '@/components/products/ProductSearch';
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
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default function NuevoProductoPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState<'search' | 'form'>('search');
  const [productName, setProductName] = useState('');
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [suggestedUnit, setSuggestedUnit] = useState<string | null>(null);
  const [varieties, setVarieties] = useState<Variety[]>([]);
  const [expandedVariety, setExpandedVariety] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSelectCatalog = (product: any) => {
    setProductName(product.name);
    setCatalogId(product.id);
    setSuggestedUnit(product.suggested_unit);
    
    // Crear primera variedad con unidad sugerida
    setVarieties([{
      id: generateId(),
      name: '',
      unit_type: product.suggested_unit || '',
      base_price: '',
      current_stock: '',
      packages: []
    }]);
    
    setStep('form');
  };

  const handleSelectOwn = (product: any) => {
    // Si selecciona uno propio, redirigir a editar
    router.push(`/dashboard/productos/${product.id}/editar`);
  };

  const handleCreateNew = (name: string) => {
    setProductName(name);
    setCatalogId(null);
    setSuggestedUnit(null);
    
    // Crear primera variedad vacía
    setVarieties([{
      id: generateId(),
      name: '',
      unit_type: '',
      base_price: '',
      current_stock: '',
      packages: []
    }]);
    
    setStep('form');
  };

  const addVariety = () => {
    const newVariety: Variety = {
      id: generateId(),
      name: '',
      unit_type: suggestedUnit || '',
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
      return 'Debes agregar al menos una variedad';
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

      // Validar paquetes
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

    if (!user) {
      alert('No hay usuario autenticado');
      return;
    }

    // Usar tenantId (camelCase) que es el campo correcto
    const tenantId = user.tenantId || (user as any).tenant_id;
    
    if (!tenantId) {
      console.error('❌ No se encontró tenantId en el usuario:', user);
      alert('Error: No se pudo obtener el ID del negocio. Por favor, vuelve a iniciar sesión.');
      return;
    }

    console.log('👤 Usuario:', user);
    console.log('🏢 Tenant ID encontrado:', tenantId);

    const payload = {
      tenantId: tenantId,
      parentName: productName,
      catalogId,
      varieties: varieties.map(v => ({
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
    };

    console.log('📤 Enviando payload:', payload);

    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.status === 409) {
        // Producto duplicado
        if (confirm(`El producto "${productName}" ya existe. ¿Quieres agregar otra variedad al producto existente?`)) {
          router.push(data.redirect);
        }
        return;
      }

      if (data.success) {
        alert('¡Producto creado exitosamente!');
        router.push('/dashboard/productos');
      } else {
        alert(data.error || 'Error al crear producto');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b-2 border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step === 'form' ? setStep('search') : router.back()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">
            {step === 'search' ? 'Buscar Producto' : 'Nuevo Producto'}
          </h1>
        </div>
      </div>

      {/* DEBUG - Mostrar info del usuario */}
      <div className="p-4 bg-yellow-50 border-b-2 border-yellow-200">
        <details className="cursor-pointer">
          <summary className="font-bold text-sm">🐛 DEBUG - Info del Usuario</summary>
          <div className="mt-2 text-xs space-y-1">
            <div>✅ user existe: {user ? 'Sí' : '❌ NO'}</div>
            <div className="font-bold text-green-600">✅ user.tenantId: {user?.tenantId || '❌ NO EXISTE'}</div>
            <div>✅ user.id: {user?.id || '❌ NO EXISTE'}</div>
            <div>✅ user.name: {user?.name || '❌ NO EXISTE'}</div>
            <div className="text-gray-500">⚠️ user.tenant_id (legacy): {(user as any)?.tenant_id || '❌ NO EXISTE'}</div>
            <details className="mt-2">
              <summary className="font-semibold cursor-pointer">Ver user completo</summary>
              <pre className="mt-2 p-2 bg-white rounded border text-[10px] overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        </details>
      </div>

      <div className="p-4">
        {step === 'search' ? (
          /* BÚSQUEDA */
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Buscar o crear producto
              </h2>
              <p className="text-sm text-muted-foreground">
                Busca en el catálogo o crea uno nuevo
              </p>
            </div>

            {user && (
              <ProductSearch
                tenantId={user.tenantId || (user as any).tenant_id || ''}
                onSelectCatalog={handleSelectCatalog}
                onSelectOwn={handleSelectOwn}
                onCreateNew={handleCreateNew}
              />
            )}
          </div>
        ) : (
          /* FORMULARIO */
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
              <div className="text-xs text-muted-foreground mt-1">
                💡 Nombre general del producto
              </div>
            </div>

            {/* Variedades */}
            <div>
              <div className="mb-3">
                <h3 className="font-semibold text-foreground mb-1">VARIEDADES</h3>
                <p className="text-xs text-muted-foreground">
                  💡 Si solo tienes una, igual ponle un nombre (Ej: Normal, Única)
                </p>
              </div>

              <div className="space-y-3">
                {varieties.map((variety, index) => (
                  <VarietyAccordion
                    key={variety.id}
                    variety={variety}
                    index={index}
                    isFirst={index === 0}
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
                onClick={() => setStep('search')}
                disabled={loading}
                className="py-3 rounded-lg bg-secondary hover:bg-secondary/80 font-bold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

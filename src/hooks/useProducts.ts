// src/hooks/useProducts.ts
import { useState, useEffect, useRef } from 'react';

interface Product {
  id: string;
  name: string;
  varieties: any[];
}

interface UseProductsOptions {
  tenantId: string | undefined;
  cashRegisterId?: string;
  active?: boolean;
  autoLoad?: boolean;
}

export function useProducts({
  tenantId,
  cashRegisterId,
  active = true,
  autoLoad = true
}: UseProductsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cache para evitar llamadas duplicadas
  const loadingRef = useRef(false);
  const cacheRef = useRef<{ key: string; data: Product[]; timestamp: number } | null>(null);
  const CACHE_TIME = 30000; // 30 segundos

  const loadProducts = async (force = false) => {
    if (!tenantId) {
      console.warn('useProducts: No tenantId provided');
      return;
    }

    // Evitar llamadas duplicadas simultáneas
    if (loadingRef.current && !force) {
      console.log('useProducts: Ya hay una carga en progreso, omitiendo...');
      return;
    }

    // Verificar cache
    const cacheKey = `${tenantId}-${cashRegisterId}-${active}`;
    const now = Date.now();
    
    if (!force && cacheRef.current && cacheRef.current.key === cacheKey) {
      const cacheAge = now - cacheRef.current.timestamp;
      if (cacheAge < CACHE_TIME) {
        console.log('useProducts: Usando cache (age:', Math.round(cacheAge / 1000), 's)');
        setProducts(cacheRef.current.data);
        return;
      }
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        tenantId,
        active: active.toString()
      });

      if (cashRegisterId) {
        params.append('cashRegisterId', cashRegisterId);
      }

      console.log('📦 useProducts: Cargando productos...', params.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data || []);
        
        // Guardar en cache
        cacheRef.current = {
          key: cacheKey,
          data: data.data || [],
          timestamp: now
        };
        
        console.log('✅ useProducts: Productos cargados:', data.data?.length || 0);
      } else {
        setError(data.error || 'Error al cargar productos');
        console.error('❌ useProducts:', data.error);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('❌ useProducts: Error de red:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Auto-cargar si está habilitado
  useEffect(() => {
    if (autoLoad && tenantId) {
      loadProducts();
    }
  }, [tenantId, cashRegisterId, active, autoLoad]);

  // Función para refrescar manualmente
  const refresh = () => loadProducts(true);

  // Limpiar cache al desmontar
  useEffect(() => {
    return () => {
      cacheRef.current = null;
    };
  }, []);

  return {
    products,
    loading,
    error,
    refresh,
    loadProducts
  };
}

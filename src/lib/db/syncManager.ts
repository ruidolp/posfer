// src/lib/db/syncManager.ts
import { db, saveOfflineSale, getPendingSales, markSaleAsSynced } from './indexedDB';

/**
 * Sincroniza ventas pendientes con el servidor
 */
export async function syncPendingSales(tenantId: string): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const pendingSales = await getPendingSales(tenantId);
  
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const sale of pendingSales) {
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: sale.items,
          payments: sale.payments,
          total: sale.total,
          locationId: sale.locationId,
          localId: sale.localId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await markSaleAsSynced(sale.localId, data.data.id);
        success++;
      } else {
        failed++;
        const errorData = await response.json();
        errors.push(`Venta ${sale.localId}: ${errorData.error}`);
      }
    } catch (error: any) {
      failed++;
      errors.push(`Venta ${sale.localId}: ${error.message}`);
    }
  }

  return { success, failed, errors };
}

/**
 * Sincroniza productos desde el servidor
 */
export async function syncProductsFromServer(): Promise<boolean> {
  try {
    const response = await fetch('/api/products?active=true');
    
    if (!response.ok) {
      throw new Error('Error al obtener productos del servidor');
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      // Actualizar productos en IndexedDB
      await db.products.clear();
      await db.products.bulkPut(data.data);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error al sincronizar productos:', error);
    return false;
  }
}

/**
 * Sincroniza proveedores desde el servidor
 */
export async function syncProvidersFromServer(): Promise<boolean> {
  try {
    const response = await fetch('/api/providers?active=true');
    
    if (!response.ok) {
      throw new Error('Error al obtener proveedores del servidor');
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      await db.providers.clear();
      await db.providers.bulkPut(data.data);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error al sincronizar proveedores:', error);
    return false;
  }
}

/**
 * Sincroniza ubicaciones desde el servidor
 */
export async function syncLocationsFromServer(): Promise<boolean> {
  try {
    const response = await fetch('/api/locations?active=true');
    
    if (!response.ok) {
      throw new Error('Error al obtener ubicaciones del servidor');
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      await db.locations.clear();
      await db.locations.bulkPut(data.data);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error al sincronizar ubicaciones:', error);
    return false;
  }
}

/**
 * Sincronización completa
 */
export async function performFullSync(tenantId: string): Promise<{
  success: boolean;
  salesSynced: number;
  salesFailed: number;
  errors: string[];
}> {
  const results = {
    success: true,
    salesSynced: 0,
    salesFailed: 0,
    errors: [] as string[],
  };

  try {
    // Sincronizar ventas pendientes
    const salesResult = await syncPendingSales(tenantId);
    results.salesSynced = salesResult.success;
    results.salesFailed = salesResult.failed;
    results.errors.push(...salesResult.errors);

    // Sincronizar datos desde servidor
    await Promise.all([
      syncProductsFromServer(),
      syncProvidersFromServer(),
      syncLocationsFromServer(),
    ]);

    results.success = salesResult.failed === 0;
  } catch (error: any) {
    results.success = false;
    results.errors.push(`Error general: ${error.message}`);
  }

  return results;
}

/**
 * Verifica si hay datos pendientes de sincronizar
 */
export async function hasPendingSync(tenantId: string): Promise<boolean> {
  const pendingSales = await getPendingSales(tenantId);
  return pendingSales.length > 0;
}

/**
 * Hook para sincronización automática
 */
export function setupAutoSync(tenantId: string, intervalMs: number = 60000) {
  let syncInterval: NodeJS.Timeout;

  const startSync = () => {
    syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        const hasPending = await hasPendingSync(tenantId);
        if (hasPending) {
          console.log('Sincronizando datos pendientes...');
          await performFullSync(tenantId);
        }
      }
    }, intervalMs);
  };

  const stopSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }
  };

  // Iniciar sincronización automática
  startSync();

  // Sincronizar cuando se recupera conexión
  const handleOnline = async () => {
    console.log('Conexión restaurada, sincronizando...');
    await performFullSync(tenantId);
  };

  window.addEventListener('online', handleOnline);

  // Retornar función de limpieza
  return () => {
    stopSync();
    window.removeEventListener('online', handleOnline);
  };
}

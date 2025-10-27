// src/lib/db/indexedDB.ts
import Dexie, { Table } from 'dexie';
import type { Product, Sale, SaleItem, Payment, Provider, Location } from '@/types';

export interface LocalSale extends Omit<Sale, 'id'> {
  localId: string;
  synced: boolean;
  createdAt: Date;
}

export interface SyncQueue {
  id?: number;
  operationType: 'sale' | 'purchase' | 'product_update';
  operationData: any;
  status: 'pending' | 'synced' | 'error';
  attempts: number;
  createdAt: Date;
  errorMessage?: string;
}

export class POSDatabase extends Dexie {
  products!: Table<Product, string>;
  sales!: Table<LocalSale, string>;
  providers!: Table<Provider, string>;
  locations!: Table<Location, string>;
  syncQueue!: Table<SyncQueue, number>;

  constructor() {
    super('POSFeriasDB');
    
    this.version(1).stores({
      products: 'id, tenantId, name, active, [tenantId+active]',
      sales: 'localId, tenantId, userId, saleDate, synced, [tenantId+synced]',
      providers: 'id, tenantId, name, active',
      locations: 'id, tenantId, name, active',
      syncQueue: '++id, status, operationType, createdAt',
    });
  }
}

export const db = new POSDatabase();

/**
 * Inicializa la base de datos local con datos del servidor
 */
export async function initializeLocalDB(tenantId: string) {
  try {
    const response = await fetch('/api/sync/initialize', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al inicializar base de datos local');
    }

    const data = await response.json();

    // Guardar productos
    if (data.products?.length > 0) {
      await db.products.bulkPut(data.products);
    }

    // Guardar proveedores
    if (data.providers?.length > 0) {
      await db.providers.bulkPut(data.providers);
    }

    // Guardar ubicaciones
    if (data.locations?.length > 0) {
      await db.locations.bulkPut(data.locations);
    }

    console.log('Base de datos local inicializada');
  } catch (error) {
    console.error('Error al inicializar DB local:', error);
    throw error;
  }
}

/**
 * Guarda una venta offline
 */
export async function saveOfflineSale(sale: Omit<LocalSale, 'localId' | 'synced' | 'createdAt'>) {
  const localId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const localSale: LocalSale = {
    ...sale,
    localId,
    synced: false,
    createdAt: new Date(),
  };

  await db.sales.add(localSale);

  // Agregar a la cola de sincronización
  await db.syncQueue.add({
    operationType: 'sale',
    operationData: localSale,
    status: 'pending',
    attempts: 0,
    createdAt: new Date(),
  });

  return localId;
}

/**
 * Obtiene ventas pendientes de sincronización
 */
export async function getPendingSales(tenantId: string) {
  return db.sales
    .where('[tenantId+synced]')
    .equals([tenantId, 0])
    .toArray();
}

/**
 * Marca una venta como sincronizada
 */
export async function markSaleAsSynced(localId: string, serverId: string) {
  await db.sales.update(localId, { synced: true, id: serverId });
}

/**
 * Limpia datos antiguos (más de X días)
 */
export async function cleanOldData(daysToKeep: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  // Limpiar ventas antiguas sincronizadas
  await db.sales
    .where('saleDate')
    .below(cutoffDate)
    .and(sale => sale.synced === true)
    .delete();

  // Limpiar cola de sync antigua
  await db.syncQueue
    .where('createdAt')
    .below(cutoffDate)
    .and(item => item.status === 'synced')
    .delete();
}

/**
 * Obtiene estadísticas de almacenamiento
 */
export async function getStorageStats() {
  const productsCount = await db.products.count();
  const salesCount = await db.sales.count();
  const pendingSales = await db.sales.where('synced').equals(0).count();
  const queueCount = await db.syncQueue.where('status').equals('pending').count();

  return {
    products: productsCount,
    sales: salesCount,
    pendingSales,
    queueItems: queueCount,
  };
}

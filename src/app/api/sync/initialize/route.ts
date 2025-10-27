// src/app/api/sync/initialize/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Endpoint para inicializar la base de datos local
 * Retorna productos, proveedores y ubicaciones activas
 */
export async function GET() {
  try {
    const payload = await requireAuth();

    // Obtener todos los datos necesarios para offline
    const [products, providers, locations] = await Promise.all([
      prisma.product.findMany({
        where: {
          tenant_id: payload.tenantId,
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.provider.findMany({
        where: {
          tenant_id: payload.tenantId,
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.location.findMany({
        where: {
          tenant_id: payload.tenantId,
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        providers,
        locations,
      },
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al inicializar sincronización:', error);
    return NextResponse.json(
      { success: false, error: 'Error al inicializar datos' },
      { status: 500 }
    );
  }
}

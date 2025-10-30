// src/app/api/products/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      );
    }

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: { catalog: [], own: [] }
      });
    }

    // Obtener productos propios del tenant
    const ownResults = await prisma.productParent.findMany({
      where: {
        tenant_id: tenantId,
        active: true,
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        varieties: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            unit_type: true,
            base_price: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 10
    });

    // Obtener nombres de productos que ya tiene el usuario
    const ownProductNames = ownResults.map(p => p.name.toLowerCase());

    // Buscar en catálogo global EXCLUYENDO los que ya tiene
    const catalogResults = await prisma.productParent.findMany({
      where: {
        is_global: true,
        active: true,
        name: {
          contains: query,
          mode: 'insensitive',
          notIn: ownProductNames.length > 0 ? ownProductNames : undefined
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        catalog: catalogResults,
        own: ownResults
      }
    });

  } catch (error: any) {
    console.error('Error en búsqueda de productos:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

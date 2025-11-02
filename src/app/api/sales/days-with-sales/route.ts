// src/app/api/sales/days-with-sales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (!year || !month) {
      return NextResponse.json(
        { success: false, error: 'Año y mes son requeridos' },
        { status: 400 }
      );
    }

    // Obtener primer y último día del mes
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0, 23, 59, 59);

    // Obtener todas las ventas del mes
    const sales = await prisma.sale.findMany({
      where: {
        tenant_id: auth.tenantId,
        sale_date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      select: {
        sale_date: true,
      },
    });

    // Extraer días únicos en formato local
    const daysSet = new Set<string>();
    sales.forEach((sale) => {
      const date = new Date(sale.sale_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      daysSet.add(dateStr);
    });

    return NextResponse.json({
      success: true,
      days: Array.from(daysSet),
    });
  } catch (error: any) {
    console.error('Error en days-with-sales:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener días con ventas' },
      { status: error.status || 500 }
    );
  }
}


// CORRECCIÓN 4a: API para días con compras
// Archivo: src/app/api/purchases/days-with-purchases/route.ts
// ESTE ES UN ARCHIVO NUEVO - Crear la carpeta y el archivo

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Validar autenticación
    const payload = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // Obtener tenant del usuario
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { tenant_id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener purchases del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const purchases = await prisma.purchase.findMany({
      where: {
        tenant_id: user.tenant_id,
        purchase_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        purchase_date: true,
      },
    });

    // Extraer días únicos
    const daysSet = new Set<string>();
    purchases.forEach((purchase) => {
      const date = new Date(purchase.purchase_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      daysSet.add(`${year}-${month}-${day}`);
    });

    return NextResponse.json({
      success: true,
      days: Array.from(daysSet),
    });
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    console.error('Error en days-with-purchases:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener días con compras' },
      { status: 500 }
    );
  }
}

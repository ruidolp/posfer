// src/app/api/cash-register/current/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtener caja actual (abierta)
export async function GET() {
  try {
    const payload = await requireAuth();

    const currentCashRegister = await prisma.cashRegister.findFirst({
      where: {
        tenant_id: payload.tenantId,
        user_id: payload.userId,
        status: 'open',
      },
      include: {
        sales: {
          include: {
            items: true,
            payments: true,
          },
        },
      },
      orderBy: {
        opened_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: currentCashRegister,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al obtener caja actual:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener caja actual' },
      { status: 500 }
    );
  }
}

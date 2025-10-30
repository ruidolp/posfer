// src/app/api/cash-register/current/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth();

    const cashRegister = await prisma.cashRegister.findFirst({
      where: {
        tenant_id: payload.tenantId,
        user_id: payload.userId,
        status: 'open',
      },
      orderBy: {
        opened_at: 'desc',
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: cashRegister,
    });

  } catch (error: any) {
    console.error('Error en GET /api/cash-register/current:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener caja' },
      { status: error.status || 500 }
    );
  }
}

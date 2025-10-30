// src/app/api/cash-register/open/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const openCashRegisterSchema = z.object({
  openingAmount: z.number().min(0),
  locationId: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();

    const validation = openCashRegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { openingAmount, locationId, notes } = validation.data;

    // Verificar que no haya caja abierta
    const existingOpen = await prisma.cashRegister.findFirst({
      where: {
        tenant_id: payload.tenantId,
        user_id: payload.userId,
        status: 'open',
      },
    });

    if (existingOpen) {
      return NextResponse.json(
        { success: false, error: 'Ya tienes una caja abierta' },
        { status: 400 }
      );
    }

    // Crear caja
    const cashRegister = await prisma.cashRegister.create({
      data: {
        tenant_id: payload.tenantId,
        user_id: payload.userId,
        location_id: locationId || null,
        opening_amount: openingAmount,
        status: 'open',
        notes: notes || null,
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
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/cash-register/open:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al abrir caja' },
      { status: 500 }
    );
  }
}

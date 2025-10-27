// src/app/api/cash-register/open/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const openCashRegisterSchema = z.object({
  openingAmount: z.number().nonnegative(),
  locationId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();
    
    // Validar datos
    const validation = openCashRegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    // Verificar si ya hay una caja abierta
    const existingOpenCashRegister = await prisma.cashRegister.findFirst({
      where: {
        tenant_id: payload.tenantId,
        user_id: payload.userId,
        status: 'open',
      },
    });

    if (existingOpenCashRegister) {
      return NextResponse.json(
        { success: false, error: 'Ya tienes una caja abierta. Ciérrala primero.' },
        { status: 400 }
      );
    }

    const { openingAmount, locationId, notes } = validation.data;

    // Crear caja
    const cashRegister = await prisma.cashRegister.create({
      data: {
        tenant_id: payload.tenantId,
        user_id: payload.userId,
        location_id: locationId || null,
        opening_amount: openingAmount,
        notes: notes || null,
        status: 'open',
      },
    });

    return NextResponse.json({
      success: true,
      data: cashRegister,
      message: 'Caja abierta correctamente',
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al abrir caja:', error);
    return NextResponse.json(
      { success: false, error: 'Error al abrir caja' },
      { status: 500 }
    );
  }
}

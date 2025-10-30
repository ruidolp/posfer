// src/app/api/cash-register/close/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const closeCashRegisterSchema = z.object({
  notes: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();

    const validation = closeCashRegisterSchema.safeParse(body);
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

    const { notes } = validation.data;

    // Buscar caja abierta
    const cashRegister = await prisma.cashRegister.findFirst({
      where: {
        tenant_id: payload.tenantId,
        user_id: payload.userId,
        status: 'open',
      },
    });

    if (!cashRegister) {
      return NextResponse.json(
        { success: false, error: 'No hay caja abierta' },
        { status: 400 }
      );
    }

    // Calcular total de ventas
    const sales = await prisma.sale.findMany({
      where: {
        cash_register_id: cashRegister.id,
      },
      select: {
        total: true,
      },
    });

    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const closingAmount = Number(cashRegister.opening_amount) + totalSales;

    // Cerrar caja
    const updatedCashRegister = await prisma.cashRegister.update({
      where: { id: cashRegister.id },
      data: {
        status: 'closed',
        closing_amount: closingAmount,
        closed_at: new Date(),
        notes: notes ? `${cashRegister.notes || ''}\n${notes}`.trim() : cashRegister.notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCashRegister,
    });

  } catch (error: any) {
    console.error('Error en PATCH /api/cash-register/close:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al cerrar caja' },
      { status: 500 }
    );
  }
}

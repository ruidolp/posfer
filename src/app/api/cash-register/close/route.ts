// src/app/api/cash-register/close/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const closeCashRegisterSchema = z.object({
  closingAmount: z.number().nonnegative(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();
    
    // Validar datos
    const validation = closeCashRegisterSchema.safeParse(body);
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

    // Obtener caja abierta
    const openCashRegister = await prisma.cashRegister.findFirst({
      where: {
        tenant_id: payload.tenantId,
        user_id: payload.userId,
        status: 'open',
      },
      include: {
        sales: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!openCashRegister) {
      return NextResponse.json(
        { success: false, error: 'No hay una caja abierta para cerrar' },
        { status: 400 }
      );
    }

    const { closingAmount, notes } = validation.data;

    // Cerrar caja
    const cashRegister = await prisma.cashRegister.update({
      where: { id: openCashRegister.id },
      data: {
        closing_amount: closingAmount,
        closed_at: new Date(),
        status: 'closed',
        notes: notes || openCashRegister.notes,
      },
      include: {
        location: true,
        sales: {
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });

    // Calcular resumen
    const totalSales = cashRegister.sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const salesCount = cashRegister.sales.length;
    const expectedAmount = Number(cashRegister.opening_amount) + totalSales;
    const difference = Number(closingAmount) - expectedAmount;

    return NextResponse.json({
      success: true,
      data: {
        cashRegister,
        summary: {
          openingAmount: Number(cashRegister.opening_amount),
          closingAmount: Number(closingAmount),
          totalSales,
          salesCount,
          expectedAmount,
          difference,
        },
      },
      message: 'Caja cerrada correctamente',
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al cerrar caja:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cerrar caja' },
      { status: 500 }
    );
  }
}

// src/app/api/cash-register/close/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const closeSchema = z.object({
  closingAmount: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Body JSON inválido' },
        { status: 400 }
      );
    }

    const validation = closeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Buscar caja abierta
    const openCashRegister = await prisma.cashRegister.findFirst({
      where: {
        tenant_id: payload.tenantId,
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
    });

    if (!openCashRegister) {
      return NextResponse.json(
        { success: false, error: 'No hay una caja abierta para cerrar' },
        { status: 400 }
      );
    }

    const { closingAmount, notes } = validation.data;

    // Calcular monto de cierre basado en ventas si no se proporciona
    const totalSales = openCashRegister.sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const finalClosingAmount = closingAmount ?? (Number(openCashRegister.opening_amount) + totalSales);

    // Cerrar caja
    const cashRegister = await prisma.cashRegister.update({
      where: { id: openCashRegister.id },
      data: {
        closing_amount: finalClosingAmount,
        closed_at: new Date(),
        status: 'closed',
        notes: notes || openCashRegister.notes || null,
      },
      include: {
        location: {
          select: {
            name: true,
          },
        },
        sales: {
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });

    // Calcular resumen
    const salesCount = cashRegister.sales.length;
    const expectedAmount = Number(cashRegister.opening_amount) + totalSales;
    const difference = Number(finalClosingAmount) - expectedAmount;

    return NextResponse.json({
      success: true,
      data: {
        cashRegister,
        summary: {
          openingAmount: Number(cashRegister.opening_amount),
          closingAmount: Number(finalClosingAmount),
          totalSales,
          salesCount,
          expectedAmount,
          difference,
        },
      },
      message: 'Caja cerrada correctamente',
    });

  } catch (error: any) {
    console.error('Error al cerrar caja:', error);
    
    // Retornar siempre JSON válido
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al cerrar caja',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: error.status || 500 }
    );
  }
}

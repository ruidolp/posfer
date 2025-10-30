// src/app/api/sales/today/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const { searchParams } = new URL(request.url);
    const cashRegisterId = searchParams.get('cashRegisterId');

    if (!cashRegisterId) {
      return NextResponse.json(
        { success: false, error: 'cashRegisterId es requerido' },
        { status: 400 }
      );
    }

    // Obtener todas las ventas de esta caja
    const sales = await prisma.sale.findMany({
      where: {
        tenant_id: payload.tenantId,
        cash_register_id: cashRegisterId,
      },
      include: {
        payments: true,
      },
    });

    // Calcular total
    const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

    // Desglose por método de pago
    const paymentBreakdown = {
      cash: 0,
      debit: 0,
      credit: 0,
      transfer: 0,
    };

    sales.forEach(sale => {
      sale.payments.forEach(payment => {
        const method = payment.payment_method as keyof typeof paymentBreakdown;
        if (method in paymentBreakdown) {
          paymentBreakdown[method] += Number(payment.amount);
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        paymentBreakdown,
        salesCount: sales.length,
      },
    });

  } catch (error: any) {
    console.error('Error en GET /api/sales/today:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener ventas' },
      { status: error.status || 500 }
    );
  }
}

// src/app/api/sales/day-summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { success: false, error: 'Fecha es requerida' },
        { status: 400 }
      );
    }

    // Crear rango del día completo en timezone local
    const [year, month, day] = dateParam.split('-').map(Number);
    const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

    // Obtener todas las ventas del día con sus relaciones
    const sales = await prisma.sale.findMany({
      where: {
        tenant_id: auth.tenantId,
        sale_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            variety: {
              include: {
                parent: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: {
        sale_date: 'asc',
      },
    });

    if (sales.length === 0) {
      return NextResponse.json({
        success: true,
        summary: null,
      });
    }

    // Calcular totales
    const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const salesCount = sales.length;

    // Desglose por método de pago
    const paymentBreakdown = {
      cash: 0,
      debit: 0,
      credit: 0,
      transfer: 0,
    };

    sales.forEach((sale) => {
      sale.payments.forEach((payment) => {
        const amount = Number(payment.amount);
        switch (payment.payment_method) {
          case 'cash':
            paymentBreakdown.cash += amount;
            break;
          case 'debit':
            paymentBreakdown.debit += amount;
            break;
          case 'credit':
            paymentBreakdown.credit += amount;
            break;
          case 'transfer':
            paymentBreakdown.transfer += amount;
            break;
        }
      });
    });

    // Obtener cajas del día
    const cashRegisterIds = [...new Set(sales.map(s => s.cash_register_id))];
    const cashRegisters = await prisma.cashRegister.findMany({
      where: {
        id: {
          in: cashRegisterIds,
        },
      },
      select: {
        id: true,
        opened_at: true,
        closed_at: true,
      },
    });

    // Formatear ventas para el listado
    const formattedSales = sales.map((sale) => ({
      id: sale.id,
      time: new Date(sale.sale_date).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      total: Number(sale.total),
      items: sale.items.map((item) => ({
        name: `${item.variety.parent.name} - ${item.variety.name}`,
        quantity: Number(item.quantity),
      })),
    }));

    const summary = {
      date: dateParam,
      total,
      salesCount,
      paymentBreakdown,
      cashRegisters: cashRegisters.map((cr) => ({
        id: cr.id,
        openedAt: cr.opened_at.toISOString(),
        closedAt: cr.closed_at ? cr.closed_at.toISOString() : new Date().toISOString(),
      })),
      sales: formattedSales,
    };

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Error en day-summary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener resumen del día' },
      { status: error.status || 500 }
    );
  }
}

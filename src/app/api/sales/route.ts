// src/app/api/sales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().optional().nullable(),
  unitPrice: z.number().positive(),
  subtotal: z.number().positive(),
  productName: z.string().optional().nullable(),
  isSpecialPrice: z.boolean().optional(),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(['cash', 'transfer', 'debit', 'credit']),
  amount: z.number().positive(),
  reference: z.string().optional().nullable(),
});

const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1),
  payments: z.array(paymentSchema).min(1),
  total: z.number().positive(),
  locationId: z.string().optional().nullable(),
  localId: z.string().optional().nullable(), // Para ventas offline
});

// POST - Crear venta
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();
    
    // Validar datos
    const validation = saleSchema.safeParse(body);
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

    const { items, payments, total, locationId, localId } = validation.data;

    // Verificar que los pagos sumen el total
    const paymentsTotal = payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(paymentsTotal - total) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'El total de pagos no coincide con el total de la venta' },
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
    });

    if (!openCashRegister) {
      return NextResponse.json(
        { success: false, error: 'Debes abrir una caja antes de realizar ventas' },
        { status: 400 }
      );
    }

    // Crear venta en transacción
    const sale = await prisma.$transaction(async (tx) => {
      // Crear venta
      const newSale = await tx.sale.create({
        data: {
          tenant_id: payload.tenantId,
          user_id: payload.userId,
          cash_register_id: openCashRegister.id,
          location_id: locationId || null,
          total,
          synced: true,
          local_id: localId || null,
          items: {
            create: items.map(item => ({
              tenant_id: payload.tenantId,
              product_id: item.productId,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
          payments: {
            create: payments.map(payment => ({
              tenant_id: payload.tenantId,
              payment_method: payment.paymentMethod,
              amount: payment.amount,
              reference: payment.reference || null,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          payments: true,
          location: true,
        },
      });

      // Actualizar stock de productos (si tienen control de stock y NO es precio especial)
      for (const item of items) {
        if (item.isSpecialPrice || !item.quantity) continue; // Skip si es precio especial
        
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product && product.current_stock !== null) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              current_stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newSale;
    });

    return NextResponse.json({
      success: true,
      data: sale,
      message: 'Venta registrada correctamente',
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al crear venta:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear venta' },
      { status: 500 }
    );
  }
}

// GET - Listar ventas
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const cashRegisterId = searchParams.get('cashRegisterId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      tenant_id: payload.tenantId,
    };

    if (cashRegisterId) {
      where.cash_register_id = cashRegisterId;
    }

    if (startDate || endDate) {
      where.sale_date = {};
      if (startDate) where.sale_date.gte = new Date(startDate);
      if (endDate) where.sale_date.lte = new Date(endDate);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        user: true,
        location: true,
      },
      orderBy: {
        sale_date: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: sales,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al obtener ventas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener ventas' },
      { status: 500 }
    );
  }
}

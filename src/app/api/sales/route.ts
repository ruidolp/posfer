// src/app/api/sales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================
const saleItemSchema = z.object({
  varietyId: z.string(),  // ← CAMBIADO: ahora es varietyId
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  subtotal: z.number().positive(),
  isSpecialPrice: z.boolean().optional(),
  specialPriceReason: z.string().optional(),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(['cash', 'transfer', 'debit', 'credit']),
  amount: z.number().positive(),
  reference: z.string().optional(),
});

const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1),
  payments: z.array(paymentSchema).min(1),
  total: z.number().positive(),
  locationId: z.string().optional(),
});

// ============================================
// POST - CREAR VENTA (OPTIMIZADO)
// ============================================
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();

    console.log('📥 POST /api/sales - Body recibido:', JSON.stringify(body, null, 2));

    // Validar datos
    const validation = createSaleSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Validación fallida:', validation.error.flatten());
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items, payments, total, locationId } = validation.data;
    console.log('✅ Validación exitosa. Items:', items.length);

    // Verificar caja abierta
    const cashRegister = await prisma.cashRegister.findFirst({
      where: {
        tenant_id: payload.tenantId,
        user_id: payload.userId,
        status: 'open',
      },
    });

    if (!cashRegister) {
      return NextResponse.json(
        { success: false, error: 'No tienes una caja abierta' },
        { status: 400 }
      );
    }

    // ============================================
    // FASE 1: CRÍTICO - BLOQUEA UI (~300ms)
    // ============================================
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Crear venta
      const newSale = await tx.sale.create({
        data: {
          tenant_id: payload.tenantId,
          user_id: payload.userId,
          cash_register_id: cashRegister.id,
          location_id: locationId || null,
          total,
          sale_date: new Date(),
          synced: true,
        },
      });

      // 2. Crear items (BATCH - una sola query)
      await tx.saleItem.createMany({
        data: items.map((item) => ({
          sale_id: newSale.id,
          variety_id: item.varietyId,  // ← CAMBIADO: variety_id
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
          is_special_price: item.isSpecialPrice || false,
          special_price_reason: item.specialPriceReason || null,
        })),
      });

      // 3. Crear payments (BATCH - una sola query)
      await tx.salePayment.createMany({
        data: payments.map((payment) => ({
          sale_id: newSale.id,
          payment_method: payment.paymentMethod,
          amount: payment.amount,
          reference: payment.reference || null,
        })),
      });

      return newSale;
    });

    // ============================================
    // RESPONDER INMEDIATAMENTE ⚡
    // ============================================
    const response = NextResponse.json({
      success: true,
      data: {
        saleId: sale.id,
        message: 'Venta registrada exitosamente',
      },
    });

    // ============================================
    // FASE 2: BACKGROUND - NO BLOQUEA UI
    // ============================================
    setImmediate(async () => {
      try {
        await processPostSaleOperations({
          saleId: sale.id,
          items,
          tenantId: payload.tenantId,
          cashRegisterId: cashRegister.id,
        });
      } catch (error) {
        console.error('Error en operaciones post-venta:', error);
      }
    });

    return response;
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

// ============================================
// OPERACIONES POST-VENTA (BACKGROUND)
// ============================================
async function processPostSaleOperations({
  saleId,
  items,
  tenantId,
  cashRegisterId,
}: {
  saleId: string;
  items: Array<{
    varietyId: string;  // ← CAMBIADO
    quantity: number;
    unitPrice: number;
  }>;
  tenantId: string;
  cashRegisterId: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Procesar cada variedad
  for (const item of items) {
    try {
      // 1. Obtener datos actuales de la variedad
      const variety = await prisma.productVariety.findUnique({
        where: { id: item.varietyId },
        select: {
          current_stock: true,
          base_price: true,
        },
      });

      if (!variety) continue;

      const oldStock = variety.current_stock || 0;
      const newStock = oldStock - item.quantity;

      // 2. Actualizar stock de la variedad
      await prisma.productVariety.update({
        where: { id: item.varietyId },
        data: {
          current_stock: newStock,
          updated_at: new Date(),
        },
      });

      // 3. Registrar historial de stock
      await prisma.productStockHistory.create({
        data: {
          tenant_id: tenantId,
          variety_id: item.varietyId,  // ← CAMBIADO
          old_stock: oldStock,
          new_stock: newStock,
          change_type: 'sale',
          reference_id: saleId,
          changed_at: new Date(),
        },
      });

      // 4. Registrar historial de precio (si es precio especial)
      const isDifferentPrice = Math.abs(Number(variety.base_price) - item.unitPrice) > 0.01;
      
      if (isDifferentPrice) {
        await prisma.productPriceHistory.create({
          data: {
            tenant_id: tenantId,
            variety_id: item.varietyId,  // ← CAMBIADO
            old_price: variety.base_price,
            new_price: item.unitPrice,
            changed_at: new Date(),
            reason: 'Precio especial en venta',
            stock_at_change: newStock,
          },
        });
      }

      // 5. Actualizar score de ventas diarias
      await prisma.productDailySales.upsert({
        where: {
          cash_register_id_variety_id_date: {  // ← CAMBIADO: nombre del constraint
            cash_register_id: cashRegisterId,
            variety_id: item.varietyId,  // ← CAMBIADO
            date: today,
          },
        },
        update: {
          sale_count: { increment: 1 },
          last_sale_at: new Date(),
        },
        create: {
          tenant_id: tenantId,
          cash_register_id: cashRegisterId,
          variety_id: item.varietyId,  // ← CAMBIADO
          date: today,
          sale_count: 1,
          last_sale_at: new Date(),
        },
      });
    } catch (error) {
      console.error(`Error procesando variedad ${item.varietyId}:`, error);
    }
  }
}

// ============================================
// GET - LISTAR VENTAS
// ============================================
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const { searchParams } = new URL(request.url);

    const cashRegisterId = searchParams.get('cashRegisterId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      tenant_id: payload.tenantId,
    };

    if (cashRegisterId) {
      where.cash_register_id = cashRegisterId;
    }

    if (startDate && endDate) {
      where.sale_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              variety: {  // ← CAMBIADO: ahora es variety
                select: {
                  id: true,
                  name: true,
                  unit_type: true,
                  parent: {  // ← AGREGADO: incluir nombre del producto padre
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          payments: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          sale_date: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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

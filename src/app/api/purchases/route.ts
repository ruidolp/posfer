// src/app/api/purchases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PurchaseCategory } from '@prisma/client';

// ============================================
// SCHEMAS
// ============================================
const purchaseItemSchema = z.object({
  varietyId: z.string(),
  quantity: z.number().positive(),
  subtotal: z.number().positive(), // Total pagado por este item
});

const createPurchaseSchema = z.object({
  category: z.nativeEnum(PurchaseCategory),
  supplierId: z.string().optional(),
  items: z.array(purchaseItemSchema).optional(),
  total: z.number().positive(),
  documentUrl: z.string().optional(),
  notes: z.string().optional(),
  purchaseDate: z.string().optional(), // ISO date
});

// ============================================
// GET - Listar compras
// ============================================
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category') as PurchaseCategory | null;
    const supplierId = searchParams.get('supplierId');
    const from = searchParams.get('from'); // Fecha desde
    const to = searchParams.get('to');     // Fecha hasta
    const limit = parseInt(searchParams.get('limit') || '50');

    const purchases = await prisma.purchase.findMany({
      where: {
        tenant_id: payload.tenantId,
        ...(category && { category }),
        ...(supplierId && { supplier_id: supplierId }),
        ...(from && {
          purchase_date: {
            gte: new Date(from),
          },
        }),
        ...(to && {
          purchase_date: {
            lte: new Date(to),
          },
        }),
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
            location: true,
          },
        },
        items: {
          include: {
            variety: {
              select: {
                id: true,
                name: true,
                unit_type: true,
                parent: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        purchase_date: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: purchases,
    });

  } catch (error: any) {
    console.error('Error en GET /api/purchases:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener compras' },
      { status: error.status || 500 }
    );
  }
}

// ============================================
// POST - Crear compra
// ============================================
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();

    console.log('📥 POST /api/purchases - Body:', JSON.stringify(body, null, 2));

    // Validar datos
    const validation = createPurchaseSchema.safeParse(body);
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

    const { category, supplierId, items, total, documentUrl, notes, purchaseDate } = validation.data;

    // Validar lógica de negocio
    if (category === 'MERCADERIA') {
      if (!supplierId) {
        return NextResponse.json(
          { success: false, error: 'El proveedor es requerido para compras de mercadería' },
          { status: 400 }
        );
      }
      if (!items || items.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Debe agregar al menos un producto' },
          { status: 400 }
        );
      }
    }

    // Verificar que el proveedor exista y pertenezca al tenant
    if (supplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: {
          id: supplierId,
          tenant_id: payload.tenantId,
        },
      });

      if (!supplier) {
        return NextResponse.json(
          { success: false, error: 'Proveedor no encontrado' },
          { status: 404 }
        );
      }
    }

    // Crear compra en transacción
    const purchase = await prisma.$transaction(async (tx) => {
      // Crear compra
      const newPurchase = await tx.purchase.create({
        data: {
          tenant_id: payload.tenantId,
          user_id: payload.userId,
          supplier_id: supplierId || null,
          category,
          total,
          document_url: documentUrl || null,
          notes: notes || null,
          purchase_date: purchaseDate ? new Date(purchaseDate) : new Date(),
        },
      });

      // Crear items si es mercadería
      if (category === 'MERCADERIA' && items && items.length > 0) {
        await tx.purchaseItem.createMany({
          data: items.map((item) => ({
            purchase_id: newPurchase.id,
            variety_id: item.varietyId,
            quantity: item.quantity,
            unit_price: item.subtotal / item.quantity, // Calcular automáticamente
            subtotal: item.subtotal,
          })),
        });

        // Actualizar stock de productos
        for (const item of items) {
          const variety = await tx.productVariety.findUnique({
            where: { id: item.varietyId },
          });

          if (variety && variety.current_stock !== null) {
            await tx.productVariety.update({
              where: { id: item.varietyId },
              data: {
                current_stock: {
                  increment: item.quantity,
                },
              },
            });

            // Registrar cambio en historial
            await tx.productStockHistory.create({
              data: {
                tenant_id: payload.tenantId,
                variety_id: item.varietyId,
                old_stock: variety.current_stock,
                new_stock: variety.current_stock.add(item.quantity),
                change_type: 'purchase',
                reference_id: newPurchase.id,
                notes: `Compra #${newPurchase.id.slice(0, 8)}`,
              },
            });
          }
        }
      }

      return newPurchase;
    });

    // Obtener compra completa
    const fullPurchase = await prisma.purchase.findUnique({
      where: { id: purchase.id },
      include: {
        supplier: true,
        items: {
          include: {
            variety: {
              include: {
                parent: true,
              },
            },
          },
        },
      },
    });

    console.log('✅ Compra creada:', fullPurchase?.id);

    return NextResponse.json({
      success: true,
      data: fullPurchase,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/purchases:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear compra' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Eliminar compra
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que pertenezca al tenant
    const existing = await prisma.purchase.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
      include: {
        items: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Compra no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar en transacción
    await prisma.$transaction(async (tx) => {
      // Revertir stock si es mercadería
      if (existing.category === 'MERCADERIA' && existing.items.length > 0) {
        for (const item of existing.items) {
          const variety = await tx.productVariety.findUnique({
            where: { id: item.variety_id },
          });

          if (variety && variety.current_stock !== null) {
            await tx.productVariety.update({
              where: { id: item.variety_id },
              data: {
                current_stock: {
                  decrement: item.quantity,
                },
              },
            });

            // Registrar en historial
            await tx.productStockHistory.create({
              data: {
                tenant_id: payload.tenantId,
                variety_id: item.variety_id,
                old_stock: variety.current_stock,
                new_stock: variety.current_stock.sub(item.quantity),
                change_type: 'adjustment',
                reference_id: id,
                notes: `Eliminación de compra #${id.slice(0, 8)}`,
              },
            });
          }
        }
      }

      // Eliminar compra (cascade eliminará items)
      await tx.purchase.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Compra eliminada',
    });

  } catch (error: any) {
    console.error('Error en DELETE /api/purchases:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar compra' },
      { status: 500 }
    );
  }
}

// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      );
    }

    const product = await prisma.productParent.findFirst({
      where: {
        id,
        tenant_id: tenantId
      },
      include: {
        varieties: {
          where: { active: true },
          include: {
            price_options: {
              where: { active: true },
              orderBy: { quantity: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error: any) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { tenantId, parentName, varieties } = body;

    console.log('📝 PUT /api/products/[id] - Actualizando:', id);

    // Validaciones
    if (!tenantId || !parentName || !varieties || varieties.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Verificar que el producto pertenece al tenant
    const existingProduct = await prisma.productParent.findFirst({
      where: { id, tenant_id: tenantId }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar en transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Actualizar ProductParent
      const parent = await tx.productParent.update({
        where: { id },
        data: {
          name: parentName,
          updated_at: new Date()
        }
      });

      // 2. Obtener variedades existentes
      const existingVarieties = await tx.productVariety.findMany({
        where: { parent_id: id, active: true }
      });

      const existingIds = existingVarieties.map(v => v.id);
      const incomingIds = varieties
        .filter((v: any) => v.id && !v.id.startsWith('temp-'))
        .map((v: any) => v.id);

      // 3. Desactivar variedades eliminadas
      const toDeactivate = existingIds.filter(id => !incomingIds.includes(id));
      if (toDeactivate.length > 0) {
        await tx.productVariety.updateMany({
          where: { id: { in: toDeactivate } },
          data: { active: false }
        });
      }

      // 4. Procesar cada variedad
      const processedVarieties = await Promise.all(
        varieties.map(async (variety: any) => {
          const isNew = !variety.id || variety.id.startsWith('temp-');

          let varietyData;
          if (isNew) {
            // Crear nueva variedad
            varietyData = await tx.productVariety.create({
              data: {
                tenant_id: tenantId,
                parent_id: id,
                name: variety.name,
                unit_type: variety.unit_type,
                base_price: variety.base_price,
                current_stock: variety.current_stock || null,
                alert_stock: variety.alert_stock || null,
                active: true
              }
            });
          } else {
            // Actualizar variedad existente
            varietyData = await tx.productVariety.update({
              where: { id: variety.id },
              data: {
                name: variety.name,
                unit_type: variety.unit_type,
                base_price: variety.base_price,
                current_stock: variety.current_stock || null,
                alert_stock: variety.alert_stock || null,
                updated_at: new Date()
              }
            });

            // Eliminar paquetes antiguos
            await tx.varietyPriceOption.deleteMany({
              where: { variety_id: variety.id }
            });
          }

          // 5. Crear paquetes nuevos
          if (variety.packages && variety.packages.length > 0) {
            const validPackages = variety.packages.filter((p: any) =>
              p.quantity > 0 && p.total_price > 0
            );

            if (validPackages.length > 0) {
              await tx.varietyPriceOption.createMany({
                data: validPackages.map((pkg: any) => ({
                  variety_id: varietyData.id,
                  quantity: pkg.quantity,
                  total_price: pkg.total_price,
                  label: pkg.label || null,
                  active: true
                }))
              });
            }
          }

          return varietyData;
        })
      );

      return { parent, varieties: processedVarieties };
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      );
    }

    // Desactivar producto y sus variedades
    await prisma.$transaction([
      prisma.productParent.update({
        where: { id },
        data: { active: false }
      }),
      prisma.productVariety.updateMany({
        where: { parent_id: id },
        data: { active: false }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Producto desactivado'
    });

  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

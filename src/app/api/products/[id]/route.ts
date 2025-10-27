// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  unitType: z.string().optional().nullable(),
  stock: z.number().int().nonnegative().optional().nullable(),
  alertStock: z.number().int().nonnegative().optional().nullable(),
  active: z.boolean().optional(),
});

// GET - Obtener un producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener producto' },
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
    const payload = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    
    // Validar datos
    const validation = productSchema.safeParse(body);
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

    const { name, price, unitType, stock, alertStock, active } = validation.data;

    // Verificar que el producto existe y pertenece al tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar producto
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        current_price: price,
        unit_type: unitType ?? null,
        current_stock: stock ?? null,
        alert_stock: alertStock ?? null,
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    const { id } = await params;

    // Verificar que el producto existe y pertenece al tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Producto desactivado correctamente',
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}

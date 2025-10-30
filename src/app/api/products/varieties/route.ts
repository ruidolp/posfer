// src/app/api/products/varieties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createVarietySchema = z.object({
  parentId: z.string(),
  name: z.string().min(1, 'El nombre es requerido'),
  unitType: z.string().min(1, 'El tipo de unidad es requerido'),
  basePrice: z.number().min(0).default(0),
  currentStock: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();

    const validation = createVarietySchema.safeParse(body);
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

    const { parentId, name, unitType, basePrice, currentStock } = validation.data;

    // Verificar que el parent existe y pertenece al tenant
    const parent = await prisma.productParent.findFirst({
      where: {
        id: parentId,
        tenant_id: payload.tenantId,
      },
    });

    if (!parent) {
      return NextResponse.json(
        { success: false, error: 'Producto base no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya existe variedad con ese nombre
    const existing = await prisma.productVariety.findFirst({
      where: {
        tenant_id: payload.tenantId,
        parent_id: parentId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una variedad con ese nombre' },
        { status: 400 }
      );
    }

    // Crear variedad
    const variety = await prisma.productVariety.create({
      data: {
        tenant_id: payload.tenantId,
        parent_id: parentId,
        name,
        unit_type: unitType,
        base_price: basePrice,
        current_stock: currentStock !== undefined ? currentStock : null,
      },
      include: {
        parent: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: variety,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/products/varieties:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear variedad' },
      { status: 500 }
    );
  }
}

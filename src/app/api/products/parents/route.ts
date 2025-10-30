// src/app/api/products/parents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createParentSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  suggestedUnit: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();

    const validation = createParentSchema.safeParse(body);
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

    const { name, suggestedUnit } = validation.data;

    // Verificar si ya existe
    const existing = await prisma.productParent.findFirst({
      where: {
        tenant_id: payload.tenantId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un producto con ese nombre' },
        { status: 400 }
      );
    }

    // Crear parent
    const parent = await prisma.productParent.create({
      data: {
        tenant_id: payload.tenantId,
        name,
        suggested_unit: suggestedUnit || null,
        is_global: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: parent,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/products/parents:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}

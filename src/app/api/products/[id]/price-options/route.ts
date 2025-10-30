// src/app/api/products/[id]/price-options/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const priceOptionSchema = z.object({
  quantity: z.number().positive(),
  totalPrice: z.number().positive(),
  label: z.string().optional(),
});

// GET - Listar opciones de precio de un producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    const { id } = await params;

    // Verificar que el producto existe y pertenece al tenant
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

    // Obtener opciones activas
    const options = await prisma.productPriceOption.findMany({
      where: {
        product_id: id,
        active: true,
      },
      orderBy: {
        quantity: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: options,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al obtener opciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener opciones' },
      { status: 500 }
    );
  }
}

// POST - Crear opción de precio
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    
    // Validar datos
    const validation = priceOptionSchema.safeParse(body);
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

    const { quantity, totalPrice, label } = validation.data;

    // Verificar que el producto existe y pertenece al tenant
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

    // Crear opción
    const option = await prisma.productPriceOption.create({
      data: {
        product_id: id,
        quantity,
        total_price: totalPrice,
        label: label || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: option,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al crear opción:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear opción' },
      { status: 500 }
    );
  }
}

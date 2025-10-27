// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  unitType: z.string().optional(),
  stock: z.number().int().nonnegative().optional().nullable(),
  alertStock: z.number().int().nonnegative().optional().nullable(),
});

// GET - Listar productos
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    const where: any = {
      tenant_id: payload.tenantId,
      ...(active !== null && { active: active === 'true' }),
    };

    // Búsqueda por nombre
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST - Crear producto
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
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

    const { name, price, unitType, stock, alertStock } = validation.data;

    // Crear producto
    const product = await prisma.product.create({
      data: {
        tenant_id: payload.tenantId,
        name,
        price,
        unit_type: unitType || null,
        stock: stock ?? null,
        alert_stock: alertStock ?? null,
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

    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}

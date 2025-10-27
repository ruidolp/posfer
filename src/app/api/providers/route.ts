// src/app/api/providers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const providerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

// GET - Listar proveedores
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const providers = await prisma.provider.findMany({
      where: {
        tenant_id: payload.tenantId,
        ...(active !== null && { active: active === 'true' }),
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: providers,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al obtener proveedores:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener proveedores' },
      { status: 500 }
    );
  }
}

// POST - Crear proveedor
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();
    
    // Validar datos
    const validation = providerSchema.safeParse(body);
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

    const { name, phone, email, address } = validation.data;

    // Crear proveedor
    const provider = await prisma.provider.create({
      data: {
        tenant_id: payload.tenantId,
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: provider,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al crear proveedor:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear proveedor' },
      { status: 500 }
    );
  }
}

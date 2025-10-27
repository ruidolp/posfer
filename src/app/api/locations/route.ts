// src/app/api/locations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
});

// GET - Listar ubicaciones
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth();
    
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const locations = await prisma.location.findMany({
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
      data: locations,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al obtener ubicaciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener ubicaciones' },
      { status: 500 }
    );
  }
}

// POST - Crear ubicación
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();
    
    // Validar datos
    const validation = locationSchema.safeParse(body);
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

    const { name, address } = validation.data;

    // Crear ubicación
    const location = await prisma.location.create({
      data: {
        tenant_id: payload.tenantId,
        name,
        address: address || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: location,
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al crear ubicación:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear ubicación' },
      { status: 500 }
    );
  }
}

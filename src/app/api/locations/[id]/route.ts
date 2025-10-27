// src/app/api/locations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  active: z.boolean().optional(),
});

// GET - Obtener una ubicación
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    const { id } = await params; // ⭐ CAMBIO: await params

    const location = await prisma.location.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

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

    console.error('Error al obtener ubicación:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener ubicación' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar ubicación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    const { id } = await params; // ⭐ CAMBIO: await params
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

    const { name, address, active } = validation.data;

    // Verificar que la ubicación existe y pertenece al tenant
    const existingLocation = await prisma.location.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!existingLocation) {
      return NextResponse.json(
        { success: false, error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar ubicación
    const location = await prisma.location.update({
      where: { id },
      data: {
        name,
        address: address || null,
        ...(active !== undefined && { active }),
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

    console.error('Error al actualizar ubicación:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar ubicación' },
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
    const { id } = await params; // ⭐ CAMBIO: await params

    // Verificar que la ubicación existe y pertenece al tenant
    const existingLocation = await prisma.location.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!existingLocation) {
      return NextResponse.json(
        { success: false, error: 'Ubicación no encontrada' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.location.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Ubicación desactivada correctamente',
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al eliminar ubicación:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar ubicación' },
      { status: 500 }
    );
  }
}

// src/app/api/providers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const providerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  active: z.boolean().optional(),
});

// GET - Obtener un proveedor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    const { id } = await params;

    const provider = await prisma.provider.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

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

    console.error('Error al obtener proveedor:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener proveedor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar proveedor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    const { id } = await params;
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

    const { name, phone, email, address, active } = validation.data;

    // Verificar que el proveedor existe y pertenece al tenant
    const existingProvider = await prisma.provider.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar proveedor
    const provider = await prisma.provider.update({
      where: { id },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        ...(active !== undefined && { active }),
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

    console.error('Error al actualizar proveedor:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar proveedor' },
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

    // Verificar que el proveedor existe y pertenece al tenant
    const existingProvider = await prisma.provider.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.provider.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Proveedor desactivado correctamente',
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al eliminar proveedor:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar proveedor' },
      { status: 500 }
    );
  }
}

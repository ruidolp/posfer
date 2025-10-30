// src/app/api/suppliers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ============================================
// SCHEMAS
// ============================================
const createSupplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
});

// ============================================
// GET - Listar proveedores
// ============================================
export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const activeOnly = searchParams.get('active') !== 'false'; // Por defecto true

    const suppliers = await prisma.supplier.findMany({
      where: {
        tenant_id: payload.tenantId,
        ...(activeOnly && { active: true }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: [
        { active: 'desc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: { purchases: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: suppliers,
    });

  } catch (error: any) {
    console.error('Error en GET /api/suppliers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener proveedores' },
      { status: error.status || 500 }
    );
  }
}

// ============================================
// POST - Crear proveedor
// ============================================
export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();

    // Validar datos
    const validation = createSupplierSchema.safeParse(body);
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

    const { name, phone, location, notes } = validation.data;

    // Crear proveedor
    const supplier = await prisma.supplier.create({
      data: {
        tenant_id: payload.tenantId,
        name,
        phone: phone || null,
        location: location || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: supplier,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/suppliers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear proveedor' },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - Actualizar proveedor
// ============================================
export async function PATCH(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Validar datos
    const validation = updateSupplierSchema.safeParse(updates);
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

    // Verificar que pertenezca al tenant
    const existing = await prisma.supplier.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar
    const supplier = await prisma.supplier.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json({
      success: true,
      data: supplier,
    });

  } catch (error: any) {
    console.error('Error en PATCH /api/suppliers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar proveedor' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Eliminar proveedor (soft delete)
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const payload = await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Verificar que pertenezca al tenant
    const existing = await prisma.supplier.findFirst({
      where: {
        id,
        tenant_id: payload.tenantId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si tiene compras asociadas
    const purchaseCount = await prisma.purchase.count({
      where: { supplier_id: id },
    });

    if (purchaseCount > 0) {
      // Soft delete si tiene compras
      const supplier = await prisma.supplier.update({
        where: { id },
        data: { active: false },
      });

      return NextResponse.json({
        success: true,
        data: supplier,
        message: 'Proveedor desactivado (tiene compras asociadas)',
      });
    } else {
      // Hard delete si no tiene compras
      await prisma.supplier.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Proveedor eliminado',
      });
    }

  } catch (error: any) {
    console.error('Error en DELETE /api/suppliers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al eliminar proveedor' },
      { status: 500 }
    );
  }
}

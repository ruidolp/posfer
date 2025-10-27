// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Validar autenticación
    const payload = await requireAuth();

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        tenantId: user.tenant_id,
        businessName: user.tenant.business_name,
        role: user.role,
        theme: user.tenant.theme,
        currency: user.tenant.currency,
        active: user.active,
      },
    });

  } catch (error: any) {
    if (error.message === 'No autorizado' || error.message === 'Token inválido') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener datos del usuario' },
      { status: 500 }
    );
  }
}

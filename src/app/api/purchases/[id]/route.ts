// CORRECCIÓN 4b: API para detalle de compra
// Archivo: src/app/api/purchases/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> } // Next 15: params es Promise
) {
  try {
    const { id } = await ctx.params; // desestructurar con await

    // Validar autenticación
    const payload = await requireAuth();

    // Obtener tenant del usuario
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { tenant_id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        id,
        tenant_id: user.tenant_id,
      },
      include: {
        supplier: true,
        items: {
          include: {
            variety: {
              include: { parent: true },
            },
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { success: false, error: 'Compra no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: purchase });
  } catch (error: any) {
    // requireAuth puede lanzar 401
    if (error?.status === 401) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    console.error('Error obteniendo compra:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener compra' },
      { status: 500 }
    );
  }
}

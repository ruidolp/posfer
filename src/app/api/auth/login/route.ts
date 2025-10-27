// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken, normalizePhone, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().min(8),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos
    const validation = loginSchema.safeParse(body);
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

    const { phone, password } = validation.data;

    // Normalizar teléfono
    const normalizedPhone = normalizePhone(phone);

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Teléfono o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      return NextResponse.json(
        { success: false, error: 'Esta cuenta está desactivada' },
        { status: 403 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Teléfono o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      phone: user.phone,
      role: user.role,
    });

    // Establecer cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          tenantId: user.tenant_id,
          businessName: user.tenant.business_name,
          role: user.role,
          theme: user.tenant.theme,
          currency: user.tenant.currency,
        },
      },
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}

// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, normalizePhone, isValidPhone, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  phone: z.string().min(8),
  password: z.string().min(6),
  name: z.string().min(2),
  businessName: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos
    const validation = registerSchema.safeParse(body);
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

    const { phone, password, name, businessName, email } = validation.data;

    // Normalizar y validar teléfono
    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Formato de teléfono inválido. Use +56912345678' },
        { status: 400 }
      );
    }

    // Verificar si el teléfono ya existe
    const existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Este teléfono ya está registrado' },
        { status: 409 }
      );
    }

    // Verificar email si se proporciona
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Este email ya está registrado' },
          { status: 409 }
        );
      }
    }

    // Hash de contraseña
    const hashedPassword = await hashPassword(password);

    // Crear tenant y usuario en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear tenant (negocio)
      const tenant = await tx.tenant.create({
        data: {
          business_name: businessName,
          phone: normalizedPhone,
          currency: 'CLP',
          theme: 'high_contrast',
        },
      });

      // Crear usuario
      const user = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          phone: normalizedPhone,
          email: email || null,
          password: hashedPassword,
          name,
          role: 'owner',
        },
      });

      return { tenant, user };
    });

    // Generar token JWT
    const token = generateToken({
      userId: result.user.id,
      tenantId: result.tenant.id,
      phone: normalizedPhone,
      role: result.user.role,
    });

    // Establecer cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: result.user.id,
          phone: result.user.phone,
          email: result.user.email,
          name: result.user.name,
          tenantId: result.tenant.id,
          businessName: result.tenant.business_name,
          role: result.user.role,
        },
      },
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear la cuenta' },
      { status: 500 }
    );
  }
}

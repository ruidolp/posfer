// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  tenantId: string;
  phone: string;
  role: string;
}

export interface AuthUser {
  id: string;
  tenantId: string;
  phone: string;
  email?: string;
  name: string;
  role: string;
}

/**
 * Genera un JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifica y decodifica un JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Hashea una contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara una contraseña con su hash
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Normaliza el número de teléfono a formato estándar
 * Ejemplos:
 * +56912345678 -> +56912345678
 * 912345678 -> +56912345678
 * 9 1234 5678 -> +56912345678
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\s+/g, '').replace(/\D/g, '');
  
  if (cleaned.startsWith('569')) {
    return `+${cleaned}`;
  }
  
  if (cleaned.startsWith('9') && cleaned.length === 9) {
    return `+56${cleaned}`;
  }
  
  if (cleaned.startsWith('56') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  
  return phone;
}

/**
 * Valida formato de teléfono chileno
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  const phoneRegex = /^\+569\d{8}$/;
  return phoneRegex.test(normalized);
}

/**
 * Obtiene el usuario actual desde las cookies (Server Component)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    tenantId: payload.tenantId,
    phone: payload.phone,
    name: '',
    role: payload.role,
  };
}

/**
 * Establece el token de autenticación en las cookies
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  });
}

/**
 * Elimina el token de autenticación
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

/**
 * Middleware para proteger rutas (uso en API routes)
 */
export async function requireAuth(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    throw new Error('No autorizado');
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Token inválido');
  }

  return payload;
}

// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind de manera inteligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda chilena
 */
export function formatCurrency(amount: number, currency: string = 'CLP'): string {
  if (currency === 'CLP') {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Formatea un número como decimal
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatea una fecha
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'datetime' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d);
    
    case 'long':
      return new Intl.DateTimeFormat('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    
    case 'datetime':
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    
    default:
      return d.toLocaleDateString('es-CL');
  }
}

/**
 * Formatea una hora
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Genera un ID único local
 */
export function generateLocalId(prefix: string = 'local'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calcula el subtotal de un item
 */
export function calculateSubtotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Valida si un string es un número válido
 */
export function isValidNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
}

/**
 * Parsea un string a número
 */
export function parseNumber(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Formatea un teléfono para display
 */
export function formatPhone(phone: string): string {
  if (phone.startsWith('+569')) {
    const number = phone.substring(3);
    return `+569 ${number.substring(0, 4)} ${number.substring(4)}`;
  }
  return phone;
}

/**
 * Trunca un texto
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Convierte un objeto a query params
 */
export function objectToQueryString(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

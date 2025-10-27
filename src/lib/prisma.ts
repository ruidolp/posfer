// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Helper para ejecutar queries con tenant_id automático
 */
export function getTenantPrisma(tenantId: string) {
  return {
    product: {
      findMany: (args?: any) =>
        prisma.product.findMany({
          ...args,
          where: { ...args?.where, tenant_id: tenantId },
        }),
      findUnique: (args: any) =>
        prisma.product.findFirst({
          where: { id: args.where.id, tenant_id: tenantId },
        }),
      create: (args: any) =>
        prisma.product.create({
          ...args,
          data: { ...args.data, tenant_id: tenantId },
        }),
      update: (args: any) =>
        prisma.product.update({
          ...args,
          where: { ...args.where, tenant_id: tenantId },
        }),
      delete: (args: any) =>
        prisma.product.delete({
          where: { id: args.where.id, tenant_id: tenantId },
        }),
    },
    sale: {
      findMany: (args?: any) =>
        prisma.sale.findMany({
          ...args,
          where: { ...args?.where, tenant_id: tenantId },
        }),
      create: (args: any) =>
        prisma.sale.create({
          ...args,
          data: { ...args.data, tenant_id: tenantId },
        }),
    },
    provider: {
      findMany: (args?: any) =>
        prisma.provider.findMany({
          ...args,
          where: { ...args?.where, tenant_id: tenantId },
        }),
      create: (args: any) =>
        prisma.provider.create({
          ...args,
          data: { ...args.data, tenant_id: tenantId },
        }),
    },
    location: {
      findMany: (args?: any) =>
        prisma.location.findMany({
          ...args,
          where: { ...args?.where, tenant_id: tenantId },
        }),
      create: (args: any) =>
        prisma.location.create({
          ...args,
          data: { ...args.data, tenant_id: tenantId },
        }),
    },
  };
}

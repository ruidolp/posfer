// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, parentName, catalogId, varieties } = body;

    console.log('📦 POST /api/products - Body recibido:', {
      tenantId,
      parentName,
      catalogId,
      varietiesCount: varieties?.length,
      varieties
    });

    // Validaciones detalladas
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      );
    }

    if (!parentName || !parentName.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre del producto es requerido' },
        { status: 400 }
      );
    }

    if (!varieties || varieties.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes agregar al menos una variedad' },
        { status: 400 }
      );
    }

    // ⚠️ VALIDAR SI YA EXISTE EL PRODUCTO
    const existingProduct = await prisma.productParent.findFirst({
      where: {
        tenant_id: tenantId,
        name: {
          equals: parentName.trim(),
          mode: 'insensitive'
        },
        active: true
      }
    });

    if (existingProduct) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Este producto ya existe',
          productId: existingProduct.id,
          redirect: `/dashboard/productos/${existingProduct.id}/editar`
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Validar que al menos una variedad tenga datos completos
    const validVarieties = varieties.filter((v: any) => 
      v.name && v.unit_type && v.base_price > 0
    );

    if (validVarieties.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debes agregar al menos una variedad válida' },
        { status: 400 }
      );
    }

    // Crear producto en transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear ProductParent
      const parent = await tx.productParent.create({
        data: {
          tenant_id: tenantId,
          name: parentName,
          is_global: false,
          active: true
        }
      });

      // 2. Crear variedades con sus paquetes
      const createdVarieties = await Promise.all(
        validVarieties.map(async (variety: any) => {
          const varietyData = await tx.productVariety.create({
            data: {
              tenant_id: tenantId,
              parent_id: parent.id,
              name: variety.name,
              unit_type: variety.unit_type,
              base_price: variety.base_price,
              current_stock: variety.current_stock || null,
              alert_stock: variety.alert_stock || null,
              active: true
            }
          });

          // 3. Crear paquetes si existen
          if (variety.packages && variety.packages.length > 0) {
            const validPackages = variety.packages.filter((p: any) => 
              p.quantity > 0 && p.total_price > 0
            );

            if (validPackages.length > 0) {
              await tx.varietyPriceOption.createMany({
                data: validPackages.map((pkg: any) => ({
                  variety_id: varietyData.id,
                  quantity: pkg.quantity,
                  total_price: pkg.total_price,
                  label: pkg.label || null,
                  active: true
                }))
              });
            }
          }

          return varietyData;
        })
      );

      return { parent, varieties: createdVarieties };
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const cashRegisterId = searchParams.get('cashRegisterId');
    const active = searchParams.get('active');

    if (!tenantId) {
      console.error('❌ GET /api/products - tenantId faltante');
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      );
    }

    console.log('📦 GET /api/products - tenantId:', tenantId, 'cashRegisterId:', cashRegisterId, 'active:', active);

    // Si hay cashRegisterId, ordenar por ventas del día
    let orderBy: any = { name: 'asc' };
    
    if (cashRegisterId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Obtener score de ventas del día
      const dailySales = await prisma.productDailySales.findMany({
        where: {
          cash_register_id: cashRegisterId,
          date: today
        },
        select: {
          variety_id: true,
          sale_count: true
        },
        orderBy: {
          sale_count: 'desc'
        }
      });

      const varietyScores = new Map(
        dailySales.map(ds => [ds.variety_id, ds.sale_count])
      );

      // Obtener productos con variedades
      const products = await prisma.productParent.findMany({
        where: {
          tenant_id: tenantId,
          ...(active === 'true' ? { active: true } : {})
        },
        include: {
          varieties: {
            where: { active: true },
            include: {
              price_options: {
                where: { active: true },
                orderBy: { quantity: 'asc' }
              }
            }
          }
        }
      });

      // Ordenar por score de ventas
      const sortedProducts = products.sort((a, b) => {
        const maxScoreA = Math.max(
          ...a.varieties.map(v => varietyScores.get(v.id) || 0),
          0
        );
        const maxScoreB = Math.max(
          ...b.varieties.map(v => varietyScores.get(v.id) || 0),
          0
        );
        
        if (maxScoreB !== maxScoreA) {
          return maxScoreB - maxScoreA; // Mayor score primero
        }
        
        return a.name.localeCompare(b.name); // Alfabético como fallback
      });

      console.log('✅ Productos ordenados por ventas:', sortedProducts.length);

      return NextResponse.json({
        success: true,
        data: sortedProducts
      });
    }

    // Sin cashRegisterId: orden alfabético normal
    const products = await prisma.productParent.findMany({
      where: {
        tenant_id: tenantId,
        ...(active === 'true' ? { active: true } : {})
      },
      include: {
        varieties: {
          where: { active: true },
          include: {
            price_options: {
              where: { active: true },
              orderBy: { quantity: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('✅ Productos encontrados:', products.length);

    return NextResponse.json({
      success: true,
      data: products
    });

  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

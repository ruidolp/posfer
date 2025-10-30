// src/app/(dashboard)/dashboard/ventas/nueva/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Zap, CreditCard } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency, cn } from '@/lib/utils';
import ProductModal from '@/components/sales/ProductModal';
import PaymentModal from '@/components/sales/PaymentModal';
import type { Payment } from '@/types';

interface Variety {
  id: string;
  name: string;
  unit_type: string;
  base_price: number;
  current_stock: number | null;
  price_options: Array<{
    id: string;
    quantity: number;
    total_price: number;
  }>;
}

interface Product {
  id: string;
  name: string;
  varieties: Variety[];
}

export default function NuevaVentaPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [cashRegister, setCashRegister] = useState<any>(null);
  
  // Modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedVariety, setSelectedVariety] = useState<{ product: Product; variety: Variety } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'exact' | 'change' | 'card' | null>(null);
  
  const { items, addItem, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  // Hook optimizado para productos
  const {
    products,
    loading: loadingProducts,
    error: productsError,
    refresh: refreshProducts
  } = useProducts({
    tenantId: user?.tenantId,
    cashRegisterId: cashRegister?.id,
    active: true,
    autoLoad: !!cashRegister && !!user?.tenantId
  });

  useEffect(() => {
    checkCashRegister();
  }, []);

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const checkCashRegister = async () => {
    try {
      const response = await fetch('/api/cash-register/current');
      const data = await response.json();

      if (data.success && data.data) {
        setCashRegister(data.data);
      } else {
        router.push('/dashboard/caja/abrir');
      }
    } catch (error) {
      console.error('Error al verificar caja:', error);
    }
  };

  const handleVarietyClick = (product: Product, variety: Variety) => {
    setSelectedVariety({ product, variety });
    setShowProductModal(true);
  };

  const handleProductConfirm = (data: {
    quantity: number;
    unitPrice: number;
    isSpecialPrice: boolean;
    specialPriceReason?: string;
    packageLabel?: string;
    packageQuantity?: number;
    packageCount?: number;
  }) => {
    if (!selectedVariety) return;

    const { product, variety } = selectedVariety;
    
    // Crear nombre descriptivo
    let displayName = `${product.name} - ${variety.name}`;
    if (data.packageLabel) {
      displayName += ` (${data.packageLabel})`;
    }

    // Siempre agregar como nuevo item (no combinar)
    addItem({
      varietyId: variety.id,
      productName: displayName,
      unitPrice: data.unitPrice,
      quantity: data.quantity,  // Total de unidades
      isSpecialPrice: data.isSpecialPrice,
      specialPriceReason: data.specialPriceReason,
      packageLabel: data.packageLabel,
      packageQuantity: data.packageQuantity,  // Unidades por paquete
      packageCount: data.packageCount,  // Cantidad de paquetes
    });

    setSelectedVariety(null);
  };

  const handlePayment = (mode: 'change' | 'card') => {
    if (items.length === 0) {
      alert('Agrega productos al carrito');
      return;
    }
    setPaymentMode(mode);
    setShowPaymentModal(true);
  };

  const handleCompleteSale = async (payments: Payment[]) => {
    setLoading(true);

    try {
      const saleData = {
        items: items.map(item => ({
          varietyId: item.varietyId,
          quantity: Number(item.quantity),  // ← Asegurar que sea number
          unitPrice: Number(item.unitPrice),  // ← Asegurar que sea number
          subtotal: Number(item.subtotal),  // ← Asegurar que sea number
          isSpecialPrice: item.isSpecialPrice || false,
          specialPriceReason: item.specialPriceReason,
        })),
        payments: payments.map(p => ({
          paymentMethod: p.paymentMethod,
          amount: Number(p.amount),  // ← Asegurar que sea number
          reference: p.reference || undefined,
        })),
        total: Number(getTotal()),  // ← Asegurar que sea number
        locationId: cashRegister?.location_id || undefined,
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al completar la venta');
      }

      clearCart();
      setShowPaymentModal(false);
      setPaymentMode(null);
      
      alert('¡Venta completada exitosamente!');
      
      // Refrescar productos para actualizar orden por ventas
      refreshProducts();

    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al completar la venta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const total = getTotal();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto pt-4 pb-[200px]">
        <div id="productos-grid" className="px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          {loadingProducts ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Cargando productos...
            </div>
          ) : productsError ? (
            <div className="col-span-full text-center py-12 text-destructive">
              Error: {productsError}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {search ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                {product.varieties.map((variety) => (
                  <button
                    key={variety.id}
                    onClick={() => handleVarietyClick(product, variety)}
                    className={cn(
                      'w-full bg-card border-2 border-border rounded-xl p-3',
                      'hover:border-primary hover:bg-primary/5 transition-all',
                      'text-left min-h-[90px] flex flex-col justify-between',
                      'active:scale-95'
                    )}
                  >
                    <div>
                      <div className="font-bold text-foreground text-base mb-0.5">
                        {product.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {variety.name}
                      </div>
                      {variety.current_stock !== null && variety.current_stock < 10 && (
                        <div className="text-xs text-destructive mt-1">
                          Stock: {variety.current_stock}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-muted-foreground">
                        por {variety.unit_type}
                      </div>
                      <div className="text-primary font-bold text-lg">
                        {formatCurrency(variety.base_price)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-4 mb-6">
            <div className="bg-card border-2 border-border rounded-xl p-4">
              <h3 className="font-bold text-lg mb-4">Productos en el carrito</h3>
              <div className="space-y-2">
                {items.map((item, index) => {
                  // Generar ID único para cada item
                  const itemId = item.packageLabel 
                    ? `${item.varietyId}-${item.packageLabel}-${index}`
                    : `${item.varietyId}-${index}`;
                  
                  // Determinar qué cantidad mostrar
                  const displayQuantity = item.packageCount || item.quantity;
                  const quantityLabel = item.packageLabel 
                    ? `${item.packageCount} paquete${item.packageCount !== 1 ? 's' : ''}`
                    : `${item.quantity} ${item.productName.includes('kg') ? 'kg' : 'un'}`;

                  return (
                    <div key={itemId} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-medium text-foreground truncate">
                          {item.productName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                          {item.packageLabel && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">
                              {quantityLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const newQuantity = displayQuantity - 1;
                              if (newQuantity <= 0) {
                                removeItem(itemId);
                              } else {
                                updateQuantity(itemId, newQuantity);
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center font-bold text-lg"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold">{displayQuantity}</span>
                          <button
                            onClick={() => updateQuantity(itemId, displayQuantity + 1)}
                            className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center font-bold text-lg"
                          >
                            +
                          </button>
                        </div>
                        <div className="font-bold text-base min-w-[80px] text-right">
                          {formatCurrency(item.subtotal)}
                        </div>
                        <button
                          onClick={() => removeItem(itemId)}
                          className="text-destructive hover:text-destructive/80 font-bold px-2 text-xl"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (confirm('¿Cancelar el pedido actual?')) {
                    clearCart();
                  }
                }}
                className="w-full mt-4 py-3 rounded-lg bg-destructive/10 text-destructive font-bold hover:bg-destructive/20 transition-colors"
              >
                Cancelar Pedido
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-[88px] left-0 right-0 lg:left-72 z-30 px-4 py-3 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            }}
            placeholder="Buscar producto..."
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input',
              'bg-background text-foreground',
              'text-base',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            )}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-72 z-40 px-4 py-3 bg-card border-t-2 border-border">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handlePayment('change')}
            disabled={items.length === 0 || loading}
            className={cn(
              'flex flex-col items-center justify-center gap-1 p-3 rounded-xl',
              'font-bold transition-all',
              items.length === 0 || loading
                ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
            )}
          >
            <Zap className="w-5 h-5" />
            <span className="text-xs leading-tight">
              {loading ? 'Procesando...' : 'EFECTIVO'}
            </span>
          </button>

          <button
            onClick={() => handlePayment('card')}
            disabled={items.length === 0 || loading}
            className={cn(
              'flex flex-col items-center justify-center gap-1 p-3 rounded-xl',
              'font-bold transition-all',
              items.length === 0 || loading
                ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95'
            )}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs leading-tight">
              {loading ? 'Procesando...' : 'TARJETA'}
            </span>
          </button>
        </div>
      </div>

      {showProductModal && selectedVariety && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedVariety(null);
          }}
          variety={selectedVariety.variety}
          productName={selectedVariety.product.name}
          currentQuantity={
            items.find(i => i.varietyId === selectedVariety.variety.id)?.quantity
          }
          currentPrice={
            items.find(i => i.varietyId === selectedVariety.variety.id)?.unitPrice
          }
          onConfirm={handleProductConfirm}
        />
      )}

      {showPaymentModal && paymentMode && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentMode(null);
          }}
          onComplete={handleCompleteSale}
          total={total}
          mode={paymentMode}
        />
      )}
    </div>
  );
}

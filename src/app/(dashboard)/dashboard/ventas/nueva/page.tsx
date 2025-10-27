// src/app/(dashboard)/dashboard/ventas/nueva/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calculator, X } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import ProductQuickAdd from '@/components/sales/ProductQuickAdd';
import CalculatorModal from '@/components/sales/CalculatorModal';
import PaymentMethodModal from '@/components/sales/PaymentMethodModal';
import SuccessMessage from '@/components/sales/SuccessMessage';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number | null;
  unitPrice: number;
  subtotal: number;
  isSpecialPrice: boolean;
}

export default function POSSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'quick' | 'change' | 'debit' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cashRegisterChecked, setCashRegisterChecked] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!cashRegisterChecked) {
      checkCashRegister();
    }
  }, [cashRegisterChecked]);

  const checkCashRegister = async () => {
    try {
      const response = await fetch('/api/cash-register/current');
      const data = await response.json();
      
      setCashRegisterChecked(true);
      
      if (!data.success || !data.data) {
        alert('No tienes una caja abierta');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      setCashRegisterChecked(true);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?active=true');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setTopProducts(data.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = search 
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const addToCart = (item: CartItem) => {
    setCart([...cart, item]);
    setSelectedProduct(null);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const editCartItem = (index: number) => {
    const item = cart[index];
    const product = products.find(p => p.id === item.productId);
    if (product) {
      setSelectedProduct(product);
      removeFromCart(index);
    }
  };

  const clearCart = () => {
    if (confirm('¿Cancelar esta venta?')) {
      setCart([]);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handlePayment = async (method: 'quick' | 'change' | 'debit', changeData?: any) => {
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          productName: item.productName,
          isSpecialPrice: item.isSpecialPrice,
        })),
        payments: method === 'change' 
          ? [{ paymentMethod: 'cash', amount: changeData.received, reference: null }]
          : [{ paymentMethod: method === 'debit' ? 'debit' : 'cash', amount: total, reference: null }],
        total,
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar venta');
      }

      setShowSuccess(true);
      setTimeout(() => {
        setCart([]);
        setShowSuccess(false);
        setShowPayment(false);
      }, 2000);

    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col safe-top safe-bottom">
      {/* Header con buscador */}
      <div className="p-3 border-b-2 border-border bg-card">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-lg border-2 border-input',
                'bg-background text-foreground text-base',
                'focus:outline-none focus:border-primary'
              )}
            />
          </div>
          <button
            onClick={() => setShowCalculator(true)}
            className="w-12 h-12 flex items-center justify-center bg-secondary rounded-lg"
          >
            <Calculator className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Productos más vendidos o resultados búsqueda */}
      <div className="p-3 border-b border-border bg-card">
        <div className="grid grid-cols-3 gap-2">
          {(search ? filteredProducts.slice(0, 6) : topProducts).map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={cn(
                'aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center gap-1',
                product.current_stock === null || product.current_stock > 0
                  ? 'border-border bg-background hover:border-primary'
                  : 'border-destructive bg-destructive/10'
              )}
            >
              <div className="text-3xl">📦</div>
              <div className="text-xs font-semibold text-center line-clamp-2">
                {product.name}
              </div>
              {(product.current_stock === null || product.current_stock <= 0) && (
                <div className="text-xs text-destructive font-bold">SIN STOCK</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Carrito */}
      <div className="flex-1 overflow-y-auto p-3">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Agrega productos para iniciar venta
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item, index) => (
              <div
                key={index}
                onClick={() => editCartItem(index)}
                className="bg-card border-2 border-border rounded-lg p-3 flex items-center justify-between active:bg-secondary"
              >
                <div className="flex-1">
                  <div className="font-semibold text-base">{item.productName}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.isSpecialPrice 
                      ? 'Precio especial'
                      : `${item.quantity} ${item.quantity === 1 ? 'un' : 'un'}`
                    }
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold">{formatCurrency(item.subtotal)}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(index);
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-destructive/10 text-destructive rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón cancelar */}
      {cart.length > 0 && (
        <div className="p-3">
          <button
            onClick={clearCart}
            className="w-full py-3 bg-destructive/10 text-destructive font-semibold rounded-lg"
          >
            CANCELAR COMPRA
          </button>
        </div>
      )}

      {/* Footer con métodos de pago */}
      <div className="p-3 border-t-2 border-border bg-card">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => {
              setPaymentMethod('quick');
              handlePayment('quick');
            }}
            disabled={cart.length === 0}
            className={cn(
              'col-span-2 py-4 rounded-lg font-bold text-base',
              'bg-primary text-primary-foreground',
              'disabled:opacity-50 active:scale-95 transition-transform'
            )}
          >
            EFECTIVO<br/>RÁPIDO
          </button>
          
          <button
            onClick={() => {
              setPaymentMethod('change');
              setShowPayment(true);
            }}
            disabled={cart.length === 0}
            className={cn(
              'col-span-2 py-4 rounded-lg font-bold text-base',
              'bg-primary text-primary-foreground',
              'disabled:opacity-50 active:scale-95 transition-transform'
            )}
          >
            EFECTIVO<br/>VUELTO
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-secondary rounded-lg py-3 px-4 text-center">
            <div className="text-xs text-muted-foreground">TOTAL</div>
            <div className="text-xl font-bold">{formatCurrency(total)}</div>
          </div>
          
          <button
            onClick={() => {
              setPaymentMethod('debit');
              handlePayment('debit');
            }}
            disabled={cart.length === 0}
            className={cn(
              'py-3 rounded-lg font-bold text-base',
              'bg-secondary text-secondary-foreground',
              'disabled:opacity-50 active:scale-95 transition-transform'
            )}
          >
            💳<br/>DÉBITO
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductQuickAdd
          product={selectedProduct}
          onAdd={addToCart}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showCalculator && (
        <CalculatorModal onClose={() => setShowCalculator(false)} />
      )}

      {showPayment && paymentMethod === 'change' && (
        <PaymentMethodModal
          total={total}
          onComplete={(data) => handlePayment('change', data)}
          onClose={() => setShowPayment(false)}
        />
      )}

      {showSuccess && (
        <SuccessMessage />
      )}

      {errorMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-destructive text-destructive-foreground p-6 rounded-xl m-4 max-w-sm">
            <div className="text-xl font-bold mb-2">❌ ERROR</div>
            <div className="mb-4">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage('')}
              className="w-full py-3 bg-white text-destructive font-bold rounded-lg"
            >
              REINTENTAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

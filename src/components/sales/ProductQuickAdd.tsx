// src/components/sales/ProductQuickAdd.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductQuickAddProps {
  product: Product;
  onAdd: (item: any) => void;
  onClose: () => void;
}

const QUICK_AMOUNTS_KG = [1, 2, 5, 10, 20];
const QUICK_AMOUNTS_UNIT = [1, 2, 5, 10, 20];
const PACK_QUANTITIES = [1, 2, 3, 5, 10];

export default function ProductQuickAdd({ product, onAdd, onClose }: ProductQuickAddProps) {
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [selectedPackQty, setSelectedPackQty] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [specialPrice, setSpecialPrice] = useState('');
  
  const hasPacks = product.product_prices && product.product_prices.length > 0;
  const isKg = product.unit_type === 'kg';
  const quickAmounts = isKg ? QUICK_AMOUNTS_KG : QUICK_AMOUNTS_UNIT;

  useEffect(() => {
    if (hasPacks) {
      setSelectedPack(product.product_prices![0]);
    }
  }, []);

  const calculateTotal = () => {
    if (specialPrice && parseFloat(specialPrice) > 0) {
      return parseFloat(specialPrice);
    }

    if (hasPacks && selectedPack) {
      return selectedPack.price * selectedPackQty;
    }

    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    return amount * Number(product.current_price || 0);
  };

  const handleAdd = () => {
    const useSpecialPrice = specialPrice && parseFloat(specialPrice) > 0;
    
    onAdd({
      productId: product.id,
      productName: product.name,
      quantity: useSpecialPrice ? null : (customAmount ? parseFloat(customAmount) : (hasPacks ? selectedPack.quantity * selectedPackQty : selectedAmount)),
      unitPrice: useSpecialPrice ? parseFloat(specialPrice) : (hasPacks ? selectedPack.price / selectedPack.quantity : Number(product.current_price)),
      subtotal: calculateTotal(),
      isSpecialPrice: useSpecialPrice,
    });
  };

  const hasNoStock = product.current_stock !== null && product.current_stock <= 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-card w-full sm:max-w-md sm:rounded-t-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b-2 border-border p-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {!hasPacks && `${formatCurrency(Number(product.current_price))}/${product.unit_type || 'un'}`}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sin stock warning */}
        {hasNoStock && (
          <div className="m-4 p-3 bg-destructive/10 border-2 border-destructive rounded-lg">
            <div className="font-bold text-destructive">⚠️ NO REGISTRAS STOCK</div>
            <div className="text-sm text-destructive-foreground">Pero puedes vender igual</div>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Packs o Cantidades */}
          {hasPacks ? (
            <>
              <div>
                <div className="font-semibold mb-2">Selecciona pack:</div>
                <div className="grid grid-cols-1 gap-2">
                  {product.product_prices!.map((pack: any) => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPack(pack)}
                      className={cn(
                        'p-3 rounded-lg border-2 font-semibold text-base',
                        selectedPack?.id === pack.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      )}
                    >
                      {pack.quantity}x {formatCurrency(pack.price)}
                      {pack.label && ` - ${pack.label}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">Cantidad de packs:</div>
                <div className="grid grid-cols-5 gap-2">
                  {PACK_QUANTITIES.map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setSelectedPackQty(qty)}
                      className={cn(
                        'aspect-square rounded-lg border-2 font-bold text-lg',
                        selectedPackQty === qty
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border'
                      )}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="font-semibold mb-2">Cantidades rápidas:</div>
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount('');
                      }}
                      className={cn(
                        'aspect-square rounded-lg border-2 font-bold text-lg',
                        selectedAmount === amount && !customAmount
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border'
                      )}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">O ingresa cantidad:</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(0);
                    }}
                    placeholder="0"
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-input text-lg text-center"
                    step="0.01"
                  />
                  <div className="px-4 py-3 bg-secondary rounded-lg font-semibold flex items-center">
                    {product.unit_type || 'un'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Precio especial */}
          <div className="border-t-2 border-border pt-4">
            <div className="font-semibold mb-2">Precio especial (opcional):</div>
            <input
              type="number"
              value={specialPrice}
              onChange={(e) => setSpecialPrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 rounded-lg border-2 border-input text-lg"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Si ingresas un monto, se registrará solo ese precio
            </div>
          </div>

          {/* Total */}
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total</div>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(calculateTotal())}
            </div>
          </div>

          {/* Botón agregar */}
          <button
            onClick={handleAdd}
            className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-lg active:scale-95 transition-transform"
          >
            AGREGAR
          </button>
        </div>
      </div>
    </div>
  );
}

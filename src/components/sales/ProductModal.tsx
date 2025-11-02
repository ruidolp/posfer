// src/components/sales/ProductModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

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
    label?: string;
  }>;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  variety: Variety | null;
  productName: string;
  currentQuantity?: number;
  currentPrice?: number;
  onConfirm: (data: {
    quantity: number;
    unitPrice: number;
    isSpecialPrice: boolean;
    specialPriceReason?: string;
    packageLabel?: string;
    packageQuantity?: number;
    packageCount?: number;
  }) => void;
}

type Mode = 'custom' | 'package';

export default function ProductModal({
  isOpen,
  onClose,
  variety,
  productName,
  currentQuantity,
  currentPrice,
  onConfirm,
}: ProductModalProps) {
  const [mode, setMode] = useState<Mode>('custom');
  const [quantity, setQuantity] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const quickAmounts = [1, 2, 3, 5, 10];

  useEffect(() => {
    if (variety) {
      setQuantity(1);
      setMode('custom');
      setSelectedPackage(null);
    }
  }, [variety]);

  if (!isOpen || !variety) return null;

  const handlePackageSelect = (packageId: string) => {
    setMode('package');
    setSelectedPackage(packageId);
    setQuantity(1);
  };

  const handleCustomMode = () => {
    setMode('custom');
    setSelectedPackage(null);
    setQuantity(1);
  };

  const getPackageData = () => {
    if (selectedPackage) {
      return variety.price_options.find(p => p.id === selectedPackage);
    }
    return null;
  };

  const calculateSubtotal = () => {
    if (mode === 'package' && selectedPackage) {
      const pkg = getPackageData();
      if (pkg) {
        return pkg.total_price * quantity;
      }
    }
    return variety.base_price * quantity;
  };

  const getUnitPrice = () => {
    if (mode === 'package' && selectedPackage) {
      const pkg = getPackageData();
      if (pkg) {
        return pkg.total_price / pkg.quantity;
      }
    }
    return variety.base_price;
  };

  const getTotalQuantity = () => {
    if (mode === 'package' && selectedPackage) {
      const pkg = getPackageData();
      if (pkg) {
        return pkg.quantity * quantity;
      }
    }
    return quantity;
  };

  const getPackageLabel = () => {
    if (mode === 'package' && selectedPackage) {
      const pkg = getPackageData();
      if (pkg) {
        return pkg.label || `Pack ${pkg.quantity}${variety.unit_type}`;
      }
    }
    return undefined;
  };

  const handleSubmit = () => {
    const totalQty = getTotalQuantity();
    const unitPrice = getUnitPrice();

    if (totalQty <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    const pkg = getPackageData();

    onConfirm({
      quantity: totalQty,
      unitPrice: unitPrice,
      isSpecialPrice: mode === 'package',
      specialPriceReason: mode === 'package' ? 'Paquete' : undefined,
      packageLabel: getPackageLabel(),
      packageQuantity: mode === 'package' && pkg ? pkg.quantity : undefined,
      packageCount: mode === 'package' ? quantity : undefined,
    });

    onClose();
  };

  const subtotal = calculateSubtotal();
  const lowStock = variety.current_stock !== null && variety.current_stock < 10;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={cn(
          'bg-card w-full sm:max-w-md sm:rounded-xl rounded-t-2xl',
          'max-h-[90vh] overflow-y-auto',
          'animate-in slide-in-from-bottom-4 sm:zoom-in-95'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex-1 pr-4">
            <h3 className="font-bold text-lg text-foreground">{productName}</h3>
            <p className="text-sm text-muted-foreground">{variety.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Stock info */}
          {variety.current_stock !== null && (
            <div className={cn(
              'p-3 rounded-lg text-sm font-medium',
              lowStock
                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
                : 'bg-secondary text-foreground'
            )}>
              📦 Stock: {variety.current_stock} {variety.unit_type}
              {lowStock && ' (bajo stock)'}
            </div>
          )}

          {/* VENTA DETALLE */}
          <div className={cn(
            'border-2 rounded-xl p-4 transition-all',
            mode === 'custom' ? 'border-primary bg-primary/5' : 'border-border bg-card'
          )}>
            <button
              onClick={handleCustomMode}
              className="w-full text-left mb-3"
            >
              <h4 className="font-bold text-foreground text-base mb-1">
                VENTA DETALLE
              </h4>
              <p className="text-xs text-muted-foreground">
                Selecciona la cantidad
              </p>
            </button>

            {mode === 'custom' && (
              <div className="space-y-4">
                {/* Botones rápidos */}
                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setQuantity(amount)}
                      className={cn(
                        'aspect-square rounded-lg font-bold text-base transition-all',
                        quantity === amount
                          ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                          : 'bg-secondary hover:bg-secondary/80 text-foreground'
                      )}
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                {/* Input custom - CORREGIDO PARA MOBILE */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(0.1, quantity - 1))}
                    className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center font-bold text-xl transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    step="0.1"
                    min="0.1"
                    className="flex-1 min-w-0 text-center text-2xl font-bold px-3 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SEPARADOR */}
          {variety.price_options && variety.price_options.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O elige un paquete</span>
              </div>
            </div>
          )}

          {/* PAQUETES */}
          {variety.price_options && variety.price_options.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {variety.price_options.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left',
                      mode === 'package' && selectedPackage === pkg.id
                        ? 'border-primary bg-primary/10 shadow-lg scale-105'
                        : 'border-border hover:border-primary/50 bg-card'
                    )}
                  >
                    <div className="font-bold text-base text-foreground mb-2">
                      PACK {pkg.quantity} {variety.unit_type.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(pkg.total_price)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Cantidad de paquetes */}
              {mode === 'package' && selectedPackage && (
                <div className="bg-primary/5 rounded-xl p-4 border-2 border-primary">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    ¿Cuántos paquetes?
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center font-bold text-xl transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="flex-1 min-w-0 text-center text-2xl font-bold px-3 py-3 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center font-bold text-xl transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-center text-sm text-muted-foreground mt-3">
                    Total: <span className="font-bold text-foreground">{getTotalQuantity()} {variety.unit_type}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subtotal */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">SUBTOTAL</div>
                <div className="text-sm text-foreground">
                  {getTotalQuantity()} {variety.unit_type} × {formatCurrency(getUnitPrice())}
                </div>
              </div>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3 rounded-lg bg-secondary hover:bg-secondary/80 font-bold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-colors shadow-lg"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

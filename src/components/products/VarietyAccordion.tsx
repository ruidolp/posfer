// src/components/products/VarietyAccordion.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Package {
  quantity: string;
  total_price: string;
}

interface Variety {
  id: string;
  name: string;
  unit_type: string;
  base_price: string;
  current_stock: string;
  packages: Package[];
}

interface VarietyAccordionProps {
  variety: Variety;
  index: number;
  isFirst: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (variety: Variety) => void;
  onRemove: () => void;
}

const UNIT_TYPES = [
  { value: 'un', label: 'UNIDAD', singular: 'unidad', plural: 'unidades' },
  { value: 'kg', label: 'KG', singular: 'kg', plural: 'kg' },
  { value: 'atado', label: 'ATADO', singular: 'atado', plural: 'atados' },
  { value: 'bandeja', label: 'BANDEJA', singular: 'bandeja', plural: 'bandejas' },
];

export default function VarietyAccordion({
  variety,
  index,
  isFirst,
  isExpanded,
  onToggle,
  onChange,
  onRemove
}: VarietyAccordionProps) {
  const updateVariety = (field: string, value: any) => {
    onChange({ ...variety, [field]: value });
  };

  const addPackage = () => {
    onChange({
      ...variety,
      packages: [...variety.packages, { quantity: '', total_price: '' }]
    });
  };

  const updatePackage = (pkgIndex: number, field: string, value: string) => {
    const newPackages = [...variety.packages];
    newPackages[pkgIndex] = { ...newPackages[pkgIndex], [field]: value };
    onChange({ ...variety, packages: newPackages });
  };

  const removePackage = (pkgIndex: number) => {
    onChange({
      ...variety,
      packages: variety.packages.filter((_, i) => i !== pkgIndex)
    });
  };

  const unitLabel = UNIT_TYPES.find(u => u.value === variety.unit_type);

  return (
    <div className="border-2 border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-foreground" />
          )}
          <span className="font-semibold text-foreground">
            {variety.name || `Variedad ${index + 1}`}
          </span>
          {variety.unit_type && variety.base_price && (
            <span className="text-sm text-muted-foreground">
              ${variety.base_price}/{unitLabel?.singular}
            </span>
          )}
        </div>

        {!isFirst && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Nombre de la variedad */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre de la variedad
            </label>
            <input
              type="text"
              value={variety.name}
              onChange={(e) => updateVariety('name', e.target.value)}
              placeholder="Ej: Verde, Roja, Grande"
              className="w-full px-4 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="text-xs text-muted-foreground mt-1">
              💡 Ej: Verde, Roja, Grande, Importada
            </div>
          </div>

          {/* Unidad */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              ¿Cómo se vende?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {UNIT_TYPES.map((unit) => (
                <button
                  key={unit.value}
                  type="button"
                  onClick={() => updateVariety('unit_type', unit.value)}
                  className={cn(
                    'px-4 py-3 rounded-lg border-2 font-semibold transition-all',
                    variety.unit_type === unit.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  )}
                >
                  {unit.label}
                </button>
              ))}
            </div>
          </div>

          {/* Precio base */}
          {variety.unit_type && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Precio por {unitLabel?.singular}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  value={variety.base_price}
                  onChange={(e) => updateVariety('base_price', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                💡 Precio de 1 {unitLabel?.singular}
              </div>
            </div>
          )}

          {/* Stock */}
          {variety.unit_type && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Stock actual (opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={variety.current_stock}
                  onChange={(e) => updateVariety('current_stock', e.target.value)}
                  placeholder="0"
                  step="0.01"
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="px-4 py-2 bg-secondary rounded-lg font-medium flex items-center">
                  {unitLabel?.plural}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                💡 Deja vacío si no llevas control de stock
              </div>
            </div>
          )}

          {/* Paquetes */}
          {variety.unit_type && variety.base_price && (
            <div className="pt-4 border-t-2 border-border">
              <div className="mb-3">
                <div className="font-medium text-foreground mb-1">
                  PAQUETES (opcional)
                </div>
                <div className="text-xs text-muted-foreground">
                  💡 Descuentos por cantidad
                </div>
              </div>

              {/* Lista de paquetes */}
              <div className="space-y-2 mb-3">
                {variety.packages.map((pkg, pkgIndex) => (
                  <div key={pkgIndex} className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={pkg.quantity}
                      onChange={(e) => updatePackage(pkgIndex, 'quantity', e.target.value)}
                      placeholder="0"
                      step="0.01"
                      className="w-24 px-3 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-muted-foreground">{unitLabel?.plural} por</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        value={pkg.total_price}
                        onChange={(e) => updatePackage(pkgIndex, 'total_price', e.target.value)}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-2 rounded-lg border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePackage(pkgIndex)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Agregar paquete */}
              <button
                type="button"
                onClick={addPackage}
                className="w-full px-4 py-2 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-lg text-foreground font-medium transition-colors"
              >
                + Agregar paquete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

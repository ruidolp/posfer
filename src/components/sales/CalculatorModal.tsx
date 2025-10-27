// src/components/sales/CalculatorModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface CalculatorModalProps {
  onClose: () => void;
}

export default function CalculatorModal({ onClose }: CalculatorModalProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setPreviousValue(result);
      setDisplay(result.toString());
    }
    setOperation(op);
    setDisplay('0');
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const result = calculate(previousValue, parseFloat(display), operation);
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', 'C', '+'],
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-sm">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold">Calculadora</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Display */}
          <div className="bg-secondary rounded-lg p-4 text-right">
            <div className="text-3xl font-bold break-all">
              {formatCurrency(parseFloat(display) || 0)}
            </div>
            {operation && (
              <div className="text-sm text-muted-foreground mt-1">
                {formatCurrency(previousValue || 0)} {operation}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {buttons.flat().map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === 'C') handleClear();
                  else if (['+', '-', '×', '÷'].includes(btn)) handleOperation(btn);
                  else if (btn === '.') {
                    if (!display.includes('.')) setDisplay(display + '.');
                  }
                  else handleNumber(btn);
                }}
                className={cn(
                  'aspect-square rounded-lg font-bold text-xl',
                  btn === 'C'
                    ? 'bg-destructive text-destructive-foreground'
                    : ['+', '-', '×', '÷'].includes(btn)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                )}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Equals */}
          <button
            onClick={handleEquals}
            className="w-full py-4 bg-primary text-primary-foreground font-bold text-xl rounded-lg"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}

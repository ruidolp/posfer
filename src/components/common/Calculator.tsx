// src/components/common/Calculator.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Calculator({ isOpen, onClose }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  if (!isOpen) return null;

  const handleNumber = (num: string) => {
    if (resetDisplay) {
      setDisplay(num);
      setResetDisplay(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (resetDisplay) {
      setDisplay('0.');
      setResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (previousValue !== null && operation && !resetDisplay) {
      // Ejecutar operación pendiente
      const result = calculate(previousValue, current, operation);
      setDisplay(result.toString());
      setPreviousValue(result);
    } else {
      setPreviousValue(current);
    }
    
    setOperation(op);
    setResetDisplay(true);
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
      setResetDisplay(true);
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Calculator Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm">
        <div className="bg-card border-2 border-border rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-bold text-foreground">Calculadora</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Display */}
          <div className="p-6 bg-secondary/30">
            <div className="text-right">
              {operation && (
                <div className="text-sm text-muted-foreground mb-1">
                  {previousValue} {operation}
                </div>
              )}
              <div className="text-4xl font-bold text-foreground break-all">
                {display}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="p-4 space-y-2">
            {buttons.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                {row.map((btn) => {
                  const isOperation = ['÷', '×', '-', '+', '='].includes(btn);
                  const isActive = operation === btn && resetDisplay;

                  return (
                    <button
                      key={btn}
                      onClick={() => {
                        if (btn === '=') {
                          handleEquals();
                        } else if (btn === '.') {
                          handleDecimal();
                        } else if (isOperation) {
                          handleOperation(btn);
                        } else {
                          handleNumber(btn);
                        }
                      }}
                      className={cn(
                        'min-h-touch p-4 rounded-xl text-xl font-bold transition-colors',
                        isOperation
                          ? isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-primary/80 text-primary-foreground hover:bg-primary'
                          : 'bg-secondary text-foreground hover:bg-secondary/80',
                        btn === '0' && 'col-span-1'
                      )}
                    >
                      {btn}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Bottom buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={handleClear}
                className="min-h-touch p-4 rounded-xl text-lg font-bold bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors"
              >
                AC
              </button>
              <button
                onClick={handleBackspace}
                className="min-h-touch p-4 rounded-xl text-lg font-bold bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                ⌫
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

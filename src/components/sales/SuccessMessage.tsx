// src/components/sales/SuccessMessage.tsx
'use client';

export default function SuccessMessage() {
  return (
    <div className="fixed inset-0 bg-green-500 flex items-center justify-center z-50">
      <div className="text-center text-white p-8">
        <div className="text-8xl mb-4">✅</div>
        <div className="text-4xl font-bold">
          VENTA EFECTUADA
        </div>
      </div>
    </div>
  );
}

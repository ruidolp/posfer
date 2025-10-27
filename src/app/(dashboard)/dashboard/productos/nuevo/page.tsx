// src/app/(dashboard)/dashboard/productos/nuevo/page.tsx
import ProductForm from '@/components/products/ProductForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevoProductoPage() {
  return (
    <div>
      <Link
        href="/dashboard/productos"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Productos
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Nuevo Producto
        </h1>
        <p className="text-muted-foreground mt-1">
          Completa los datos del producto
        </p>
      </div>

      <div className="max-w-2xl">
        <ProductForm />
      </div>
    </div>
  );
}

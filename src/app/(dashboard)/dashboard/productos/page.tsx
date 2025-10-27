// src/app/(dashboard)/dashboard/productos/page.tsx
import ProductList from '@/components/products/ProductList';

export default function ProductosPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Productos
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu inventario de productos
        </p>
      </div>

      <ProductList />
    </div>
  );
}

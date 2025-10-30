// src/components/products/ProductSearch.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CatalogProduct {
  id: string;
  name: string;
  suggested_unit: string | null;
}

interface OwnProduct {
  id: string;
  name: string;
  varieties: any[];
}

interface ProductSearchProps {
  tenantId: string;
  onSelectCatalog: (product: CatalogProduct) => void;
  onSelectOwn: (product: OwnProduct) => void;
  onCreateNew: (name: string) => void;
}

export default function ProductSearch({
  tenantId,
  onSelectCatalog,
  onSelectOwn,
  onCreateNew
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [catalogResults, setCatalogResults] = useState<CatalogProduct[]>([]);
  const [ownResults, setOwnResults] = useState<OwnProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setCatalogResults([]);
        setOwnResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(query)}&tenantId=${tenantId}`
        );
        const data = await response.json();

        if (data.success) {
          setCatalogResults(data.data.catalog || []);
          setOwnResults(data.data.own || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error en búsqueda:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query, tenantId]);

  const handleSelectCatalog = (product: CatalogProduct) => {
    onSelectCatalog(product);
    setQuery('');
    setShowResults(false);
  };

  const handleSelectOwn = (product: OwnProduct) => {
    onSelectOwn(product);
    setQuery('');
    setShowResults(false);
  };

  const handleCreateNew = () => {
    onCreateNew(query);
    setQuery('');
    setShowResults(false);
  };

  const hasResults = catalogResults.length > 0 || ownResults.length > 0;
  const showCreateButton = query.length >= 2 && !loading;

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Buscar producto..."
          className={cn(
            'w-full pl-10 pr-4 py-3 rounded-lg border-2',
            'bg-background text-foreground text-base',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
          )}
        />
      </div>

      {/* Resultados */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-2 bg-card border-2 border-border rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Buscando...
            </div>
          ) : (
            <>
              {/* Productos del catálogo */}
              {catalogResults.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    Del catálogo
                  </div>
                  {catalogResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectCatalog(product)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg transition-colors text-left"
                    >
                      <span className="text-2xl">🌍</span>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {product.name}
                        </div>
                        {product.suggested_unit && (
                          <div className="text-xs text-muted-foreground">
                            Sugerido: {product.suggested_unit}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Productos propios */}
              {ownResults.length > 0 && (
                <div className="p-2 border-t border-border">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                    Tuyos
                  </div>
                  {ownResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectOwn(product)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-lg transition-colors text-left"
                    >
                      <span className="text-2xl">📦</span>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.varieties.length} variedad(es)
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No hay resultados */}
              {!hasResults && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No se encontraron productos
                </div>
              )}

              {/* Crear nuevo */}
              {showCreateButton && (
                <div className="p-2 border-t border-border">
                  <button
                    onClick={handleCreateNew}
                    className="w-full px-3 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    + Crear &quot;{query}&quot; como nuevo producto
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

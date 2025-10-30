#!/bin/bash
# install-products-module.sh
# Script para instalar el módulo completo de productos

echo "🚀 Instalando módulo de productos..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para crear directorio si no existe
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo -e "${GREEN}✅ Creado: $1${NC}"
    else
        echo -e "${YELLOW}⚠️  Ya existe: $1${NC}"
    fi
}

# Función para copiar archivo
copy_file() {
    if [ -f "$1" ]; then
        cp "$1" "$2"
        echo -e "${GREEN}✅ Copiado: $2${NC}"
    else
        echo -e "${RED}❌ No encontrado: $1${NC}"
    fi
}

echo "📁 Creando directorios..."
create_dir "src/app/api/products/search"
create_dir "src/app/api/products/[id]"
create_dir "src/components/products"
create_dir "src/app/(dashboard)/dashboard/productos/nuevo"
create_dir "src/app/(dashboard)/dashboard/productos/[id]/editar"

echo ""
echo "📄 Copiando archivos..."

# APIs
copy_file "api-products-search-route.ts" "src/app/api/products/search/route.ts"
copy_file "api-products-route.ts" "src/app/api/products/route.ts"
copy_file "api-products-id-route.ts" "src/app/api/products/[id]/route.ts"

# Componentes
copy_file "ProductSearch.tsx" "src/components/products/ProductSearch.tsx"
copy_file "VarietyAccordion.tsx" "src/components/products/VarietyAccordion.tsx"

# Páginas
copy_file "productos-page.tsx" "src/app/(dashboard)/dashboard/productos/page.tsx"
copy_file "productos-nuevo-page.tsx" "src/app/(dashboard)/dashboard/productos/nuevo/page.tsx"
copy_file "productos-editar-page.tsx" "src/app/(dashboard)/dashboard/productos/[id]/editar/page.tsx"

echo ""
echo "🔄 Regenerando Prisma Client..."
npx prisma generate

echo ""
echo -e "${GREEN}✅ ¡Instalación completa!${NC}"
echo ""
echo "🎯 Rutas disponibles:"
echo "  - /dashboard/productos (listado)"
echo "  - /dashboard/productos/nuevo (crear)"
echo "  - /dashboard/productos/[id]/editar (editar)"
echo ""
echo "🚀 Reinicia el servidor: npm run dev"

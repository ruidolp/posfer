# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Point-of-Sale (POS) system for street markets ("ferias libres") in Chile, built with Next.js 15, React 19, TypeScript, Prisma, and PostgreSQL. The system supports multi-tenancy, offline-first operation using IndexedDB, and is optimized for mobile-first touch interfaces.

## Development Commands

```bash
# Development
npm run dev                 # Start development server (http://localhost:3000)
npm run build               # Build production bundle
npm start                   # Start production server
npm run lint                # Run ESLint

# Database
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run database migrations (dev)
npm run prisma:studio       # Open Prisma Studio GUI
npm run prisma:seed         # Seed database with initial data
npm run db:push             # Push schema changes without migration
npm run db:setup            # Generate client and push schema (quick setup)
```

## Architecture

### Multi-Tenancy Model

The application uses a **tenant-per-row** pattern where every major entity has a `tenant_id` column. All database queries must be scoped by tenant_id to ensure data isolation. The `Tenant` model represents individual businesses using the system.

### Two-Level Product Hierarchy

Products use a parent-child structure:
- **ProductParent**: Base product category (e.g., "Tomate")
  - Can be global (shared across tenants) or tenant-specific
  - Has `is_global` flag and optional `tenant_id`
- **ProductVariety**: Specific variations (e.g., "Tomate Cherry 1kg")
  - Always tenant-specific (has `tenant_id`)
  - Linked to parent via `parent_id`
  - Contains pricing (`base_price`), stock (`current_stock`), and unit type
  - Has multiple `VarietyPriceOption` for preset price/quantity combos

### Offline-First Architecture

The system uses a dual-storage strategy:

1. **Server-side**: PostgreSQL via Prisma ORM
2. **Client-side**: Dexie (IndexedDB wrapper) for offline operation

**Key files:**
- `src/lib/db/indexedDB.ts`: Dexie database schema and operations
- `src/lib/db/syncManager.ts`: Sync logic between local and server

**Sync mechanism:**
- Products, locations, and suppliers sync FROM server TO client
- Sales sync FROM client TO server (with offline queue)
- `SyncQueue` table tracks pending operations
- Auto-sync runs on connection restore and periodic intervals

### State Management

Uses Zustand stores (all in `src/stores/`):
- `authStore`: User authentication, persisted to localStorage
- `cartStore`: Shopping cart for sales, ephemeral
- `themeStore`: UI theme preferences

### API Routes

RESTful API routes in `src/app/api/`:
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- Products: `/api/products`, `/api/products/[id]`, `/api/products/[id]/price-options`, `/api/products/search`
- Sales: `/api/sales`
- Purchases: `/api/purchases`
- Suppliers: `/api/suppliers`
- Locations: `/api/locations`
- Cash Register: `/api/cash-register/open`, `/api/cash-register/close`, `/api/cash-register/current`
- Sync: `/api/sync/initialize`

All API routes use JWT authentication from `src/lib/auth.ts` and tenant isolation.

### Database Schema Key Concepts

**Cash Register Flow:**
1. User opens cash register (`CashRegister` with `status: "open"`)
2. All sales during session link to that `cash_register_id`
3. User closes register with final count (`status: "closed"`, `closing_amount` set)

**Purchase Categories:**
Enum `PurchaseCategory` includes: MERCADERIA, TRANSPORTE_BENCINA, MATERIALES, SUELDOS, PUBLICIDAD, GASTOS_FIJOS, IMPREVISTOS_OTROS

**Product Daily Sales:**
The `ProductDailySales` table tracks sale frequency per product/cash register/date for recommendations and sorting by popularity.

**Sale Structure:**
- `Sale` has many `SaleItem` (products sold) and `SalePayment` (payment methods)
- Supports special pricing with `is_special_price` and `special_price_reason` fields
- Can be linked to a `Location` (selling location)

## Important Patterns

### Tenant Isolation
Always filter queries by `tenant_id`. Most Prisma queries should include:
```typescript
where: { tenant_id: user.tenantId, /* other filters */ }
```

### Authentication
- JWT tokens stored in cookies
- Auth middleware in `src/lib/auth.ts`
- Client-side auth state persisted via Zustand

### Offline Sales
When creating sales offline:
1. Save to IndexedDB with `synced: false`
2. Add to `SyncQueue` with `operationType: 'sale'`
3. Sync manager attempts upload when online
4. Mark as synced on success

### Path Aliases
Use `@/` for imports (e.g., `@/components/...`, `@/lib/...`, `@/stores/...`)

## UI Framework

- **Styling**: Tailwind CSS with custom theme via CSS variables
- **Components**: Radix UI primitives for accessibility
- **Themes**: `high_contrast`, `color_blind`, `large_text` modes via `data-theme` attribute
- **Mobile-first**: Touch targets minimum 44x44px, responsive layouts

## Database Connection

Prisma client singleton in `src/lib/prisma.ts`. Connection string from `DATABASE_URL` environment variable (PostgreSQL).

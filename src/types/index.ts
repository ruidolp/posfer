// src/types/index.ts

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// AUTH TYPES
// ============================================

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  name: string;
  businessName: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    phone: string;
    name: string;
    email?: string;
    tenantId: string;
    role: string;
  };
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  unitType?: string;
  stock?: number;
  alertStock?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFormData {
  name: string;
  price: number;
  unitType?: string;
  stock?: number;
  alertStock?: number;
}

// ============================================
// SALE TYPES
// ============================================

export interface Sale {
  id: string;
  tenantId: string;
  userId: string;
  cashRegisterId?: string;
  locationId?: string;
  total: number;
  saleDate: Date;
  synced: boolean;
  localId?: string;
  items: SaleItem[];
  payments: Payment[];
}

export interface SaleItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  paymentMethod: 'cash' | 'transfer' | 'debit' | 'credit';
  amount: number;
  reference?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface SaleFormData {
  items: CartItem[];
  payments: Payment[];
  total: number;
  locationId?: string;
}

// ============================================
// CASH REGISTER TYPES
// ============================================

export interface CashRegister {
  id: string;
  tenantId: string;
  userId: string;
  locationId?: string;
  openingAmount: number;
  closingAmount?: number;
  openedAt: Date;
  closedAt?: Date;
  status: 'open' | 'closed';
  notes?: string;
}

export interface OpenCashRegisterRequest {
  openingAmount: number;
  locationId?: string;
  notes?: string;
}

export interface CloseCashRegisterRequest {
  closingAmount: number;
  notes?: string;
}

// ============================================
// PROVIDER TYPES
// ============================================

export interface Provider {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

// ============================================
// LOCATION TYPES
// ============================================

export interface Location {
  id: string;
  tenantId: string;
  name: string;
  address?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationFormData {
  name: string;
  address?: string;
}

// ============================================
// PURCHASE TYPES
// ============================================

export interface Purchase {
  id: string;
  tenantId: string;
  providerId?: string;
  provider?: Provider;
  total: number;
  purchaseDate: Date;
  notes?: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  productId?: string;
  product?: Product;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  updateStock: boolean;
}

export interface PurchaseFormData {
  providerId?: string;
  purchaseDate: Date;
  items: {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    updateStock: boolean;
  }[];
  notes?: string;
}

// ============================================
// SYNC TYPES
// ============================================

export interface SyncOperation {
  id: string;
  tenantId: string;
  operationType: 'sale' | 'purchase' | 'product_update';
  operationData: any;
  status: 'pending' | 'synced' | 'error';
  errorMessage?: string;
  attempts: number;
  createdAt: Date;
  syncedAt?: Date;
}

// ============================================
// THEME TYPES
// ============================================

export type ThemeType = 
  | 'high_contrast' 
  | 'sunny_day' 
  | 'cloudy' 
  | 'sunset';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
}

// ============================================
// TENANT/CONFIG TYPES
// ============================================

export interface TenantConfig {
  id: string;
  businessName: string;
  phone: string;
  currency: string;
  theme: ThemeType;
  createdAt: Date;
  updatedAt: Date;
}

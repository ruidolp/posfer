// src/types/index.ts

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  tenantId: string;
  businessName: string;
  role: string;
  theme: string;
  currency: string;
  active: boolean;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  unit_type?: string;
  current_price: number;
  current_stock?: number;
  alert_stock?: number;
  status: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  score?: number; // Para ordenamiento por más vendidos
}

export interface ProductPriceOption {
  id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  label?: string;
  active: boolean;
  created_at: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  isSpecialPrice?: boolean;      // ← Campo agregado
  specialPriceReason?: string;   // ← Campo agregado
}

export interface Payment {
  paymentMethod: 'cash' | 'transfer' | 'debit' | 'credit';
  amount: number;
  reference?: string;
}

export interface Sale {
  id: string;
  tenant_id: string;
  user_id: string;
  cash_register_id: string;
  location_id?: string;
  total: number;
  sale_date: string;
  synced: boolean;
  created_at: string;
  items?: SaleItem[];
  payments?: SalePayment[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  is_special_price: boolean;
  special_price_reason?: string;
  created_at: string;
  product?: Product;
}

export interface SalePayment {
  id: string;
  sale_id: string;
  payment_method: string;
  amount: number;
  reference?: string;
  created_at: string;
}

export interface CashRegister {
  id: string;
  tenant_id: string;
  user_id: string;
  location_id?: string;
  opening_amount: number;
  closing_amount?: number;
  opened_at: string;
  closed_at?: string;
  status: string;
  notes?: string;
}

export interface Provider {
  id: string;
  tenant_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  address?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenantId: string;  // ← Correcto (camelCase)
  phone: string;
  email?: string;
  name: string;
  role: string;
  active: boolean;
}

export interface Payment {
  paymentMethod: string;
  amount: number;
  reference?: string;
}

export interface Product {
  id: string;
  name: string;
  unit_type?: string;
  current_price: number;
  current_stock?: number;
  active: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isSpecialPrice?: boolean;
  specialPriceReason?: string;
}


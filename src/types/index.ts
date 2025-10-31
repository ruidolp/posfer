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
}

export interface Product {
  id: string;
  name: string;
  tenant_id: string;
  is_global: boolean;
  active: boolean;
  varieties?: Variety[];
}

export interface Variety {
  id: string;
  parent_id: string;
  name: string;
  unit_type: string;
  base_price: number;
  current_stock?: number | null;
  alert_stock?: number | null;
  active: boolean;
  price_options?: PriceOption[];
}

export interface PriceOption {
  id: string;
  variety_id: string;
  quantity: number;
  total_price: number;
  label?: string | null;
  active: boolean;
}

export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer';

export interface Payment {
  paymentMethod: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface CartItem {
  varietyId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isSpecialPrice?: boolean;
  specialPriceReason?: string;
  packageLabel?: string;
  packageQuantity?: number;
  packageCount?: number;
}

export interface Sale {
  id: string;
  tenant_id: string;
  user_id: string;
  cash_register_id: string;
  location_id?: string;
  total: number;
  created_at: Date;
  items: SaleItem[];
  payments: SalePayment[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  variety_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  is_special_price: boolean;
  special_price_reason?: string;
}

export interface SalePayment {
  id: string;
  sale_id: string;
  payment_method: PaymentMethod;
  amount: number;
  reference?: string;
}

export type ThemeType = 'light' | 'dark' | 'blue' | 'green' | 'high_contrast';

import React from 'react';

export type PlanType = 'FREE' | 'PRO' | 'BUSINESS';

export interface Addons {
  manufacturing: boolean;
  restaurant: boolean;
  plus_advance: boolean;
  custom_branding: boolean; // New Addon
}

export interface LicenseData {
  status: 'OK' | 'EXPIRED' | 'SUSPENDED';
  plan: PlanType;
  days_left: number;
  addons: Addons;
}

export interface UserProfile {
  companyName: string;
  adminName: string;
  email: string;
  avatar?: string; // Base64 string for image
}

export interface InvoiceSettings {
  paymentInfo: string;
  logo?: string;
  hideWatermark: boolean;
  footerNote: string;
  signatureName: string;
  city: string;
  taxRate: number; // Added tax rate
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  projectId?: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface KPI {
  label: string;
  value: string | number;
  trend?: number;
  isCurrency?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  addonRequired?: keyof Addons;
}

// --- Manufacturing Types ---

export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // e.g., kg, meter, pcs
  costPerUnit: number;
  currentStock: number;
  minStockAlert: number;
}

export interface BOMItem {
  materialId: string;
  qtyRequired: number;
}

export interface BOM {
  id: string;
  productName: string; // Finished Good Name
  estimatedCost: number; // Auto-calculated based on materials
  items: BOMItem[];
}

export interface ProductionOrder {
  id: string;
  bomId: string;
  date: string;
  qtyProduced: number;
  totalCost: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
}

// --- Restaurant Types ---

export interface MenuItem {
  id: string;
  name: string;
  category: string; // Changed from union type to string to support dynamic categories
  price: number;
  cogs: number; // Cost of Goods Sold based on recipe
  image?: string;
}

export interface CartItem extends MenuItem {
  qty: number;
}

export interface POSOrder {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER';
}

// --- CRM & Project Types ---

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalRevenue: number;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  progress: number; // 0-100
  dueDate: string;
  budget: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee: string;
  dueDate: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'MEETING' | 'REMINDER' | 'OTHER';
  description?: string;
}
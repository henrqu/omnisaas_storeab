/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Database Schema Interfaces representing all 21 requested PostgreSQL tables.
// This structure is fully aligned with a Supabase PostgreSQL backend.

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string; // references users.id
  updated_at: string;
  username: string;
  full_name: string;
  avatar_url: string;
  role: 'admin' | 'owner' | 'member' | 'guest';
  phone?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  price_id: string;
  cancel_at_period_end: boolean;
  current_period_start: string;
  current_period_end: string;
  tier_name: 'Free' | 'Pro Plan' | 'Enterprise';
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  last_completed: string | null; // ISO Date String
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  category: 'personal' | 'fitness' | 'business' | 'financial';
  status: 'in_progress' | 'completed' | 'failed';
}

export interface HealthRecord {
  id: string;
  user_id: string;
  date: string;
  weight: number | null; // kg
  systolic: number | null; // Blood pressure
  diastolic: number | null;
  sleep_hours: number | null;
  symptoms: string;
  notes: string;
}

export interface Meal {
  id: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface PregnancyRecord {
  id: string;
  user_id: string;
  date: string;
  week_number: number;
  weight: number | null; // kg
  symptoms: string;
  baby_size_estimate: string; // e.g., "Tamanho de um limão"
  doctor_notes: string;
}

export interface FamilyDocument {
  name: string;
  size: string;
  type: string;
  content: string; // base64 representation
}

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  birth_date: string;
  notes: string;
  documents?: FamilyDocument[];
  avatar_url?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  period: string; // e.g. "2026-07"
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  tax_id: string; // CNPJ / NIF / Tax ID
  address: string;
  website: string;
}

export interface Employee {
  id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  hire_date: string;
  salary: number;
  status: 'active' | 'suspended' | 'terminated';
  avatar_url?: string;
  documents?: { name: string; type: string; content: string; size?: string }[];
}

export interface Payroll {
  id: string;
  employee_id: string;
  pay_period: string; // e.g., "2026-07"
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_pay: number;
  status: 'pending' | 'processed' | 'paid';
  processed_at: string | null;
}

export interface Product {
  id: string;
  company_id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  description: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  location: string;
  reorder_point: number;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
}

export interface Sale {
  id: string;
  company_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
}

export interface Report {
  id: string;
  company_id: string;
  type: 'financial' | 'sales' | 'inventory' | 'employees';
  name: string;
  data: string; // JSON String representing rich aggregated metrics
  created_at: string;
}

export interface AiHistory {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  created_at: string;
  tokens_used: number;
  provider?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
}

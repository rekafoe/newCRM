export interface Item {
  id: number;
  type: string;
  params: { description: string };
  price: number;
}

export interface Order {
  id: number;
  number: string;
  status: number;
  createdAt: string;
  // Optional customer and prepayment fields synced with backend
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  prepaymentAmount?: number;
  prepaymentStatus?: string;
  paymentUrl?: string;
  paymentId?: string;
  items: Item[];
}

export interface PresetExtra {
  name: string;
  price: number;
  type: 'checkbox' | 'number';
  unit?: string;
}

export interface PresetItem {
  description: string;
  price: number;
}

export interface PresetCategory {
  category: string;
  color: string;
  items: PresetItem[];
  extras: PresetExtra[];
}

export interface Material {
  id: number;
  name: string;
  unit: string;
  quantity: number;
}

export interface MaterialRow {
  materialId: number;
  qtyPerItem: number;
  name: string;
  unit: string;
  quantity: number;
}
// frontend/src/types.ts
export interface DailyReport {
  id: number;
  report_date: string;
  orders_count: number;
  total_revenue: number;
  created_at: string;
  updated_at?: string;
  user_id?: number;
  user_name?: string | null;
}

export interface UserRef { id: number; name: string }

export interface Item {
  id: number;
  orderId: number;
  type: string;
  params: { description: string };
  price: number;
}

export interface Order {
  id: number;
  number: string;
  status: number;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  prepaymentAmount?: number;
  prepaymentStatus?: string;
  paymentUrl?: string;
  paymentId?: string;
  items: Item[];
}

export interface Material {
  id: number;
  name: string;
  unit: string;
  quantity: number;
}

export interface ProductMaterial {
  presetCategory: string;
  presetDescription: string;
  materialId: number;
  qtyPerItem: number;
}
export interface DailyReport {
  id: number;
  report_date: string;    // YYYY-MM-DD
  orders_count: number;
  total_revenue: number;
  created_at: string;     // ISO timestamp
  updated_at?: string;
}

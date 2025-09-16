import axios from 'axios';
import { Order, Item, PresetCategory, MaterialRow, Material, DailyReport, UserRef, OrderFile, Printer } from './types';
const api = axios.create({ baseURL: '/api' });

// Attach auth token from localStorage for protected endpoints
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('crmToken');
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`
      } as any;
    }
  } catch {}
  return config;
});

export function setAuthToken(token?: string) {
  if (token) localStorage.setItem('crmToken', token);
  else localStorage.removeItem('crmToken');
}

export const getOrders = () => api.get<Order[]>('/orders');
export const createOrder = () => api.post<Order>('/orders');
export const updateOrderStatus = (id: number, status: number) =>
  api.put<Order>(`/orders/${id}/status`, { status });

export const addOrderItem = (id: number, item: Omit<Item, 'id'>) =>
  api.post<Item>(`/orders/${id}/items`, item);

export const deleteOrder = (id: number) => api.delete(`/orders/${id}`);
export const deleteOrderItem = (orderId: number, itemId: number) =>
  api.delete(`/orders/${orderId}/items/${itemId}`);
export const updateOrderItem = (orderId: number, itemId: number, data: Partial<Item>) =>
  api.patch(`/orders/${orderId}/items/${itemId}`, data);

export const getMaterials = () => api.get<Material[]>('/materials');
export const saveMaterial = (mat: Partial<Material>) =>
  api.post<Material[]>('/materials', mat);
export const deleteMaterial = (id: number) => api.delete(`/materials/${id}`);
export const spendMaterial = (payload: { materialId: number; delta: number; reason?: string; orderId?: number }) => api.post<Material>('/materials/spend', payload);
export const getMaterialMoves = (params?: { materialId?: number; orderId?: number; user_id?: number; from?: string; to?: string }) =>
  api.get('/materials/moves', { params });

export const getProductMaterials = (cat: string, desc: string) =>
  api.get<MaterialRow[]>(`/product-materials/${encodeURIComponent(cat)}/${encodeURIComponent(desc)}`);
export const saveProductMaterials = (cfg: {
  presetCategory: string;
  presetDescription: string;
  materials: { materialId: number; qtyPerItem: number }[];
}) => api.post('/product-materials', cfg);
export const getDailyReports = (params?: { user_id?: number | ''; from?: string; to?: string }) =>
  api.get<DailyReport[]>('/daily-reports', { params });

export const getDailyReportByDate = (date: string) =>
  api.get<DailyReport>(`/daily/${date}`);
export const updateDailyReport = (date: string, data: {
  orders_count?: number;
  total_revenue?: number;
}) =>
  api.patch<DailyReport>(`/daily/${date}`, data);

export const getPresets = () => api.get<PresetCategory[]>('/presets');
export const getUsers = () => api.get<UserRef[]>('/users');
export const createDailyReport = (data: { report_date: string; user_id?: number; orders_count?: number; total_revenue?: number }) =>
  api.post<DailyReport>('/daily', data);

export const getOrderStatuses = () => api.get<Array<{ id: number; name: string; color?: string; sort_order: number }>>('/order-statuses');

// Files API
export const listOrderFiles = (orderId: number) => api.get<OrderFile[]>(`/orders/${orderId}/files`);
export const uploadOrderFile = (orderId: number, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post<OrderFile>(`/orders/${orderId}/files`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteOrderFile = (orderId: number, fileId: number) => api.delete(`/orders/${orderId}/files/${fileId}`);
export const approveOrderFile = (orderId: number, fileId: number) => api.post<OrderFile>(`/orders/${orderId}/files/${fileId}/approve`, {});

// Payments / Prepayment
export const createPrepaymentLink = (orderId: number, amount?: number) => api.post<Order>(`/orders/${orderId}/prepay`, amount != null ? { amount } : {});

// Printers
export const getPrinters = () => api.get<Printer[]>('/printers');
export const submitPrinterCounter = (printerId: number, data: { counter_date: string; value: number }) => api.post(`/printers/${printerId}/counters`, data);
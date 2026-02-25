import axiosClient from '../axiosClient';

export interface InventoryItem {
  id: number;
  medicine_name: string;
  medicine_type: string;
  current_quantity: string;
  unit: string;
  expiry_date: string | null;
  purchase_date?: string | null;
  price?: string | number | null;
  supplier?: string | null;
  notes?: string | null;
  is_active?: boolean;
  is_low_stock: boolean;
  is_expired: boolean;
  is_expiring_soon?: boolean;
  linked_reminder_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateInventoryData {
  medicine_name: string;
  medicine_type: string;
  current_quantity: number;
  unit?: string;
  expiry_date?: string | null;
  purchase_date?: string | null;
  price?: number;
  supplier?: string;
  notes?: string;
}

export interface UpdateInventoryData extends Partial<CreateInventoryData> {
  is_active?: boolean;
}

export interface AdjustStockData {
  adjustment: number;   // positive = add, negative = remove
  notes?: string;
}

export const inventoryApi = {
  // GET /api/inventory/
  getInventory: () => axiosClient.get('/inventory/'),

  // POST /api/inventory/
  createInventoryItem: (data: CreateInventoryData) =>
    axiosClient.post('/inventory/', data),

  // GET /api/inventory/{id}/
  getInventoryItem: (id: number) => axiosClient.get(`/inventory/${id}/`),

  // PUT /api/inventory/{id}/
  updateInventoryItem: (id: number, data: CreateInventoryData) =>
    axiosClient.put(`/inventory/${id}/`, data),

  // PATCH /api/inventory/{id}/
  patchInventoryItem: (id: number, data: UpdateInventoryData) =>
    axiosClient.patch(`/inventory/${id}/`, data),

  // DELETE /api/inventory/{id}/
  deleteInventoryItem: (id: number) => axiosClient.delete(`/inventory/${id}/`),

  // POST /api/inventory/{id}/adjust/
  adjustStock: (id: number, data: AdjustStockData) =>
    axiosClient.post(`/inventory/${id}/adjust/`, data),

  // GET /api/inventory/low_stock/
  getLowStock: () => axiosClient.get('/inventory/low_stock/'),

  // GET /api/inventory/expired/
  getExpired: () => axiosClient.get('/inventory/expired/'),

  // GET /api/inventory/expiring_soon/
  getExpiringSoon: () => axiosClient.get('/inventory/expiring_soon/'),
};

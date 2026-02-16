import { fetchApi } from '../api';

export const purchaseOrderService = {
  // Get all purchase orders
  getAll: async (skip = 0, limit = 100) => {
    try {
      const data = await fetchApi(`/api/purchase-orders/?skip=${skip}&limit=${limit}`);
      // Return direct array or check for common wrapper keys
      return Array.isArray(data) ? data : (data?.purchase_orders || data?.items || []);
    } catch (error) {
      console.error("📦 PO API failed:", error.message);
      return [];
    }
  },

  // Get single PO by ID
  getById: async (id) => {
    try {
      return await fetchApi(`/api/purchase-orders/${id}`);
    } catch (error) {
      throw new Error(`Purchase Order with ID ${id} not found`);
    }
  },

  // Get PO by string ID (po_id_str)
  getByPoIdStr: async (poIdStr) => {
    try {
      return await fetchApi(`/api/purchase-orders/po/${poIdStr}`);
    } catch (error) {
      throw new Error(`Purchase Order ${poIdStr} not found`);
    }
  },

  // Create new PO
  create: async (poData) => {
    try {
      return await fetchApi('/api/purchase-orders/', {
        method: 'POST',
        body: JSON.stringify(poData),
      });
    } catch (error) {
      throw new Error('Cannot create Purchase Order: ' + error.message);
    }
  },

  // Update existing PO
  update: async (id, poData) => {
    try {
      return await fetchApi(`/api/purchase-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(poData),
      });
    } catch (error) {
      throw new Error('Cannot update Purchase Order: ' + error.message);
    }
  },

  // Delete PO
  delete: async (id) => {
    try {
      return await fetchApi(`/api/purchase-orders/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete Purchase Order: ' + error.message);
    }
  },

  // Get PO items
  getItems: async (id) => {
    try {
      return await fetchApi(`/api/purchase-orders/${id}/items`);
    } catch (error) {
      return [];
    }
  }
};

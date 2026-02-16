import { fetchApi } from '../api';

export const poItemService = {
  // Get all PO items
  getAll: async (skip = 0, limit = 100, po_id = null) => {
    try {
      let endpoint = `/api/po-items/?skip=${skip}&limit=${limit}`;
      if (po_id) endpoint += `&po_id=${po_id}`;
      
      const data = await fetchApi(endpoint);
      return Array.isArray(data) ? data : (data?.po_items || data?.items || []);
    } catch (error) {
      console.error("📦 PO Items API failed:", error.message);
      return [];
    }
  },

  // Get in-stock/available items
  getAvailable: async () => {
    try {
      const data = await fetchApi('/api/po-items/available');
      return Array.isArray(data) ? data : (data?.items || []);
    } catch (error) {
      console.error("📦 Available Items API failed:", error.message);
      return [];
    }
  },

  // Get PO item by Stock Number
  getByStockNumber: async (stockNumber) => {
    try {
      return await fetchApi(`/api/po-items/stock/${stockNumber}`);
    } catch (error) {
      throw new Error(`Item ${stockNumber} not found`);
    }
  },

  // Get PO item by ID
  getById: async (id) => {
    try {
      return await fetchApi(`/api/po-items/${id}`);
    } catch (error) {
      throw new Error(`Item ID ${id} not found`);
    }
  },

  // Create new PO item
  create: async (itemData) => {
    try {
      return await fetchApi('/api/po-items/', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
    } catch (error) {
      throw new Error('Cannot create PO item: ' + error.message);
    }
  },

  // Update existing PO item
  update: async (id, itemData) => {
    try {
      return await fetchApi(`/api/po-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
      });
    } catch (error) {
      throw new Error('Cannot update PO item: ' + error.message);
    }
  },

  // Delete PO item
  delete: async (id) => {
    try {
      return await fetchApi(`/api/po-items/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete PO item: ' + error.message);
    }
  },

  // Dismantle PO item
  dismantle: async (dismantleData) => {
    try {
      return await fetchApi('/api/po-items/dismantle', {
        method: 'POST',
        body: JSON.stringify(dismantleData),
      });
    } catch (error) {
      throw new Error('Cannot dismantle item: ' + error.message);
    }
  }
};

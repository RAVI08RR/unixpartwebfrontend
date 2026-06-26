import { fetchApi } from '../api';

export const poItemService = {
  // Get all PO items
  getAll: async (page = 1, page_size = 10, po_id = null) => {
    try {
      let endpoint = `/api/po-items/?page=${page}&page_size=${page_size}`;
      if (po_id) endpoint += `&po_id=${po_id}`;
      const data = await fetchApi(endpoint);
      if (Array.isArray(data)) {
        return { data, total: data.length, page, page_size, total_pages: 1 };
      }
      return {
        data: data?.data || data?.po_items || data?.items || [],
        total: data?.total ?? 0,
        page: data?.page ?? page,
        page_size: data?.page_size ?? page_size,
        total_pages: data?.total_pages ?? 1,
      };
    } catch (error) {
      console.error('📦 PO Items API failed:', error.message);
      return { data: [], total: 0, page, page_size, total_pages: 1 };
    }
  },

  // Get dropdown PO items with optional search
  getDropdown: async (search = '') => {
    try {
      const url = search ? `/api/dropdown/po-items?search=${encodeURIComponent(search)}` : '/api/dropdown/po-items';
      return await fetchApi(url);
    } catch (error) {
      // Silently fallback to getAll if dropdown endpoint fails (e.g., permission issues)
      console.log("📦 Using fallback: fetching PO items via getAll");
      return poItemService.getAll(1, 10);
    }
  },

  // Get in-stock/available items
  getAvailable: async () => {
    try {
      const data = await fetchApi('/api/po-items/available');
      return Array.isArray(data) ? data : (data?.data || data?.items || []);
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
  dismantle: async (parentItemId, dismantleData) => {
    try {
      let id = parentItemId;
      let data = dismantleData || {};
      if (typeof parentItemId === 'object' && parentItemId !== null) {
        id = parentItemId.item_id || parentItemId.parent_item_id || parentItemId.id;
        data = { ...parentItemId, ...data };
      }
      return await fetchApi(`/api/po-items/${id}/dismantle`, {
        method: 'POST',
        body: JSON.stringify({
          parent_item_id: id,
          ...data
        }),
      });
    } catch (error) {
      throw new Error('Cannot dismantle item: ' + error.message);
    }
  }
};

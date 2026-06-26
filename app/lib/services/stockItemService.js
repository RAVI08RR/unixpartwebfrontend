import { fetchApi } from '../api';

export const stockItemService = {
  // Get all stock items
  getAll: async (page = 1, page_size = 10, parent_id = null) => {
    try {
      let url = `/api/stock-items?page=${page}&page_size=${page_size}`;
      if (parent_id) url += `&parent_id=${parent_id}`;
      const data = await fetchApi(url);
      if (Array.isArray(data)) {
        return { data, total: data.length, page, page_size, total_pages: 1 };
      }
      return {
        data: data?.data || data?.stock_items || data?.items || [],
        total: data?.total ?? 0,
        page: data?.page ?? page,
        page_size: data?.page_size ?? page_size,
        total_pages: data?.total_pages ?? 1,
      };
    } catch (error) {
      console.error('Failed to fetch stock items:', error);
      return { data: [], total: 0, page, page_size, total_pages: 1 };
    }
  },

  // Get dropdown stock items
  getDropdown: async () => {
    try {
      return await fetchApi('/api/dropdown/stock-items');
    } catch (error) {
      console.error("📦 Stock Items Dropdown API failed:", error.message);
      return stockItemService.getAll(1, 10); // Fallback to getAll
    }
  },

  // Get stock item by ID
  getById: async (id) => {
    try {
      const response = await fetchApi(`/api/stock-items/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch stock item ${id}:`, error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await fetchApi('/api/stock-items/categories');
      return response;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Return fallback categories if API fails
      return [
        { id: 1, name: "Engine Parts", description: "All engine related components" },
        { id: 2, name: "Body Parts", description: "Exterior and interior body components" },
        { id: 3, name: "Electrical", description: "Electrical components and systems" },
        { id: 4, name: "Transmission", description: "Transmission and drivetrain parts" },
        { id: 5, name: "Suspension", description: "Suspension and steering components" },
        { id: 6, name: "Brakes", description: "Brake system components" },
        { id: 7, name: "Cooling System", description: "Radiators, fans, and cooling parts" },
        { id: 8, name: "Exhaust System", description: "Exhaust pipes, mufflers, and catalytic converters" }
      ];
    }
  },

  // Get sub items by parent ID
  getSubItems: async (parent_id) => {
    try {
      const response = await fetchApi(`/api/stock-items/${parent_id}/sub-items`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch sub items for parent ${parent_id}:`, error);
      throw error;
    }
  },

  // Create new stock item
  create: async (stockItemData) => {
    try {
      const response = await fetchApi('/api/stock-items', {
        method: 'POST',
        body: JSON.stringify(stockItemData),
      });
      return response;
    } catch (error) {
      console.error('Failed to create stock item:', error);
      throw error;
    }
  },

  // Update stock item
  update: async (id, stockItemData) => {
    try {
      const response = await fetchApi(`/api/stock-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(stockItemData),
      });
      return response;
    } catch (error) {
      console.error(`Failed to update stock item ${id}:`, error);
      throw error;
    }
  },

  // Delete stock item
  delete: async (id) => {
    try {
      const response = await fetchApi(`/api/stock-items/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Failed to delete stock item ${id}:`, error);
      throw error;
    }
  }
};
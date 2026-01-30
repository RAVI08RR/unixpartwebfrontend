import { fetchApi } from '../api';

export const stockItemService = {
  // Get all stock items
  getAll: async (skip = 0, limit = 100, parent_id = null) => {
    try {
      let url = `/api/stock-items?skip=${skip}&limit=${limit}`;
      if (parent_id) {
        url += `&parent_id=${parent_id}`;
      }
      const response = await fetchApi(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch stock items:', error);
      throw error;
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
      throw error;
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
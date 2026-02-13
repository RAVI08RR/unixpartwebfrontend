import { fetchApi } from '../api';

export const containerItemService = {
  // Get all container items with filters
  getAll: async (skip = 0, limit = 100, container_id = null, branch_id = null, status = null) => {
    let queryParams = `skip=${skip}&limit=${limit}`;
    
    // Only add container_id to query params
    if (container_id) queryParams += `&container_id=${container_id}`;
    // Note: branch_id and status are NOT passed as query parameters
    
    try {
      console.log('📦 Fetching container items from API...');
      const data = await fetchApi(`/api/container-items?${queryParams}`);
      console.log('📦 Container items API response:', data);
      
      const itemsData = Array.isArray(data) ? data : (data?.items || data?.container_items || []);
      
      if (itemsData.length > 0) {
        console.log('✅ Container items fetched successfully:', itemsData.length);
        return itemsData;
      } else {
        console.log('⚠️ No container items in API response');
        return [];
      }
    } catch (error) {
      console.error("📦 Container items API failed:", error.message);
      throw error;
    }
  },

  // Get available items
  getAvailable: async (branch_id = null) => {
    let queryParams = '';
    if (branch_id) queryParams = `?branch_id=${branch_id}`;
    
    try {
      const data = await fetchApi(`/api/container-items/available${queryParams}`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("📦 Available items API failed:", error.message);
      return [];
    }
  },

  // Get single container item by ID
  getById: async (id) => {
    try {
      return await fetchApi(`/api/container-items/${id}`);
    } catch (error) {
      console.warn('📦 Container item service error for ID:', id, error.message);
      throw new Error(`Container item with ID ${id} not found`);
    }
  },

  // Get container item by stock number
  getByStockNumber: async (stockNumber) => {
    try {
      return await fetchApi(`/api/container-items/stock/${stockNumber}`);
    } catch (error) {
      console.warn('📦 Container item service error for stock number:', stockNumber, error.message);
      throw new Error(`Container item with stock number ${stockNumber} not found`);
    }
  },

  // Create new container item
  create: async (itemData) => {
    try {
      return await fetchApi('/api/container-items', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
    } catch (error) {
      console.warn('📦 Container item creation failed:', error.message);
      throw new Error('Cannot create container item: ' + error.message);
    }
  },

  // Update existing container item
  update: async (id, itemData) => {
    try {
      return await fetchApi(`/api/container-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
      });
    } catch (error) {
      console.warn('📦 Container item update failed:', error.message);
      throw new Error('Cannot update container item: ' + error.message);
    }
  },

  // Delete container item
  delete: async (id) => {
    try {
      return await fetchApi(`/api/container-items/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('📦 Container item deletion failed:', error.message);
      throw new Error('Cannot delete container item: ' + error.message);
    }
  },

  // Dismantle container item
  dismantle: async (dismantleData) => {
    try {
      return await fetchApi('/api/container-items/dismantle', {
        method: 'POST',
        body: JSON.stringify(dismantleData),
      });
    } catch (error) {
      console.warn('📦 Container item dismantle failed:', error.message);
      throw new Error('Cannot dismantle container item: ' + error.message);
    }
  },
};

import { fetchApi } from '../api';

export const containerItemService = {
  // Get all container items
  getAll: async (skip = 0, limit = 100, container_id = null) => {
    try {
      let endpoint = `/api/container-items/?skip=${skip}&limit=${limit}`;
      if (container_id) endpoint += `&container_id=${container_id}`;
      
      const data = await fetchApi(endpoint);
      return Array.isArray(data) ? data : (data?.container_items || data?.items || []);
    } catch (error) {
      console.error("📦 Container Items API failed:", error.message);
      return [];
    }
  },

  // Get container item by ID
  getById: async (id) => {
    try {
      return await fetchApi(`/api/container-items/${id}`);
    } catch (error) {
      throw new Error(`Item ID ${id} not found`);
    }
  },

  // Create new container item
  create: async (itemData) => {
    try {
      return await fetchApi('/api/container-items/', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
    } catch (error) {
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
      throw new Error('Cannot delete container item: ' + error.message);
    }
  }
};

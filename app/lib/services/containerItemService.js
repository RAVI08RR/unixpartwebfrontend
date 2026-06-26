import { fetchApi } from '../api';

export const containerItemService = {
  // Get all container items
  getAll: async (page = 1, page_size = 10, container_id = null) => {
    try {
      let endpoint = `/api/container-items/?page=${page}&page_size=${page_size}`;
      if (container_id) endpoint += `&container_id=${container_id}`;
      const data = await fetchApi(endpoint);
      if (Array.isArray(data)) {
        return { data, total: data.length, page, page_size, total_pages: 1 };
      }
      return {
        data: data?.data || data?.container_items || data?.items || [],
        total: data?.total ?? 0,
        page: data?.page ?? page,
        page_size: data?.page_size ?? page_size,
        total_pages: data?.total_pages ?? 1,
      };
    } catch (error) {
      console.error('📦 Container Items API failed:', error.message);
      return { data: [], total: 0, page, page_size, total_pages: 1 };
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

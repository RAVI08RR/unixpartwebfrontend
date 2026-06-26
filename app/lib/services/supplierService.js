import { fetchApi } from '../api';

export const supplierService = {
  // Get all suppliers with pagination and filters
  getAll: async (page = 1, page_size = 10, status = null) => {
    let queryParams = `page=${page}&page_size=${page_size}`;
    if (status !== null) queryParams += `&status=${status}`;

    try {
      const data = await fetchApi(`/api/suppliers?${queryParams}`);
      if (Array.isArray(data)) {
        return { data, total: data.length, page, page_size, total_pages: 1 };
      }
      return {
        data: data?.data || data?.suppliers || data?.items || [],
        total: data?.total ?? 0,
        page: data?.page ?? page,
        page_size: data?.page_size ?? page_size,
        total_pages: data?.total_pages ?? 1,
      };
    } catch (error) {
      console.error('🏭 Suppliers API failed:', error.message);
      return { data: [], total: 0, page, page_size, total_pages: 1 };
    }
  },


  // Get dropdown suppliers
  getDropdown: async () => {
    try {
      const data = await fetchApi('/api/dropdown/suppliers');
      return Array.isArray(data) ? data : (data?.suppliers || data?.items || data?.data || []);
    } catch (error) {
      // Silently handle permission errors (403) - these are expected when user lacks permissions
      if (error.message.includes('Not authorized') || error.message.includes('403')) {
        console.log("ℹ️ Suppliers dropdown: Using fallback data (permission restricted)");
        return [];
      }
      console.error("🏭 Suppliers Dropdown API failed, using fallback:", error.message);
      // Fallback to getAll if dropdown endpoint fails
      try {
        return await supplierService.getAll(0, 100);
      } catch (fallbackError) {
        console.log("ℹ️ Suppliers fallback: Using empty array (permission restricted)");
        return [];
      }
    }
  },

  // Get single supplier by ID
  getById: async (id) => {
    return fetchApi(`/api/suppliers/${id}`);
  },

  // Create new supplier
  create: async (supplierData) => {
    return fetchApi('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },

  // Update existing supplier
  update: async (id, supplierData) => {
    return fetchApi(`/api/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  },

  // Delete supplier
  delete: async (id) => {
    return fetchApi(`/api/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};
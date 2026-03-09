import { fetchApi } from '../api';

export const supplierService = {
  // Get all suppliers with pagination and filters
  getAll: async (skip = 0, limit = 100, status = null) => {
    let queryParams = `skip=${skip}&limit=${limit}`;
    if (status !== null) queryParams += `&status=${status}`;
    
    try {
      console.log('🏭 Fetching suppliers from API...');
      const data = await fetchApi(`/api/suppliers?${queryParams}`);
      console.log('🏭 Suppliers API response:', data);
      
      const suppliersData = Array.isArray(data) ? data : (data?.suppliers || []);
      
      if (suppliersData.length > 0) {
        console.log('✅ Suppliers fetched successfully:', suppliersData.length);
        return suppliersData;
      } else {
        console.log('⚠️ No suppliers in API response');
        return [];
      }
    } catch (error) {
       console.error("🏭 Suppliers API failed:", error.message);
       return [];
    }
  },

  // Get dropdown suppliers
  getDropdown: async () => {
    try {
      const data = await fetchApi('/api/dropdown/suppliers');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("🏭 Suppliers Dropdown API failed, using fallback:", error.message);
      // Fallback to getAll if dropdown endpoint fails
      try {
        return await supplierService.getAll(0, 500);
      } catch (fallbackError) {
        console.error("🏭 Suppliers fallback also failed:", fallbackError.message);
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
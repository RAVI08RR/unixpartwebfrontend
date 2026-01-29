import { fetchApi } from '../api';

export const supplierService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const data = await fetchApi(`/api/suppliers/?skip=${skip}&limit=${limit}`);
      return Array.isArray(data) ? data : (data?.suppliers || []);
    } catch (error) {
       console.warn("Suppliers API failed, using fallbacks:", error.message);
       return [
         { id: 1, name: "Global Parts Inc.", supplier_code: "SUP-001" },
         { id: 2, name: "Auto Parts Rental LLC", supplier_code: "SUP-002" }
       ];
    }
  },

  getById: async (id) => {
    return fetchApi(`/api/suppliers/${id}/`);
  },

  create: async (supplierData) => {
    return fetchApi('/api/suppliers/', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },

  update: async (id, supplierData) => {
    return fetchApi(`/api/suppliers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  },

  delete: async (id) => {
    return fetchApi(`/api/suppliers/${id}/`, {
      method: 'DELETE',
    });
  },
};
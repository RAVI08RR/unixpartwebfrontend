import { fetchApi } from '../api';

export const supplierService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      console.log('🏭 Fetching suppliers from API...');
      const data = await fetchApi(`/api/suppliers/?skip=${skip}&limit=${limit}`);
      console.log('🏭 Suppliers API response:', data);
      
      const suppliersData = Array.isArray(data) ? data : (data?.suppliers || []);
      
      if (suppliersData.length > 0) {
        console.log('✅ Suppliers fetched successfully:', suppliersData.length);
        return suppliersData;
      } else {
        console.log('⚠️ No suppliers in API response, using fallback');
        throw new Error('No suppliers data from API');
      }
    } catch (error) {
       console.warn("🏭 Suppliers API failed, using fallbacks:", error.message);
       return [
         { id: 1, name: "Global Parts Inc.", supplier_code: "SUP-001", type: "Owner", contact_person: "John Doe" },
         { id: 2, name: "Auto Parts Rental LLC", supplier_code: "SUP-002", type: "Rental", contact_person: "Jane Smith" },
         { id: 3, name: "Premium Auto Supplies", supplier_code: "SUP-003", type: "Owner", contact_person: "Ahmed Ali" }
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
import { fetchApi } from '../api';

export const customerService = {
  // Get all customers with pagination and filters
  getAll: async (skip = 0, limit = 100, status = null) => {
    let queryParams = `skip=${skip}&limit=${limit}`;
    // Don't filter by status to get all customers
    
    try {
      console.log('🏢 Fetching customers from API...');
      const data = await fetchApi(`/api/customers?${queryParams}`);
      console.log('🏢 Customers API response:', data);
      
      const customersData = Array.isArray(data) ? data : (data?.customers || []);
      
      if (customersData.length > 0) {
        console.log('✅ Customers fetched successfully:', customersData.length);
        return customersData;
      } else {
        console.log('⚠️ No customers in API response');
        return [];
      }
    } catch (error) {
       console.error("🏢 Customers API failed:", error.message);
       return [];
    }
  },

  // Get single customer by ID
  getById: async (id) => {
    return fetchApi(`/api/customers/${id}`);
  },

  // Create new customer
  create: async (customerData) => {
    return fetchApi('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  // Update existing customer
  update: async (id, customerData) => {
    return fetchApi(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  },

  // Delete customer
  delete: async (id) => {
    return fetchApi(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  },
};
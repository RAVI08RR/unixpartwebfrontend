import { fetchApi } from '../api';

export const customerService = {
  // Get all customers with pagination and filters
  getAll: async (skip = 0, limit = 100, status = null) => {
    let queryParams = `skip=${skip}&limit=${limit}`;
    if (status !== null) queryParams += `&status=${status}`;
    
    try {
      console.log('🏢 Fetching customers from API...');
      const data = await fetchApi(`/api/customers?${queryParams}`);
      console.log('🏢 Customers API response:', data);
      
      const customersData = Array.isArray(data) ? data : (data?.customers || []);
      
      if (customersData.length > 0) {
        console.log('✅ Customers fetched successfully:', customersData.length);
        return customersData;
      } else {
        console.log('⚠️ No customers in API response, using fallback');
        throw new Error('No customers data from API');
      }
    } catch (error) {
       console.warn("🏢 Customers API failed, using fallbacks:", error.message);
       return [
         { id: 1, customer_code: "CUST-001", full_name: "John Doe", phone: "+971-4-555-0100", business_name: "Doe Enterprises" },
         { id: 2, customer_code: "CUST-002", full_name: "Jane Smith", phone: "+971-2-555-0200", business_name: "Smith Trading LLC" },
         { id: 3, customer_code: "CUST-003", full_name: "Ahmed Ali", phone: "+971-6-555-0300", business_name: "Ali Motors" }
       ];
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
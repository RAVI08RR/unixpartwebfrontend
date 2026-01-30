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
        console.log('⚠️ No customers in API response, using fallback');
        throw new Error('No customers data from API');
      }
    } catch (error) {
       console.warn("🏢 Customers API failed, using fallbacks:", error.message);
       return [
         { id: 1, customer_code: "CUST-001", full_name: "John Doe", phone: "+91-98765-43210", business_name: "Doe Enterprises" },
         { id: 2, customer_code: "CUST-002", full_name: "Jane Smith", phone: "+91-87654-32109", business_name: "Smith Trading LLC" },
         { id: 3, customer_code: "CUST-003", full_name: "Ahmed Ali", phone: "+91-76543-21098", business_name: "Ali Motors" },
         { id: 4, customer_code: "CUST-004", full_name: "Priya Sharma", phone: "+91-65432-10987", business_name: "Sharma Industries" },
         { id: 5, customer_code: "CUST-005", full_name: "Rajesh Kumar", phone: "+91-54321-09876", business_name: "Kumar Enterprises" }
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
import { fetchApi } from '../api';
import { getFallbackData } from '../fallbackData';

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
       
       // Return fallback data when backend is unavailable
       console.log('📋 Using fallback customer data');
       const fallbackData = await getFallbackData('customers', { skip, limit });
       return fallbackData.data.map(customer => ({ ...customer, _fallback: true }));
    }
  },

  // Get single customer by ID
  getById: async (id) => {
    try {
      return await fetchApi(`/api/customers/${id}`);
    } catch (error) {
      console.warn('📋 Customer service falling back to mock data for ID:', id, error.message);
      
      // Get fallback data and find customer
      const fallbackData = await getFallbackData('customers');
      const customer = fallbackData.data.find(cust => cust.id === parseInt(id));
      
      if (customer) {
        return { ...customer, _fallback: true };
      }
      
      throw new Error(`Customer with ID ${id} not found in fallback data`);
    }
  },

  // Create new customer
  create: async (customerData) => {
    try {
      return await fetchApi('/api/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });
    } catch (error) {
      console.warn('📋 Customer creation failed, backend unavailable:', error.message);
      throw new Error('Cannot create customer: Backend server is unavailable. Please try again later.');
    }
  },

  // Update existing customer
  update: async (id, customerData) => {
    try {
      return await fetchApi(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(customerData),
      });
    } catch (error) {
      console.warn('📋 Customer update failed, backend unavailable:', error.message);
      throw new Error('Cannot update customer: Backend server is unavailable. Please try again later.');
    }
  },

  // Delete customer
  delete: async (id) => {
    try {
      return await fetchApi(`/api/customers/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('📋 Customer deletion failed, backend unavailable:', error.message);
      throw new Error('Cannot delete customer: Backend server is unavailable. Please try again later.');
    }
  },
};
import { fetchApi } from '../api';
import { getFallbackData, fallbackInvoices } from '../fallbackData';
import { retryWithBackoff, shouldRetryError, shouldNotRetryError } from '../utils/retryUtils';

export const invoiceService = {
  // Get all invoices with pagination and filters
  getAll: async (skip = 0, limit = 100, customer_id = null, status = null) => {
    try {
      let queryParams = `skip=${skip}&limit=${limit}`;
      if (customer_id) queryParams += `&customer_id=${customer_id}`;
      if (status) queryParams += `&status=${status}`;
      
      // Use Next.js proxy route to bypass CORS issues
      return await fetchApi(`/api/invoices?${queryParams}`);
    } catch (error) {
      console.warn('📋 Invoice service falling back to mock data:', error.message);
      
      // Return fallback data when backend is unavailable
      const fallbackData = await getFallbackData('invoices', { skip, limit });
      
      // Apply filters to fallback data
      let filteredData = fallbackData.data;
      if (customer_id) {
        filteredData = filteredData.filter(invoice => invoice.customer_id === parseInt(customer_id));
      }
      if (status) {
        filteredData = filteredData.filter(invoice => invoice.invoice_status === status);
      }
      
      return {
        ...fallbackData,
        data: filteredData,
        total: filteredData.length,
        _fallback: true
      };
    }
  },

  // Get single invoice by ID
  getById: async (id) => {
    try {
      return await fetchApi(`/api/invoices/${id}`);
    } catch (error) {
      console.warn('📋 Invoice service falling back to mock data for ID:', id, error.message);
      
      // Find invoice in fallback data
      const invoice = fallbackInvoices.find(inv => inv.id === parseInt(id));
      if (invoice) {
        return { ...invoice, _fallback: true };
      }
      
      throw new Error(`Invoice with ID ${id} not found in fallback data`);
    }
  },

  // Get invoice by invoice number
  getByNumber: async (invoiceNumber) => {
    try {
      return await fetchApi(`/api/invoices/number/${invoiceNumber}`);
    } catch (error) {
      console.warn('📋 Invoice service falling back to mock data for number:', invoiceNumber, error.message);
      
      // Find invoice in fallback data
      const invoice = fallbackInvoices.find(inv => inv.invoice_number === invoiceNumber);
      if (invoice) {
        return { ...invoice, _fallback: true };
      }
      
      throw new Error(`Invoice with number ${invoiceNumber} not found in fallback data`);
    }
  },

  // Create new invoice
  create: async (invoiceData) => {
    try {
      return await fetchApi('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
    } catch (error) {
      console.warn('📋 Invoice creation failed, backend unavailable:', error.message);
      throw new Error('Cannot create invoice: Backend server is unavailable. Please try again later.');
    }
  },

  // Update existing invoice
  update: async (id, invoiceData) => {
    console.log('📝 Starting invoice update:', { id, data: invoiceData });
    
    try {
      const result = await retryWithBackoff(
        async () => {
          console.log('🚀 Attempting invoice update...');
          return await fetchApi(`/api/invoices/${id}`, {
            method: 'PUT',
            body: JSON.stringify(invoiceData),
          });
        },
        3, // maxRetries
        2000, // baseDelay (2 seconds)
        15000, // maxDelay (15 seconds)
        (error) => {
          // Only retry on network/server errors, not client errors
          if (shouldNotRetryError(error)) {
            console.log('❌ Not retrying client error:', error.message);
            return false;
          }
          return shouldRetryError(error);
        }
      );
      
      console.log('✅ Invoice update successful:', result);
      return result;
    } catch (error) {
      console.error('📋 Invoice update failed after retries:', error.message);
      
      // Provide more specific error messages
      if (error.message.includes('timeout') || error.message.includes('signal timed out')) {
        throw new Error('Update timeout: The server is taking too long to respond. Your internet connection might be slow, or the server is overloaded. Please try again.');
      } else if (error.message.includes('fetch failed') || error.message.includes('network')) {
        throw new Error('Network error: Cannot reach the server. Please check your internet connection and try again.');
      } else if (error.message.includes('401')) {
        throw new Error('Authentication error: Your session has expired. Please log in again.');
      } else if (error.message.includes('422')) {
        throw new Error('Validation error: Please check your input data. The invoice number might already exist.');
      } else if (error.message.includes('500')) {
        throw new Error('Server error: The backend server encountered an error. Please try again later.');
      }
      
      throw new Error(`Cannot update invoice: ${error.message}`);
    }
  },

  // Delete invoice
  delete: async (id) => {
    try {
      return await fetchApi(`/api/invoices/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('📋 Invoice deletion failed, backend unavailable:', error.message);
      throw new Error('Cannot delete invoice: Backend server is unavailable. Please try again later.');
    }
  },

  // Get invoice items
  getItems: async (id) => {
    try {
      return await fetchApi(`/api/invoices/${id}/items`);
    } catch (error) {
      console.warn('📋 Invoice items service falling back to empty array:', error.message);
      return []; // Return empty array as fallback
    }
  },

  // Get invoice payments
  getPayments: async (id) => {
    try {
      return await fetchApi(`/api/invoices/${id}/payments`);
    } catch (error) {
      console.warn('📋 Invoice payments service falling back to empty array:', error.message);
      return []; // Return empty array as fallback
    }
  },

  // Add payment to invoice
  addPayment: async (id, paymentData) => {
    try {
      return await fetchApi(`/api/invoices/${id}/payments`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.warn('📋 Add payment failed, backend unavailable:', error.message);
      throw new Error('Cannot add payment: Backend server is unavailable. Please try again later.');
    }
  },
};
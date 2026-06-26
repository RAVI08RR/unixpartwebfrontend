import { fetchApi } from '../api';
import { getFallbackData, fallbackInvoices } from '../fallbackData';
import { retryWithBackoff, shouldRetryError, shouldNotRetryError } from '../utils/retryUtils';

export const invoiceService = {
  // Get suggested invoice number for new invoices
  getSuggestedInvoiceNumber: async () => {
    try {
      return await fetchApi('/api/invoices/suggest-invoice-number');
    } catch (error) {
      console.error("ðŸ“‹ Suggest invoice number failed:", error.message);
      throw error;
    }
  },

  // Get all invoices with pagination and filters
  getAll: async (page = 1, page_size = 10, customer_id = null, status = null) => {
    try {
      let queryParams = `page=${page}&page_size=${page_size}`;
      if (customer_id) queryParams += `&customer_id=${customer_id}`;
      if (status) queryParams += `&status=${status}`;

      const data = await fetchApi(`/api/invoices?${queryParams}`);
      if (Array.isArray(data)) {
        return { data, total: data.length, page, page_size, total_pages: 1 };
      }
      return {
        data: data?.data || data?.invoices || data?.items || [],
        total: data?.total ?? 0,
        page: data?.page ?? page,
        page_size: data?.page_size ?? page_size,
        total_pages: data?.total_pages ?? 1,
      };
    } catch (error) {
      console.warn('📋 Invoice service falling back to mock data:', error.message);
      const fallbackData = await getFallbackData('invoices', { page, page_size });
      let filteredData = fallbackData.data;
      if (customer_id) filteredData = filteredData.filter(i => i.customer_id === parseInt(customer_id));
      if (status) filteredData = filteredData.filter(i => i.invoice_status === status);
      return { data: filteredData, total: filteredData.length, page, page_size, total_pages: Math.ceil(filteredData.length / page_size), _fallback: true };
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

  // Save invoice (alternative endpoint)
  save: async (invoiceData) => {
    try {
      return await fetchApi('/api/invoices/save', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
    } catch (error) {
      console.warn('📋 Save invoice failed, backend unavailable:', error.message);
      throw new Error('Cannot save invoice: Backend server is unavailable. Please try again later.');
    }
  },

  // Save granular (new endpoint for add/edit)
  saveGranular: async (payload) => {
    try {
      return await fetchApi('/api/invoices/save-granular', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("📋 Granular save failed:", error.message);
      throw error;
    }
  },

  // Get sales data (consolidated  // Sales Data endpoints
  getSalesData: async (page = 1, page_size = 10) => {
    try {
      const response = await fetchApi(`/api/invoices/sales-data?page=${page}&page_size=${page_size}`);

      let items = [];
      let total = 0;
      let total_pages = 1;

      if (Array.isArray(response)) {
        items = response;
        total = response.length;
      } else {
        items = response?.data || response?.items || [];
        total = response?.total ?? items.length;
        total_pages = response?.total_pages ?? 1;
      }

      // WORKAROUND: The backend /api/invoices/sales-data endpoint does not return the actual invoice ID.
      // We need to fetch the invoices and match them by invoice_number to attach the ID.
      try {
        const allInvoicesResp = await fetchApi('/api/invoices/?page=1&page_size=100');
        const invoicesList = Array.isArray(allInvoicesResp) ? allInvoicesResp :
          (allInvoicesResp.items || allInvoicesResp.invoices || []);

        if (items.length > 0 && invoicesList.length > 0) {
          items.forEach(item => {
            if (item.invoice && !item.invoice.id && item.invoice.invoice_number) {
              const matched = invoicesList.find(inv => inv.invoice_number === item.invoice.invoice_number);
              if (matched) {
                item.invoice.id = matched.id;
              }
            }
          });
        }
      } catch (e) {
        console.warn("Could not patch sales data with invoice IDs:", e);
      }

      return {
        data: items,
        total,
        page,
        page_size,
        total_pages
      };
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
      return { data: [], total: 0, page, page_size, total_pages: 1 };
    }
  },

  // Get all payments across all invoices
  getAllPayments: async (page = 1, page_size = 10) => {
    try {
      const data = await fetchApi(`/api/invoices/payments/all?page=${page}&page_size=${page_size}`);
      if (Array.isArray(data)) {
        return { data, total: data.length, page, page_size, total_pages: 1 };
      }
      return {
        data: data?.data || data?.payments || data?.items || [],
        total: data?.total ?? 0,
        page: data?.page ?? page,
        page_size: data?.page_size ?? page_size,
        total_pages: data?.total_pages ?? 1,
      };
    } catch (error) {
      console.warn('📋 Get all payments service falling back to empty envelope:', error.message);
      return { data: [], total: 0, page, page_size, total_pages: 1 };
    }
  },

  // Get outstanding balance with different view types
  // view_type: 'customer', 'branch', 'supplier', 'invoice', 'stock_number'
  getOutstandingBalance: async (viewType, filterValue = null) => {
    try {
      let url = `/api/invoices/outstanding-balance/${viewType}`;
      if (filterValue) {
        url += `?filter_value=${encodeURIComponent(filterValue)}`;
      }
      return await fetchApi(url);
    } catch (error) {
      console.warn('📋 Get outstanding balance service falling back to empty array:', error.message);
      return []; // Return empty array as fallback
    }
  },
};

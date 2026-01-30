import { fetchApi } from '../api';

export const invoiceService = {
  // Get all invoices with pagination and filters
  getAll: async (skip = 0, limit = 100, customer_id = null, status = null) => {
    let queryParams = `skip=${skip}&limit=${limit}`;
    if (customer_id) queryParams += `&customer_id=${customer_id}`;
    if (status) queryParams += `&status=${status}`;
    
    // Use Next.js proxy route to bypass CORS issues
    return fetchApi(`/api/invoices?${queryParams}`);
  },

  // Get single invoice by ID
  getById: async (id) => {
    return fetchApi(`/api/invoices/${id}`);
  },

  // Get invoice by invoice number
  getByNumber: async (invoiceNumber) => {
    return fetchApi(`/api/invoices/number/${invoiceNumber}`);
  },

  // Create new invoice
  create: async (invoiceData) => {
    return fetchApi('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  },

  // Update existing invoice
  update: async (id, invoiceData) => {
    return fetchApi(`/api/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  },

  // Delete invoice
  delete: async (id) => {
    return fetchApi(`/api/invoices/${id}`, {
      method: 'DELETE',
    });
  },

  // Get invoice items
  getItems: async (id) => {
    return fetchApi(`/api/invoices/${id}/items`);
  },

  // Get invoice payments
  getPayments: async (id) => {
    return fetchApi(`/api/invoices/${id}/payments`);
  },

  // Add payment to invoice
  addPayment: async (id, paymentData) => {
    return fetchApi(`/api/invoices/${id}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },
};
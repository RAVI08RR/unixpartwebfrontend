import { fetchApi } from '../api';

export const refundItemsService = {
  getByInvoiceId: async (invoiceId) => {
    try {
      return await fetchApi(`/api/refund-items/invoice/${invoiceId}`);
    } catch (error) {
      console.warn('Refund items fetch failed:', error.message);
      return [];
    }
  },
  
  create: async (invoiceItemId, data) => {
    try {
      return await fetchApi(`/api/refund-items/invoice-item/${invoiceItemId}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Refund item create failed:', error.message);
      throw error;
    }
  },

  getAll: async () => {
    try {
      return await fetchApi(`/api/refund-items/`);
    } catch (error) {
      console.warn('Refund items fetch all failed:', error.message);
      return [];
    }
  }
};

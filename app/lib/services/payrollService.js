import { fetchApi } from '../api';

export const payrollService = {
  // Get all payrolls
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await fetchApi(`/api/payroll?skip=${skip}&limit=${limit}`);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error("Payroll API failed:", error.message);
      throw error;
    }
  },

  // Get payroll by ID
  getById: async (id) => {
    try {
      const response = await fetchApi(`/api/payroll/${id}`);
      
      if (response?.data && typeof response.data === 'object') {
        return response.data;
      }
      
      return response;
    } catch (error) {
      throw new Error(`Payroll with ID ${id} not found: ${error.message}`);
    }
  },

  // Prepare payroll
  prepare: async (payrollData) => {
    try {
      return await fetchApi('/api/payroll/prepare', {
        method: 'POST',
        body: JSON.stringify(payrollData),
      });
    } catch (error) {
      throw new Error('Cannot prepare payroll: ' + error.message);
    }
  },

  // Update payroll
  update: async (id, payrollData) => {
    try {
      return await fetchApi(`/api/payroll/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payrollData),
      });
    } catch (error) {
      throw new Error('Cannot update payroll: ' + error.message);
    }
  },

  // Calculate payroll
  calculate: async (id) => {
    try {
      return await fetchApi(`/api/payroll/${id}/calculate`, {
        method: 'POST',
      });
    } catch (error) {
      throw new Error('Cannot calculate payroll: ' + error.message);
    }
  },

  // Mark as paid
  markAsPaid: async (id) => {
    try {
      return await fetchApi(`/api/payroll/${id}/mark-paid`, {
        method: 'POST',
      });
    } catch (error) {
      throw new Error('Cannot mark payroll as paid: ' + error.message);
    }
  },

  // Get payroll summary
  getSummary: async () => {
    try {
      const response = await fetchApi('/api/payroll/summary');
      
      if (response?.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error("Payroll summary failed:", error.message);
      return null;
    }
  },
};

import { fetchApi } from '../api';

export const leaveService = {
  // Get all leaves
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await fetchApi(`/api/leaves?skip=${skip}&limit=${limit}`);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error("Leaves API failed:", error.message);
      throw error;
    }
  },

  // Get employee leaves
  getByEmployee: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/leaves/employee/${employeeId}`);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error("Employee leaves failed:", error.message);
      return [];
    }
  },

  // Submit leave
  submit: async (leaveData) => {
    try {
      return await fetchApi('/api/leaves', {
        method: 'POST',
        body: JSON.stringify(leaveData),
      });
    } catch (error) {
      throw new Error('Cannot submit leave: ' + error.message);
    }
  },

  // Update leave
  update: async (id, leaveData) => {
    try {
      return await fetchApi(`/api/leaves/${id}`, {
        method: 'PUT',
        body: JSON.stringify(leaveData),
      });
    } catch (error) {
      throw new Error('Cannot update leave: ' + error.message);
    }
  },

  // Approve leave
  approve: async (id, notes = '') => {
    try {
      return await fetchApi(`/api/leaves/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      });
    } catch (error) {
      throw new Error('Cannot approve leave: ' + error.message);
    }
  },

  // Reject leave
  reject: async (id, notes = '') => {
    try {
      return await fetchApi(`/api/leaves/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      });
    } catch (error) {
      throw new Error('Cannot reject leave: ' + error.message);
    }
  },

  // Get pending leaves
  getPending: async () => {
    try {
      const response = await fetchApi('/api/leaves/pending');
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error("Pending leaves failed:", error.message);
      return [];
    }
  },

  // Get leave balance
  getBalance: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/leaves/employee/${employeeId}/balance`);
      
      if (response?.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error("Leave balance failed:", error.message);
      return null;
    }
  },

  // Get leave by ID
  getById: async (id) => {
    try {
      const response = await fetchApi(`/api/leaves/${id}`);
      return response;
    } catch (error) {
      throw new Error(`Leave with ID ${id} not found: ${error.message}`);
    }
  },

  // Delete leave
  delete: async (id) => {
    try {
      return await fetchApi(`/api/leaves/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete leave: ' + error.message);
    }
  },
};

import { fetchApi } from '../api';

export const attendanceService = {
  // Get all attendance
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await fetchApi(`/api/attendance?skip=${skip}&limit=${limit}`);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error("Attendance API failed:", error.message);
      throw error;
    }
  },

  // Get employee attendance
  getByEmployee: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/attendance/employee/${employeeId}`);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error("Employee attendance failed:", error.message);
      return [];
    }
  },

  // Submit attendance
  submit: async (attendanceData) => {
    try {
      return await fetchApi('/api/attendance', {
        method: 'POST',
        body: JSON.stringify(attendanceData),
      });
    } catch (error) {
      throw new Error('Cannot submit attendance: ' + error.message);
    }
  },

  // Update attendance
  update: async (id, attendanceData) => {
    try {
      return await fetchApi(`/api/attendance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(attendanceData),
      });
    } catch (error) {
      throw new Error('Cannot update attendance: ' + error.message);
    }
  },

  // Approve attendance
  approve: async (id) => {
    try {
      return await fetchApi(`/api/attendance/${id}/approve`, {
        method: 'PUT',
      });
    } catch (error) {
      throw new Error('Cannot approve attendance: ' + error.message);
    }
  },

  // Get pending approvals (deprecated - calculate from attendance data instead)
  getPendingApprovals: async () => {
    try {
      const response = await fetchApi('/api/attendance/pending-approval');
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.warn('getPendingApprovals failed (deprecated method):', error.message);
      // Return empty array instead of throwing error
      return [];
    }
  },

  // Get attendance by ID
  getById: async (id) => {
    try {
      const response = await fetchApi(`/api/attendance/${id}`);
      
      if (response?.data && typeof response.data === 'object') {
        return response.data;
      }
      
      return response;
    } catch (error) {
      throw new Error(`Attendance with ID ${id} not found: ${error.message}`);
    }
  },

  // Delete attendance
  delete: async (id) => {
    try {
      return await fetchApi(`/api/attendance/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete attendance: ' + error.message);
    }
  },
};

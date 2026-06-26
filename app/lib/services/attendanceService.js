import { fetchApi } from '../api';

export const attendanceService = {
  // Get all attendance
  getAll: async (page = 1, page_size = 10) => {
    try {
      const data = await fetchApi(`/api/attendance?page=${page}&page_size=${page_size}`);
      if (Array.isArray(data)) return { data, total: data.length, page, page_size, total_pages: 1 };
      if (data?.data && Array.isArray(data.data)) {
        return { data: data.data, total: data.total ?? data.data.length, page: data.page ?? page, page_size: data.page_size ?? page_size, total_pages: data.total_pages ?? 1 };
      }
      return { data: [], total: 0, page, page_size, total_pages: 1 };
    } catch (error) {
      console.error('Attendance API failed:', error.message);
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
      console.log('🔍 Fetching attendance with ID:', id);
      const response = await fetchApi(`/api/attendance/${id}`);
      console.log('✅ Attendance response:', response);

      return response;
    } catch (error) {
      console.error('❌ Attendance fetch error:', error);
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

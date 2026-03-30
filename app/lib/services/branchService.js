import { fetchApi } from '../api';

export const branchService = {
  // Get all branches
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await fetchApi(`/api/branches?skip=${skip}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      throw error;
    }
  },

  // Get dropdown branches
  getDropdown: async () => {
    try {
      const data = await fetchApi('/api/dropdown/branches');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      // Silently handle permission errors (403) - these are expected when user lacks permissions
      if (error.message.includes('Not authorized') || error.message.includes('403')) {
        console.log("ℹ️ Branches dropdown: Using fallback data (permission restricted)");
        return [];
      }
      console.error("🏢 Branches Dropdown API failed, using fallback:", error.message);
      // Fallback to getAll if dropdown endpoint fails
      try {
        return await branchService.getAll(0, 100);
      } catch (fallbackError) {
        console.log("ℹ️ Branches fallback: Using empty array (permission restricted)");
        return [];
      }
    }
  },

  // Get branch by ID
  getById: async (id) => {
    try {
      const response = await fetchApi(`/api/branches/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch branch ${id}:`, error);
      throw error;
    }
  },

  // Create new branch
  create: async (branchData) => {
    try {
      const response = await fetchApi('/api/branches', {
        method: 'POST',
        body: JSON.stringify(branchData),
      });
      return response;
    } catch (error) {
      console.error('Failed to create branch:', error);
      throw error;
    }
  },

  // Update branch
  update: async (id, branchData) => {
    try {
      const response = await fetchApi(`/api/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(branchData),
      });
      return response;
    } catch (error) {
      console.error(`Failed to update branch ${id}:`, error);
      throw error;
    }
  },

  // Delete branch
  delete: async (id) => {
    try {
      const response = await fetchApi(`/api/branches/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Failed to delete branch ${id}:`, error);
      throw error;
    }
  }
};
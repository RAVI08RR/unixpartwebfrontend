import { fetchApi } from '../api';

export const branchService = {
  // Get all branches
  getAll: async (page = 1, page_size = 10) => {
    try {
      const data = await fetchApi(`/api/branches?page=${page}&page_size=${page_size}`);
      if (Array.isArray(data)) {
        return { data, total: data.length, page, page_size, total_pages: 1 };
      }
      return {
        data: data?.data || data?.branches || data?.items || [],
        total: data?.total ?? 0,
        page: data?.page ?? page,
        page_size: data?.page_size ?? page_size,
        total_pages: data?.total_pages ?? 1,
      };
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      return { data: [], total: 0, page, page_size, total_pages: 1 };
    }
  },

  // Get dropdown branches
  getDropdown: async () => {
    try {
      const data = await fetchApi('/api/dropdown/branches');
      console.log("🏢 Branch dropdown raw response:", data);

      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data?.branches && Array.isArray(data.branches)) {
        return data.branches;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    } catch (error) {
      // Silently handle permission errors (403) - these are expected when user lacks permissions
      if (error.message.includes('Not authorized') || error.message.includes('403')) {
        console.log("ℹ️ Branches dropdown: Using fallback data (permission restricted)");
        return [];
      }
      console.error("🏢 Branches Dropdown API failed, using fallback:", error.message);
      // Fallback to getAll if dropdown endpoint fails
      try {
        const allBranches = await branchService.getAll(1, 10);
        console.log("🏢 Fallback branches from getAll:", allBranches);

        // Handle different response formats from getAll
        if (Array.isArray(allBranches)) {
          return allBranches;
        } else if (allBranches?.branches && Array.isArray(allBranches.branches)) {
          return allBranches.branches;
        } else if (allBranches?.items && Array.isArray(allBranches.items)) {
          return allBranches.items;
        } else if (allBranches?.data && Array.isArray(allBranches.data)) {
          return allBranches.data;
        }

        return [];
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
import { fetchApi } from '../api';

export const branchService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const data = await fetchApi(`/api/branches?skip=${skip}&limit=${limit}`);
      return Array.isArray(data) ? data : (data?.branches || []);
    } catch (error) {
       console.warn("Branches API failed, using fallbacks:", error.message);
       return [
         { id: 1, branch_name: "Main Warehouse - Dubai" },
         { id: 2, branch_name: "Branch 1 - Abu Dhabi" }
       ];
    }
  },

  getById: async (id) => {
    return fetchApi(`/api/branches/${id}`);
  },

  create: async (branchData) => {
    return fetchApi('/api/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  },

  update: async (id, branchData) => {
    return fetchApi(`/api/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    });
  },

  delete: async (id) => {
    return fetchApi(`/api/branches/${id}`, {
      method: 'DELETE',
    });
  },
};

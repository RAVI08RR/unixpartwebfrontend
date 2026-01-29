import { fetchApi } from '../api';

export const roleService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      // Use Next.js proxy route to bypass CORS issues
      return await fetchApi(`/api/roles?skip=${skip}&limit=${limit}`);
    } catch (error) {
      console.warn("Roles API failed, using fallback roles:", error.message);
      return [
        { id: 1, name: "Administrator" },
        { id: 2, name: "Manager" },
        { id: 3, name: "Staff" }
      ];
    }
  },

  getById: async (id) => {
    return fetchApi(`/api/roles/${id}`);
  },

  create: async (roleData) => {
    return fetchApi('/api/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  },

  update: async (id, roleData) => {
    return fetchApi(`/api/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  },

  delete: async (id) => {
    return fetchApi(`/api/roles/${id}`, {
      method: 'DELETE',
    });
  },
};

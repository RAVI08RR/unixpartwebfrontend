import { apiClient } from '../api';

export const roleService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      return await apiClient.get('api/roles', { skip, limit });
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
    return apiClient.get(`api/roles/${id}`);
  },

  create: async (roleData) => {
    return apiClient.post('api/roles', roleData);
  },

  update: async (id, roleData) => {
    return apiClient.put(`api/roles/${id}`, roleData);
  },

  delete: async (id) => {
    return apiClient.delete(`api/roles/${id}`);
  },
};

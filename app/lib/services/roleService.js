import { apiClient } from '../api';

export const roleService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await apiClient.get('api/roles', { skip, limit });
      console.log('✅ Roles fetched successfully:', response);
      return response;
    } catch (error) {
      console.warn("Roles API failed or not found, using fallback roles:", error.message);
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
    console.log('🔄 Creating role:', roleData);
    return apiClient.post('api/roles', roleData);
  },

  update: async (id, roleData) => {
    console.log('🔄 Updating role:', { id, data: roleData });
    return apiClient.put(`api/roles/${id}`, roleData);
  },

  delete: async (id) => {
    console.log('🗑️ Deleting role:', id);
    return apiClient.delete(`api/roles/${id}`);
  },
};

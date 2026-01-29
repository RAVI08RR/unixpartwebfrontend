import { fetchApi } from '../api';

export const roleService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await fetchApi(`api/roles?skip=${skip}&limit=${limit}`);
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
    return fetchApi(`api/roles/${id}`);
  },

  create: async (roleData) => {
    console.log('🔄 Creating role:', roleData);
    return fetchApi('api/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  },

  update: async (id, roleData) => {
    console.log('🔄 Updating role:', { id, data: roleData });
    return fetchApi(`api/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  },

  delete: async (id) => {
    console.log('🗑️ Deleting role:', id);
    return fetchApi(`api/roles/${id}`, {
      method: 'DELETE',
    });
  },
};

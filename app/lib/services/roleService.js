import { fetchApi } from '../api';

export const roleService = {
  getAll: async (skip = 0, limit = 100) => {
    // Use Next.js proxy route to bypass CORS issues
    return await fetchApi(`/api/roles?skip=${skip}&limit=${limit}`);
  },

  getById: async (id) => {
    return fetchApi(`/api/roles/${id}`);
  },

  getBySlug: async (slug) => {
    return fetchApi(`/api/roles/slug/${slug}`);
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

  getPermissions: async (roleId) => {
    try {
      console.log('🔍 roleService.getPermissions called with:', { roleId, type: typeof roleId });
      
      // Validate roleId before making the API call
      if (!roleId || isNaN(parseInt(roleId))) {
        console.error('❌ Invalid roleId passed to getPermissions:', roleId);
        return [];
      }
      
      const numericRoleId = parseInt(roleId);
      console.log('📡 Making API call to:', `/api/roles/${numericRoleId}/permissions`);
      
      return await fetchApi(`/api/roles/${numericRoleId}/permissions`);
    } catch (error) {
      console.warn("Role permissions API failed:", error.message);
      return [];
    }
  },

  assignPermission: async (roleId, permissionId) => {
    return fetchApi(`/api/roles/${roleId}/permissions/${permissionId}`, {
      method: 'POST',
    });
  },

  removePermission: async (roleId, permissionId) => {
    return fetchApi(`/api/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  },
};

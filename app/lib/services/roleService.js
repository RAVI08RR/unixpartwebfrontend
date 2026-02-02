import { fetchApi } from '../api';

export const roleService = {
  getAll: async (skip = 0, limit = 100) => {
    // Use Next.js proxy route to bypass CORS issues
    return await fetchApi(`/api/roles?skip=${skip}&limit=${limit}`);
  },

  getById: async (id) => {
    try {
      console.log('🚀 roleService.getById called with:', { id, type: typeof id });
      const result = await fetchApi(`/api/roles/${id}`);
      console.log('✅ roleService.getById successful:', result);
      return result;
    } catch (error) {
      console.error('❌ roleService.getById failed:', error);
      throw error;
    }
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
    try {
      console.log('🚀 roleService.update called with:', { id, roleData });
      const result = await fetchApi(`/api/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(roleData),
      });
      console.log('✅ roleService.update successful:', result);
      return result;
    } catch (error) {
      console.error('❌ roleService.update failed:', error);
      throw error;
    }
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

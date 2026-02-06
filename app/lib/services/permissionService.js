import { fetchApi } from '../api';

export const permissionService = {
  // Get all permissions
  getAll: async () => {
    return fetchApi('/api/permissions');
  },

  // Get single permission by ID
  getById: async (id) => {
    return fetchApi(`/api/permissions/${id}`);
  },

  // Get permissions by module
  getByModule: async (module) => {
    return fetchApi(`/api/permissions/module/${module}`);
  },

  // Get permission by slug
  getBySlug: async (slug) => {
    return fetchApi(`/api/permissions/slug/${slug}`);
  },

  // Create new permission
  create: async (permissionData) => {
    return fetchApi('/api/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  },

  // Update existing permission
  update: async (id, permissionData) => {
    return fetchApi(`/api/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  },

  // Delete permission
  delete: async (id) => {
    return fetchApi(`/api/permissions/${id}`, {
      method: 'DELETE',
    });
  },
};
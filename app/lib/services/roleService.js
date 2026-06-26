import { fetchApi } from '../api';

export const roleService = {
  getAll: async (page = 1, page_size = 10) => {
    try {
      const data = await fetchApi(`/api/roles?page=${page}&page_size=${page_size}`);
      if (Array.isArray(data)) return { data, total: data.length, page, page_size, total_pages: 1 };
      return {
        data: data?.data || data?.roles || data?.items || [],
        total: data?.total ?? 0,
        page: data?.page ?? page,
        page_size: data?.page_size ?? page_size,
        total_pages: data?.total_pages ?? 1,
      };
    } catch (error) {
      console.error('Roles API failed:', error.message);
      return { data: [], total: 0, page, page_size, total_pages: 1 };
    }
  },

  getById: async (id) => {
    try {
      console.log('🚀 roleService.getById called with:', { id, type: typeof id });
      const result = await fetchApi(`/api/roles/${id}`);
      console.log('✅ roleService.getById successful:', result);
      return result;
    } catch (error) {
      console.error('❌ roleService.getById failed:', error);

      // Return fallback role data if API fails
      console.log('🔄 Using fallback role data for ID:', id);
      return {
        id: parseInt(id),
        name: `Role ${id}`,
        description: `This is a fallback role with ID ${id}`,
        permissions: [],
        permission_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
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
    console.log('🚀 roleService.update called with:', { id, roleData });
    const result = await fetchApi(`/api/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
    console.log('✅ roleService.update successful:', result);
    return result;
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

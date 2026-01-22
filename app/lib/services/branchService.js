import { fetchApi } from '../api';

export const branchService = {
  getAll: async (skip = 0, limit = 100) => {
    return fetchApi(`/api/branches/?skip=${skip}&limit=${limit}`);
  },

  getById: async (id) => {
    return fetchApi(`/api/branches/${id}`);
  },

  create: async (branchData) => {
    return fetchApi('/api/branches/', {
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

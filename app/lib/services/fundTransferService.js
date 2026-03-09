import { fetchApi } from '../api';

export const fundTransferService = {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/fund-transfers${queryString ? `?${queryString}` : ''}`;
    return fetchApi(url);
  },

  async getById(id) {
    return fetchApi(`/api/fund-transfers/${id}`);
  },

  async create(transferData) {
    return fetchApi('/api/fund-transfers', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  },

  async update(id, transferData) {
    return fetchApi(`/api/fund-transfers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transferData),
    });
  },

  async delete(id) {
    return fetchApi(`/api/fund-transfers/${id}`, {
      method: 'DELETE',
    });
  },
};

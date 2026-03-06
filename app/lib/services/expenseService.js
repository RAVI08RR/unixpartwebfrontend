import { fetchApi } from '../api';

export const expenseService = {
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/expenses${queryString ? `?${queryString}` : ''}`;
    return fetchApi(url);
  },

  async getById(id) {
    return fetchApi(`/api/expenses/${id}`);
  },

  async create(expenseData) {
    return fetchApi('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  async update(id, expenseData) {
    return fetchApi(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  async delete(id) {
    return fetchApi(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

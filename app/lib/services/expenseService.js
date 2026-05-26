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
    const isFormData = expenseData instanceof FormData;
    return fetchApi('/api/expenses', {
      method: 'POST',
      body: isFormData ? expenseData : JSON.stringify(expenseData),
    });
  },

  async update(id, expenseData) {
    const isFormData = expenseData instanceof FormData;
    return fetchApi(`/api/expenses/${id}`, {
      method: 'PUT',
      body: isFormData ? expenseData : JSON.stringify(expenseData),
    });
  },

  async delete(id) {
    return fetchApi(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

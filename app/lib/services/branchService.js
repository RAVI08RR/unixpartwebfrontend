import { fetchApi } from '../api';

export const branchService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      console.log('🏢 Fetching branches from API...');
      const data = await fetchApi(`/api/branches/?skip=${skip}&limit=${limit}`);
      console.log('🏢 Branches API response:', data);
      
      const branchesData = Array.isArray(data) ? data : (data?.branches || []);
      
      if (branchesData.length > 0) {
        console.log('✅ Branches fetched successfully:', branchesData.length);
        return branchesData;
      } else {
        console.log('⚠️ No branches in API response, using fallback');
        throw new Error('No branches data from API');
      }
    } catch (error) {
       console.warn("🏢 Branches API failed, using fallbacks:", error.message);
       return [
         { id: 1, branch_name: "Main Warehouse - Dubai", branch_code: "DXB" },
         { id: 2, branch_name: "Branch 1 - Abu Dhabi", branch_code: "AUH" },
         { id: 3, branch_name: "Sharjah Branch", branch_code: "SHJ" }
       ];
    }
  },

  getById: async (id) => {
    return fetchApi(`/api/branches/${id}/`);
  },

  create: async (branchData) => {
    return fetchApi('/api/branches/', {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  },

  update: async (id, branchData) => {
    return fetchApi(`/api/branches/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    });
  },

  delete: async (id) => {
    return fetchApi(`/api/branches/${id}/`, {
      method: 'DELETE',
    });
  },
};

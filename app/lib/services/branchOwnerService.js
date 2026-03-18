import { fetchApi } from '../api';

export const branchOwnerService = {
  // Get all branch owners
  getAll: async (skip = 0, limit = 100) => {
    try {
      const data = await fetchApi(`/api/branch-owners?skip=${skip}&limit=${limit}`);
      return Array.isArray(data) ? data : (data?.branch_owners || []);
    } catch (error) {
      console.error("Branch owners API failed:", error.message);
      return [];
    }
  },

  // Get branch owner by ID
  getById: async (id) => {
    try {
      return await fetchApi(`/api/branch-owners/${id}`);
    } catch (error) {
      throw new Error(`Branch owner with ID ${id} not found`);
    }
  },

  // Get branch ownership summary
  getBranchSummary: async (branchId) => {
    try {
      return await fetchApi(`/api/branch-owners/branch/${branchId}/summary`);
    } catch (error) {
      console.error("Branch ownership summary failed:", error.message);
      return null;
    }
  },

  // Create new branch owner
  create: async (branchOwnerData) => {
    try {
      // Ensure the data matches backend schema
      const payload = {
        branch_id: branchOwnerData.branch_id,
        supplier_id: branchOwnerData.supplier_id,
        share_percent: branchOwnerData.share_percent || branchOwnerData.ownership_percentage || 0,
        share_amount: branchOwnerData.share_amount || 0,
      };
      
      return await fetchApi('/api/branch-owners', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      throw new Error('Cannot create branch owner: ' + error.message);
    }
  },

  // Update branch owner
  update: async (id, branchOwnerData) => {
    try {
      // Ensure the data matches backend schema
      const payload = {
        branch_id: branchOwnerData.branch_id,
        supplier_id: branchOwnerData.supplier_id,
        share_percent: branchOwnerData.share_percent || branchOwnerData.ownership_percentage || 0,
        share_amount: branchOwnerData.share_amount || 0,
      };
      
      return await fetchApi(`/api/branch-owners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      throw new Error('Cannot update branch owner: ' + error.message);
    }
  },

  // Delete branch owner
  delete: async (id) => {
    try {
      return await fetchApi(`/api/branch-owners/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete branch owner: ' + error.message);
    }
  },
};

import { fetchApi } from '../api';

export const branchOwnerService = {
  // Get all branch owners
  getAll: async (page = 1, page_size = 10) => {
    try {
      const data = await fetchApi(`/api/branch-owners?page=${page}&page_size=${page_size}`);
      if (Array.isArray(data)) return { data, total: data.length, page, page_size, total_pages: 1 };
      return {
        data: data?.data || data?.branch_owners || data?.items || [],
        total: data?.total ?? 0,
        page: data?.page ?? page,
        page_size: data?.page_size ?? page_size,
        total_pages: data?.total_pages ?? 1,
      };
    } catch (error) {
      console.error('Branch owners API failed:', error.message);
      return { data: [], total: 0, page, page_size, total_pages: 1 };
    }
  },

  // Get branch owner by ID
  getById: async (id) => {
    try {
      const response = await fetchApi(`/api/branch-owners/${id}`);

      // Handle nested data structure: { success: true, message: "...", data: {...} }
      if (response?.data && typeof response.data === 'object') {
        return response.data;
      }

      // Direct response
      return response;
    } catch (error) {
      throw new Error(`Branch owner with ID ${id} not found: ${error.message}`);
    }
  },

  // Get branch ownership summary
  getBranchSummary: async (branchId) => {
    try {
      const response = await fetchApi(`/api/branch-owners/branch/${branchId}/summary`);

      // Handle nested data structure
      if (response?.data) {
        return response.data;
      }

      return response;
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

  // Bulk create branch owners (send array)
  bulkCreate: async (branchOwnersArray) => {
    try {
      // Ensure all items have the correct field names
      const payload = branchOwnersArray.map(owner => ({
        branch_id: owner.branch_id,
        supplier_id: owner.supplier_id,
        share_percent: owner.share_percent || 0,
        share_amount: owner.share_amount || 0,
      }));

      console.log('Bulk creating branch owners:', payload);

      return await fetchApi('/api/branch-owners/bulk', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      throw new Error('Cannot bulk create branch owners: ' + error.message);
    }
  },

  // Save branch owners (alternative endpoint)
  save: async (branchOwnerData) => {
    try {
      const payload = {
        branch_id: branchOwnerData.branch_id,
        supplier_id: branchOwnerData.supplier_id,
        share_percent: branchOwnerData.share_percent || 0,
        share_amount: branchOwnerData.share_amount || 0,
      };

      return await fetchApi('/api/branch-owners/save', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      throw new Error('Cannot save branch owner: ' + error.message);
    }
  },
};

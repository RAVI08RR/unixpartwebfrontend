import { fetchApi } from '../api';

export const customerBranchService = {
  // Get deactivated branches for a customer
  getDeactivatedBranches: async (customerId) => {
    try {
      const response = await fetchApi(`/api/customer-branches/deactivated/${customerId}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch deactivated branches for customer ${customerId}:`, error);
      throw error;
    }
  },

  // Bulk update branch activation status
  bulkActivation: async (customerId, activateBranchIds = [], deactivateBranchIds = []) => {
    try {
      const response = await fetchApi('/api/customer-branches/bulk-activation', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: parseInt(customerId),
          activate_branch_ids: activateBranchIds.map(id => parseInt(id)),
          deactivate_branch_ids: deactivateBranchIds.map(id => parseInt(id))
        }),
      });
      return response;
    } catch (error) {
      console.error('Failed to bulk update branch activations:', error);
      throw error;
    }
  },

  // Get all customer branch credits
  getAllCredits: async (customerId = null) => {
    try {
      const queryParams = customerId ? `?customer_id=${customerId}` : '';
      const response = await fetchApi(`/api/customer-branches/credits${queryParams}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch customer branch credits:', error);
      throw error;
    }
  },

  // Create customer branch credit
  createCredit: async (creditData) => {
    try {
      const response = await fetchApi('/api/customer-branches/credits', {
        method: 'POST',
        body: JSON.stringify(creditData),
      });
      return response;
    } catch (error) {
      console.error('Failed to create customer branch credit:', error);
      throw error;
    }
  },

  // Get single customer branch credit
  getCredit: async (creditId) => {
    try {
      const response = await fetchApi(`/api/customer-branches/credits/${creditId}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch customer branch credit ${creditId}:`, error);
      throw error;
    }
  },

  // Update customer branch credit
  updateCredit: async (creditId, creditData) => {
    try {
      const response = await fetchApi(`/api/customer-branches/credits/${creditId}`, {
        method: 'PUT',
        body: JSON.stringify(creditData),
      });
      return response;
    } catch (error) {
      console.error(`Failed to update customer branch credit ${creditId}:`, error);
      throw error;
    }
  },

  // Delete customer branch credit
  deleteCredit: async (creditId) => {
    try {
      const response = await fetchApi(`/api/customer-branches/credits/${creditId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Failed to delete customer branch credit ${creditId}:`, error);
      throw error;
    }
  },

  // Bulk create/update credits for a customer
  bulkUpdateCredits: async (customerId, credits) => {
    try {
      // Get existing credits for this customer
      const existingCredits = await customerBranchService.getAllCredits(customerId);
      
      const operations = [];
      
      // Process each credit
      for (const credit of credits) {
        const existing = existingCredits.find(
          ec => ec.customer_id === customerId && ec.branch_id === credit.branch_id
        );
        
        if (existing) {
          // Update existing credit
          operations.push(
            customerBranchService.updateCredit(existing.id, {
              customer_id: customerId,
              branch_id: credit.branch_id,
              credit_limit: credit.credit_limit
            })
          );
        } else {
          // Create new credit
          operations.push(
            customerBranchService.createCredit({
              customer_id: customerId,
              branch_id: credit.branch_id,
              credit_limit: credit.credit_limit
            })
          );
        }
      }
      
      // Execute all operations
      const results = await Promise.all(operations);
      return results;
    } catch (error) {
      console.error('Failed to bulk update credits:', error);
      throw error;
    }
  }
};

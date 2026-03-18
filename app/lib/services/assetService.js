import { fetchApi } from '../api';

export const assetService = {
  // Get all assets
  getAll: async (skip = 0, limit = 100, status = null, branch_id = null) => {
    let queryParams = `skip=${skip}&limit=${limit}`;
    if (status) queryParams += `&status=${status}`;
    if (branch_id) queryParams += `&branch_id=${branch_id}`;
    
    try {
      const data = await fetchApi(`/api/assets?${queryParams}`);
      return Array.isArray(data) ? data : (data?.assets || []);
    } catch (error) {
      console.error("Assets API failed:", error.message);
      return [];
    }
  },

  // Get asset by ID
  getById: async (id) => {
    try {
      return await fetchApi(`/api/assets/${id}`);
    } catch (error) {
      throw new Error(`Asset with ID ${id} not found`);
    }
  },

  // Get asset by asset_id string
  getByAssetId: async (assetId) => {
    try {
      return await fetchApi(`/api/assets/by-asset-id/${assetId}`);
    } catch (error) {
      throw new Error(`Asset with Asset ID ${assetId} not found`);
    }
  },

  // Create new asset
  create: async (assetData) => {
    try {
      return await fetchApi('/api/assets', {
        method: 'POST',
        body: JSON.stringify(assetData),
      });
    } catch (error) {
      throw new Error('Cannot create asset: ' + error.message);
    }
  },

  // Update asset
  update: async (id, assetData) => {
    try {
      return await fetchApi(`/api/assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(assetData),
      });
    } catch (error) {
      throw new Error('Cannot update asset: ' + error.message);
    }
  },

  // Delete asset
  delete: async (id) => {
    try {
      return await fetchApi(`/api/assets/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete asset: ' + error.message);
    }
  },

  // Transfer asset
  transfer: async (id, transferData) => {
    try {
      return await fetchApi(`/api/assets/${id}/transfer`, {
        method: 'POST',
        body: JSON.stringify(transferData),
      });
    } catch (error) {
      throw new Error('Cannot transfer asset: ' + error.message);
    }
  },

  // Sell asset
  sell: async (id, saleData) => {
    try {
      return await fetchApi(`/api/assets/${id}/sell`, {
        method: 'POST',
        body: JSON.stringify(saleData),
      });
    } catch (error) {
      throw new Error('Cannot sell asset: ' + error.message);
    }
  },

  // Get asset sale details
  getSaleDetails: async (id) => {
    try {
      return await fetchApi(`/api/assets/${id}/sale`);
    } catch (error) {
      return null;
    }
  },

  // Get all asset sales
  getAllSales: async () => {
    try {
      const data = await fetchApi('/api/assets/sales/all');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  // Update ownership
  updateOwnership: async (id, ownershipData) => {
    try {
      return await fetchApi(`/api/assets/${id}/ownership`, {
        method: 'PUT',
        body: JSON.stringify(ownershipData),
      });
    } catch (error) {
      throw new Error('Cannot update ownership: ' + error.message);
    }
  },

  // Get ownership history
  getOwnershipHistory: async (id) => {
    try {
      const data = await fetchApi(`/api/assets/${id}/ownership-history`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  // Get transfer history
  getTransferHistory: async (id) => {
    try {
      const data = await fetchApi(`/api/assets/${id}/transfer-history`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  // Get documents
  getDocuments: async (assetId) => {
    try {
      return await fetchApi(`/api/assets/${assetId}/documents`);
    } catch (error) {
      return [];
    }
  },

  // Upload document
  uploadDocument: async (assetId, file, documentName) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_name', documentName);
      formData.append('document_type', documentName); // Some backends might expect this

      const token = localStorage.getItem('access_token');
      
      // Try the /upload endpoint first (as per API docs)
      let response = await fetch(`/api/assets/${assetId}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      // If that fails with 404, try the regular documents endpoint
      if (response.status === 404) {
        console.log('Upload endpoint not found, trying documents endpoint');
        response = await fetch(`/api/assets/${assetId}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        console.error('Response status:', response.status);
        throw new Error(errorText || 'Upload failed');
      }
      
      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch {
        return responseText;
      }
    } catch (error) {
      console.error('Upload document error:', error);
      throw new Error('Cannot upload document: ' + error.message);
    }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    try {
      return await fetchApi(`/api/assets/documents/${documentId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete document: ' + error.message);
    }
  },

  // Download document
  downloadDocument: async (assetId, documentId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/assets/${assetId}/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'document';
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Cannot download document: ' + error.message);
    }
  },
};

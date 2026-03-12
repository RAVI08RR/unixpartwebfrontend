import { fetchApi } from '../api';

export const purchaseOrderService = {
  // Get all purchase orders
  getAll: async (skip = 0, limit = 100) => {
    try {
      const data = await fetchApi(`/api/purchase-orders/?skip=${skip}&limit=${limit}`);
      // Return direct array or check for common wrapper keys
      return Array.isArray(data) ? data : (data?.purchase_orders || data?.items || []);
    } catch (error) {
      console.error("📦 PO API failed:", error.message);
      return [];
    }
  },

  // Get single PO by ID
  getById: async (id) => {
    try {
      return await fetchApi(`/api/purchase-orders/${id}`);
    } catch (error) {
      throw new Error(`Purchase Order with ID ${id} not found`);
    }
  },

  // Get PO by string ID (po_id_str)
  getByPoIdStr: async (poIdStr) => {
    try {
      return await fetchApi(`/api/purchase-orders/po/${poIdStr}`);
    } catch (error) {
      throw new Error(`Purchase Order ${poIdStr} not found`);
    }
  },

  // Create new PO
  create: async (poData) => {
    try {
      return await fetchApi('/api/purchase-orders/', {
        method: 'POST',
        body: JSON.stringify(poData),
      });
    } catch (error) {
      throw new Error('Cannot create Purchase Order: ' + error.message);
    }
  },

  // Update existing PO
  update: async (id, poData) => {
    try {
      return await fetchApi(`/api/purchase-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(poData),
      });
    } catch (error) {
      throw new Error('Cannot update Purchase Order: ' + error.message);
    }
  },

  // Delete PO
  delete: async (id) => {
    try {
      return await fetchApi(`/api/purchase-orders/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete Purchase Order: ' + error.message);
    }
  },

  // Get PO items
  getItems: async (id) => {
    try {
      return await fetchApi(`/api/purchase-orders/${id}/items`);
    } catch (error) {
      return [];
    }
  },

  // Get PO documents
  getDocuments: async (id) => {
    try {
      return await fetchApi(`/api/purchase-orders/${id}/documents`);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      return [];
    }
  },

  // Upload document
  uploadDocument: async (id, file, documentName) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_name', documentName);

        const token = localStorage.getItem('token');

        // Use Next.js API proxy route
        const response = await fetch(`/api/purchase-orders/${id}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || errorData.error || 'Failed to upload document');
        }

        return await response.json();
      } catch (error) {
        throw new Error('Cannot upload document: ' + error.message);
      }
    },

  // Download document
  downloadDocument: async (poId, documentId) => {
      try {
        const token = localStorage.getItem('token');

        // Use Next.js API proxy route
        const response = await fetch(`/api/purchase-orders/${poId}/documents/${documentId}/download`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to download document');
        }

        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'document';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch) filename = filenameMatch[1];
        }

        const blob = await response.blob();
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

  // Delete document
  deleteDocument: async (poId, documentId) => {
    try {
      return await fetchApi(`/api/purchase-orders/${poId}/documents/${documentId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete document: ' + error.message);
    }
  }
};

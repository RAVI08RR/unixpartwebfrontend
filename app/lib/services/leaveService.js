import { fetchApi } from '../api';

export const leaveService = {
  // Get all leaves
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await fetchApi(`/api/leaves?skip=${skip}&limit=${limit}`);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error("Leaves API failed:", error.message);
      throw error;
    }
  },

  // Get employee leaves
  getByEmployee: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/leaves/employee/${employeeId}`);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error("Employee leaves failed:", error.message);
      return [];
    }
  },

  // Submit leave
  submit: async (leaveData) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const isFormData = leaveData instanceof FormData;
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch('/api/leaves/', {
        method: 'POST',
        headers,
        body: isFormData ? leaveData : JSON.stringify(leaveData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit leave');
      }

      return await response.json();
    } catch (error) {
      throw new Error('Cannot submit leave: ' + error.message);
    }
  },

  // Update leave
  update: async (id, leaveData) => {
    try {
      return await fetchApi(`/api/leaves/${id}`, {
        method: 'PUT',
        body: JSON.stringify(leaveData),
      });
    } catch (error) {
      throw new Error('Cannot update leave: ' + error.message);
    }
  },

  // Approve leave
  approve: async (id, notes = '') => {
    try {
      return await fetchApi(`/api/leaves/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      });
    } catch (error) {
      throw new Error('Cannot approve leave: ' + error.message);
    }
  },

  // Reject leave
  reject: async (id, reason = '') => {
    try {
      return await fetchApi(`/api/leaves/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
    } catch (error) {
      throw new Error('Cannot reject leave: ' + error.message);
    }
  },

  // Get pending leaves
  getPending: async () => {
    try {
      const response = await fetchApi('/api/leaves/pending');
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error("Pending leaves failed:", error.message);
      return [];
    }
  },

  // Get leave balance
  getBalance: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/leaves/employee/${employeeId}/balance`);
      
      if (response?.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error("Leave balance failed:", error.message);
      return null;
    }
  },

  // Get leave by ID
  getById: async (id) => {
    try {
      const response = await fetchApi(`/api/leaves/${id}`);
      return response;
    } catch (error) {
      throw new Error(`Leave with ID ${id} not found: ${error.message}`);
    }
  },

  // Delete leave
  delete: async (id) => {
    try {
      return await fetchApi(`/api/leaves/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete leave: ' + error.message);
    }
  },

  // Get leave documents
  getDocuments: async (leaveId) => {
    try {
      const response = await fetchApi(`/api/leaves/${leaveId}/documents`);
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch leave documents:", error.message);
      return [];
    }
  },

  // Upload leave document
  uploadDocument: async (leaveId, file, documentName) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_name', documentName || file.name || 'document');
      formData.append('document_type', 'leave_proof'); 

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/leaves/${leaveId}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }
      
      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch {
        return responseText;
      }
    } catch (error) {
      console.error(`Failed to upload document for leave ${leaveId}:`, error);
      throw error;
    }
  },

  // Download leave document
  downloadDocument: async (leaveId, documentId, fileName) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`📥 Downloading leave document: leave=${leaveId}, doc=${documentId}, name=${fileName}`);

      const response = await fetch(`/api/leaves/${leaveId}/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`📥 Download failed (${response.status}):`, errorText);
        throw new Error(errorText || `Failed to download document (${response.status})`);
      }

      const contentType = response.headers.get('Content-Type') || '';
      console.log(`📥 Response Content-Type: ${contentType}`);

      // Try Content-Disposition filename
      let downloadName = fileName || `document_${documentId}`;
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadName = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();
      if (blob && blob.size > 0) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 500);
        return true;
      } else {
        throw new Error('No downloadable content received from server');
      }
    } catch (error) {
      console.error(`Failed to download document ${documentId}:`, error);
      throw error;
    }
  },
};


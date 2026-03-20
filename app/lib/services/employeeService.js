import { fetchApi } from '../api';

export const employeeService = {
  // Get all employees
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await fetchApi(`/api/employees?skip=${skip}&limit=${limit}`);
      
      // Handle nested data structure from API: { success: true, message: "...", data: [...] }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      // Fallback for other response formats
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response?.employees && Array.isArray(response.employees)) {
        return response.employees;
      }
      
      return [];
    } catch (error) {
      console.error("Employees API failed:", error.message);
      throw error;
    }
  },

  // Get employee by ID
  getById: async (id) => {
    try {
      const response = await fetchApi(`/api/employees/${id}`);
      
      // Handle nested data structure: { success: true, message: "...", data: {...} }
      if (response?.data && typeof response.data === 'object') {
        return response.data;
      }
      
      // Direct response
      return response;
    } catch (error) {
      throw new Error(`Employee with ID ${id} not found: ${error.message}`);
    }
  },

  // Create new employee
  create: async (employeeData) => {
    try {
      return await fetchApi('/api/employees', {
        method: 'POST',
        body: JSON.stringify(employeeData),
      });
    } catch (error) {
      throw new Error('Cannot create employee: ' + error.message);
    }
  },

  // Update employee
  update: async (id, employeeData) => {
    try {
      return await fetchApi(`/api/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData),
      });
    } catch (error) {
      throw new Error('Cannot update employee: ' + error.message);
    }
  },

  // Delete employee
  delete: async (id) => {
    try {
      return await fetchApi(`/api/employees/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete employee: ' + error.message);
    }
  },

  // Get position history
  getPositionHistory: async (id) => {
    try {
      const data = await fetchApi(`/api/employees/${id}/position-history`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  // Add position
  addPosition: async (id, positionData) => {
    try {
      return await fetchApi(`/api/employees/${id}/position`, {
        method: 'POST',
        body: JSON.stringify(positionData),
      });
    } catch (error) {
      throw new Error('Cannot add position: ' + error.message);
    }
  },

  // Get salary history
  getSalaryHistory: async (id) => {
    try {
      const data = await fetchApi(`/api/employees/${id}/salary-history`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  // Add salary
  addSalary: async (id, salaryData) => {
    try {
      return await fetchApi(`/api/employees/${id}/salary`, {
        method: 'POST',
        body: JSON.stringify(salaryData),
      });
    } catch (error) {
      throw new Error('Cannot add salary: ' + error.message);
    }
  },

  // Get visa history
  getVisaHistory: async (id) => {
    try {
      const data = await fetchApi(`/api/employees/${id}/visa-history`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  // Add visa
  addVisa: async (id, visaData) => {
    try {
      return await fetchApi(`/api/employees/${id}/visa`, {
        method: 'POST',
        body: JSON.stringify(visaData),
      });
    } catch (error) {
      throw new Error('Cannot add visa: ' + error.message);
    }
  },

  // Get documents
  getDocuments: async (id) => {
    try {
      const data = await fetchApi(`/api/employees/${id}/documents`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  // Upload document
  uploadDocument: async (employeeId, file, documentName) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_name', documentName);

      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`/api/employees/${employeeId}/documents/upload`, {
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
      throw new Error('Cannot upload document: ' + error.message);
    }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    try {
      return await fetchApi(`/api/employees/documents/${documentId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new Error('Cannot delete document: ' + error.message);
    }
  },

  // Download document
  downloadDocument: async (employeeId, documentId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`/api/employees/${employeeId}/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

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
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to download document');
    }
  },

  // Get bank details
  getBankDetails: async (id) => {
    try {
      return await fetchApi(`/api/employees/${id}/bank-details`);
    } catch (error) {
      return null;
    }
  },

  // Create or update bank details
  saveBankDetails: async (id, bankData) => {
    try {
      return await fetchApi(`/api/employees/${id}/bank-details`, {
        method: 'POST',
        body: JSON.stringify(bankData),
      });
    } catch (error) {
      throw new Error('Cannot save bank details: ' + error.message);
    }
  },
};

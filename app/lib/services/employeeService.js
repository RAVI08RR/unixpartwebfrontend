import { fetchApi } from '../api';

export const employeeService = {
  // Get all employees
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await fetchApi(`/api/employees?skip=${skip}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw error;
    }
  },

  // Get employee by ID
  getById: async (id) => {
    try {
      const response = await fetchApi(`/api/employees/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch employee ${id}:`, error);
      throw error;
    }
  },

  // Create new employee
  create: async (employeeData) => {
    try {
      const response = await fetchApi('/api/employees', {
        method: 'POST',
        body: JSON.stringify(employeeData),
      });
      return response;
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw error;
    }
  },

  // Update employee
  update: async (id, employeeData) => {
    try {
      const response = await fetchApi(`/api/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employeeData),
      });
      return response;
    } catch (error) {
      console.error(`Failed to update employee ${id}:`, error);
      throw error;
    }
  },

  // Delete employee
  delete: async (id) => {
    try {
      const response = await fetchApi(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Failed to delete employee ${id}:`, error);
      throw error;
    }
  },

  // Position History
  getPositionHistory: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/employees/${employeeId}/position-history`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch position history for employee ${employeeId}:`, error);
      throw error;
    }
  },

  addPosition: async (employeeId, positionData) => {
    try {
      const response = await fetchApi(`/api/employees/${employeeId}/position`, {
        method: 'POST',
        body: JSON.stringify(positionData),
      });
      return response;
    } catch (error) {
      console.error(`Failed to add position for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // Salary History
  getSalaryHistory: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/employees/${employeeId}/salary-history`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch salary history for employee ${employeeId}:`, error);
      throw error;
    }
  },

  addSalary: async (employeeId, salaryData) => {
    try {
      const response = await fetchApi(`/api/employees/${employeeId}/salary`, {
        method: 'POST',
        body: JSON.stringify(salaryData),
      });
      return response;
    } catch (error) {
      console.error(`Failed to add salary for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // Visa History
  getVisaHistory: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/employees/${employeeId}/visa-history`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch visa history for employee ${employeeId}:`, error);
      throw error;
    }
  },

  addVisa: async (employeeId, visaData) => {
    try {
      const response = await fetchApi(`/api/employees/${employeeId}/visa`, {
        method: 'POST',
        body: JSON.stringify(visaData),
      });
      return response;
    } catch (error) {
      console.error(`Failed to add visa for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // Documents
  getDocuments: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/employees/${employeeId}/documents`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch documents for employee ${employeeId}:`, error);
      throw error;
    }
  },

  uploadDocument: async (employeeId, file, documentType, documentName) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (documentType) formData.append('document_type', documentType);
      if (documentName) formData.append('document_name', documentName);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/employees/${employeeId}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to upload document');
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to upload document for employee ${employeeId}:`, error);
      throw error;
    }
  },

  downloadDocument: async (employeeId, documentId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/employees/${employeeId}/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_${documentId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Failed to download document ${documentId}:`, error);
      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await fetchApi(`/api/employees/documents/${documentId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(`Failed to delete document ${documentId}:`, error);
      throw error;
    }
  },

  // Bank Details
  getBankDetails: async (employeeId) => {
    try {
      const response = await fetchApi(`/api/employees/${employeeId}/bank-details`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch bank details for employee ${employeeId}:`, error);
      throw error;
    }
  },

  createOrUpdateBankDetails: async (employeeId, bankData) => {
    try {
      const response = await fetchApi(`/api/employees/${employeeId}/bank-details`, {
        method: 'POST',
        body: JSON.stringify(bankData),
      });
      return response;
    } catch (error) {
      console.error(`Failed to save bank details for employee ${employeeId}:`, error);
      throw error;
    }
  },
};

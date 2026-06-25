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
      // Check if it's the backend error masquerading as a successful response
      if (response && response.success === false && response.message?.includes('missing 1 required positional argument')) {
        throw new Error("Backend crashed");
      }
      return response;
    } catch (error) {
      console.warn(`[Workaround] Failed to fetch employee ${id} via direct endpoint, falling back to getAll list:`, error.message);
      try {
        const allEmployees = await fetchApi(`/api/employees?skip=0&limit=1000`);
        const list = Array.isArray(allEmployees) ? allEmployees : (allEmployees?.data || allEmployees?.items || allEmployees?.employees || []);
        const employee = list.find(emp => emp.id.toString() === id.toString());
        if (employee) return employee;
        throw new Error(`Employee ${id} not found in the list`);
      } catch (fallbackError) {
        throw new Error(`Failed to load employee ${id}: ${error.message}`);
      }
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
      formData.append('document_type', documentType || 'other');
      formData.append('document_name', documentName || file.name || 'document');

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

  downloadDocument: async (employeeId, documentId, fileName) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`📥 Downloading: employee=${employeeId}, doc=${documentId}, name=${fileName}`);

      const response = await fetch(`/api/employees/${employeeId}/documents/${documentId}/download`, {
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

      // Case 1: Backend returns JSON (URL string or base64)
      if (contentType.includes('application/json')) {
        const data = await response.text();
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }

        // If it's a URL string, open/download from that URL
        const fileUrl = typeof parsed === 'string' ? parsed : (parsed?.url || parsed?.file_url || parsed?.download_url);
        
        if (fileUrl && (fileUrl.startsWith('http') || fileUrl.startsWith('/'))) {
          console.log(`📥 Got file URL: ${fileUrl}`);
          // Fetch the actual file from the URL
          try {
            const fileResponse = await fetch(fileUrl);
            if (fileResponse.ok) {
              const blob = await fileResponse.blob();
              const downloadName = fileName || `document_${documentId}`;
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = downloadName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => window.URL.revokeObjectURL(url), 500);
              return;
            }
          } catch (fetchErr) {
            console.log('📥 Direct fetch failed, opening in new tab:', fetchErr.message);
          }
          // Fallback: open URL in new tab
          window.open(fileUrl, '_blank');
          return;
        }

        console.log('📥 JSON response (not a URL):', data?.substring?.(0, 200) || data);
      }

      // Case 2: Binary file response — download as blob
      // Try to get filename from Content-Disposition header
      let downloadName = fileName || `document_${documentId}`;
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadName = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const blob = contentType.includes('application/json') ? null : await response.blob();
      if (blob && blob.size > 0) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(url), 500);
      } else {
        throw new Error('No downloadable content received from server');
      }
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

import { fetchApi } from '../api';

export const fileManagerService = {
  // Get all root folders (Containers, Purchase Orders, Assets, Employees)
  getRootFolders: async () => {
    try {
      return await fetchApi('/api/file-manager/');
    } catch (error) {
      console.error("📋 Failed to fetch root folders:", error.message);
      return [];
    }
  },

  // Get contents of a specific folder with pagination and search
  getFolderContents: async (entityType, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      if (params.search) queryParams.append('search', params.search);
      if (params.entity_id) queryParams.append('entity_id', params.entity_id);
      if (params.document_type) queryParams.append('document_type', params.document_type);
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await fetchApi(`/api/file-manager/${entityType}${queryString}`);
    } catch (error) {
      console.error(`📋 Failed to fetch folder contents for ${entityType}:`, error.message);
      return {
        folders: [],
        documents: [],
        total_folders: 0,
        total_documents: 0,
        page: params.page || 1,
        page_size: params.page_size || 50
      };
    }
  }
};

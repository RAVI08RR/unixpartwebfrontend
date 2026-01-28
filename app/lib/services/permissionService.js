import { fetchApi } from '../api';

export const permissionService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const response = await fetchApi(`/api/permissions/?skip=${skip}&limit=${limit}`);
      console.log('✅ Permissions fetched successfully:', response);
      return response;
    } catch (error) {
      console.warn("Permissions API failed or not found, using fallback permissions:", error.message);
      // Fallback permissions based on common system modules
      return [
        // User Management
        { id: 1, name: "View Users", module: "User Management", description: "Can view user list and details" },
        { id: 2, name: "Create Users", module: "User Management", description: "Can create new users" },
        { id: 3, name: "Edit Users", module: "User Management", description: "Can edit existing users" },
        { id: 4, name: "Delete Users", module: "User Management", description: "Can delete users" },
        
        // Role Management
        { id: 5, name: "View Roles", module: "Role Management", description: "Can view roles list" },
        { id: 6, name: "Create Roles", module: "Role Management", description: "Can create new roles" },
        { id: 7, name: "Edit Roles", module: "Role Management", description: "Can edit existing roles" },
        { id: 8, name: "Delete Roles", module: "Role Management", description: "Can delete roles" },
        
        // Inventory Management
        { id: 9, name: "View Inventory", module: "Inventory", description: "Can view inventory items" },
        { id: 10, name: "Create Inventory", module: "Inventory", description: "Can add new inventory items" },
        { id: 11, name: "Edit Inventory", module: "Inventory", description: "Can edit inventory items" },
        { id: 12, name: "Delete Inventory", module: "Inventory", description: "Can delete inventory items" },
        
        // Sales Management
        { id: 13, name: "View Sales", module: "Sales", description: "Can view sales data" },
        { id: 14, name: "Create Sales", module: "Sales", description: "Can create sales orders" },
        { id: 15, name: "Edit Sales", module: "Sales", description: "Can edit sales orders" },
        { id: 16, name: "Delete Sales", module: "Sales", description: "Can delete sales orders" },
        
        // Reports
        { id: 17, name: "View Reports", module: "Reports", description: "Can view system reports" },
        { id: 18, name: "Export Reports", module: "Reports", description: "Can export reports" },
        
        // Settings
        { id: 19, name: "System Settings", module: "Settings", description: "Can modify system settings" },
        { id: 20, name: "Branch Management", module: "Settings", description: "Can manage branches" },
        
        // Supplier Management
        { id: 21, name: "View Suppliers", module: "Suppliers", description: "Can view supplier list" },
        { id: 22, name: "Create Suppliers", module: "Suppliers", description: "Can create new suppliers" },
        { id: 23, name: "Edit Suppliers", module: "Suppliers", description: "Can edit suppliers" },
        { id: 24, name: "Delete Suppliers", module: "Suppliers", description: "Can delete suppliers" },
        
        // Warehouse Management
        { id: 25, name: "View Warehouse", module: "Warehouse", description: "Can view warehouse data" },
        { id: 26, name: "Manage Warehouse", module: "Warehouse", description: "Can manage warehouse operations" },
        
        // Finance
        { id: 27, name: "View Finance", module: "Finance", description: "Can view financial data" },
        { id: 28, name: "Manage Finance", module: "Finance", description: "Can manage financial operations" }
      ];
    }
  },

  getById: async (id) => {
    return fetchApi(`/api/permissions/${id}/`);
  },

  create: async (permissionData) => {
    console.log('🔄 Creating permission:', permissionData);
    return fetchApi('/api/permissions/', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  },

  update: async (id, permissionData) => {
    console.log('🔄 Updating permission:', { id, data: permissionData });
    return fetchApi(`/api/permissions/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  },

  delete: async (id) => {
    console.log('🗑️ Deleting permission:', id);
    return fetchApi(`/api/permissions/${id}/`, {
      method: 'DELETE',
    });
  },
};
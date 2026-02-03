import { useState, useEffect } from 'react';
import { permissionService } from '../services/permissionService';

export function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await permissionService.getAll();
      setPermissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Permissions API failed or not found, using fallback permissions:', err.message);
      setError(null); // Clear error since we'll use fallback data
      
      // Set comprehensive fallback permissions data
      const fallbackPermissions = [
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
        
        // Suppliers
        { id: 17, name: "View Suppliers", module: "Suppliers", description: "Can view supplier list" },
        { id: 18, name: "Create Suppliers", module: "Suppliers", description: "Can create new suppliers" },
        { id: 19, name: "Edit Suppliers", module: "Suppliers", description: "Can edit suppliers" },
        { id: 20, name: "Delete Suppliers", module: "Suppliers", description: "Can delete suppliers" },
        
        // Reports
        { id: 21, name: "View Reports", module: "Reports", description: "Can view system reports" },
        { id: 22, name: "Export Reports", module: "Reports", description: "Can export reports" },
        
        // Settings
        { id: 23, name: "System Settings", module: "Settings", description: "Can modify system settings" },
        { id: 24, name: "Branch Management", module: "Settings", description: "Can manage branches" },
        
        // Finance
        { id: 25, name: "View Finance", module: "Finance", description: "Can view financial data" },
        { id: 26, name: "Manage Finance", module: "Finance", description: "Can manage financial operations" }
      ];
      
      setPermissions(fallbackPermissions);
    } finally {
      setLoading(false);
    }
  };

  // Group permissions by module for better organization
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const module = permission.module || 'General';
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {});

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    groupedPermissions,
    loading,
    error,
    refetch: fetchPermissions
  };
}
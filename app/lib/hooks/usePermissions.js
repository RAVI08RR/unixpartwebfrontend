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
        // Users module
        { id: 1, name: "View Users", module: "users", description: "Can view user list" },
        { id: 2, name: "Create Users", module: "users", description: "Can create new users" },
        { id: 3, name: "Update Users", module: "users", description: "Can update user information" },
        { id: 4, name: "Delete Users", module: "users", description: "Can delete users" },
        
        // Branches module
        { id: 5, name: "View Branches", module: "branches", description: "Can view branch list" },
        { id: 6, name: "Create Branches", module: "branches", description: "Can create new branches" },
        { id: 7, name: "Update Branches", module: "branches", description: "Can update branch information" },
        { id: 8, name: "Delete Branches", module: "branches", description: "Can delete branches" },
        
        // Suppliers module
        { id: 9, name: "View Suppliers", module: "suppliers", description: "Can view supplier list" },
        { id: 10, name: "Create Suppliers", module: "suppliers", description: "Can create new suppliers" },
        { id: 11, name: "Update Suppliers", module: "suppliers", description: "Can update supplier information" },
        { id: 12, name: "Delete Suppliers", module: "suppliers", description: "Can delete suppliers" },
        
        // Stock Items module
        { id: 13, name: "View Stock Items", module: "stock_items", description: "Can view stock items" },
        { id: 14, name: "Create Stock Items", module: "stock_items", description: "Can create new stock items" },
        { id: 15, name: "Update Stock Items", module: "stock_items", description: "Can update stock items" },
        { id: 16, name: "Delete Stock Items", module: "stock_items", description: "Can delete stock items" },
        
        // Roles module
        { id: 17, name: "View Roles", module: "roles", description: "Can view roles" },
        { id: 18, name: "Create Roles", module: "roles", description: "Can create new roles" },
        { id: 19, name: "Update Roles", module: "roles", description: "Can update roles" },
        { id: 20, name: "Delete Roles", module: "roles", description: "Can delete roles" },
        
        // Permissions module
        { id: 21, name: "View Permissions", module: "permissions", description: "Can view permissions" },
        { id: 22, name: "Manage Permissions", module: "permissions", description: "Can manage permissions" },
        
        // Invoices module
        { id: 23, name: "View Invoices", module: "invoices", description: "Can view invoices" },
        { id: 24, name: "Create Invoices", module: "invoices", description: "Can create new invoices" },
        { id: 25, name: "Update Invoices", module: "invoices", description: "Can update invoices" },
        { id: 26, name: "Delete Invoices", module: "invoices", description: "Can delete invoices" },
        
        // Reports module
        { id: 27, name: "View Reports", module: "reports", description: "Can view system reports" },
        { id: 28, name: "Export Reports", module: "reports", description: "Can export reports" },
        
        // Settings module
        { id: 29, name: "View Settings", module: "settings", description: "Can view system settings" },
        { id: 30, name: "Manage Settings", module: "settings", description: "Can manage system settings" }
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
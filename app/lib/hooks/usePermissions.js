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
      console.error('Error fetching permissions:', err);
      setError(err.message);
      // Set fallback data on error
      setPermissions([]);
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
import { useState, useEffect } from 'react';
import { roleService } from '../services/roleService';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleService.getAll();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err.message);
      // Set fallback data on error
      setRoles([
        { id: 1, name: "Administrator" },
        { id: 2, name: "Manager" },
        { id: 3, name: "Staff" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData) => {
    try {
      const newRole = await roleService.create(roleData);
      setRoles(prev => [...prev, newRole]);
      return newRole;
    } catch (err) {
      console.error('Error creating role:', err);
      throw err;
    }
  };

  const updateRole = async (id, roleData) => {
    try {
      const updatedRole = await roleService.update(id, roleData);
      setRoles(prev => prev.map(role => 
        role.id === id ? { ...role, ...updatedRole } : role
      ));
      return updatedRole;
    } catch (err) {
      console.error('Error updating role:', err);
      throw err;
    }
  };

  const deleteRole = async (id) => {
    try {
      await roleService.delete(id);
      setRoles(prev => prev.filter(role => role.id !== id));
    } catch (err) {
      console.error('Error deleting role:', err);
      throw err;
    }
  };

  const mutate = () => {
    fetchRoles();
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    mutate
  };
}
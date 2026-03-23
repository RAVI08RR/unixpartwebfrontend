/**
 * Auth Store - Zustand
 * Manages user authentication state and permissions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      userId: null,
      role: null,
      permissions: [],
      branches: [],
      suppliers: [],
      isLoading: false,
      isInitialized: false,

      // Actions
      setAuth: (data) => {
        const allPermissions = [
          ...(data.role?.permissions || []),
          ...(data.permissions || []),
        ];
        
        set({
          userId: data.user_id,
          role: data.role,
          permissions: allPermissions,
          branches: data.branches || [],
          suppliers: data.suppliers || [],
          isInitialized: true,
        });
      },

      clearAuth: () => {
        set({
          userId: null,
          role: null,
          permissions: [],
          branches: [],
          suppliers: [],
          isInitialized: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      // Permission Helpers
      hasPermission: (slug) => {
        const { permissions, role } = get();
        
        // Admin bypass (optional - can be removed for strict permission checking)
        if (role?.slug === 'administrator') {
          return true;
        }
        
        if (!slug) return false;
        return permissions.some(p => p.slug === slug);
      },

      hasAnyPermission: (slugs) => {
        if (!Array.isArray(slugs) || slugs.length === 0) return false;
        return slugs.some(slug => get().hasPermission(slug));
      },

      hasAllPermissions: (slugs) => {
        if (!Array.isArray(slugs) || slugs.length === 0) return false;
        return slugs.every(slug => get().hasPermission(slug));
      },

      hasModuleAccess: (module) => {
        const { permissions, role } = get();
        
        // Admin bypass
        if (role?.slug === 'administrator') {
          return true;
        }
        
        if (!module) return false;
        return permissions.some(p => p.module === module);
      },

      isAdmin: () => {
        const { role } = get();
        return role?.slug === 'administrator';
      },

      getUserRole: () => {
        const { role } = get();
        return role?.name || 'Unknown';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        userId: state.userId,
        role: state.role,
        permissions: state.permissions,
        branches: state.branches,
        suppliers: state.suppliers,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

export default useAuthStore;

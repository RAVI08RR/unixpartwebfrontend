/**
 * usePermission Hook
 * Convenience hook for permission checks
 */

import useAuthStore from '../store/authStore';

export const usePermission = () => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    isAdmin,
    getUserRole,
    permissions,
    role,
  } = useAuthStore();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    isAdmin,
    getUserRole,
    permissions,
    role,
    // Convenience method to check if user can perform an action
    can: hasPermission,
    canAny: hasAnyPermission,
    canAll: hasAllPermissions,
  };
};

export default usePermission;

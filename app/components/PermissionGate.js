/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions
 */

'use client';

import { usePermission } from '@/app/lib/hooks/usePermission';

export default function PermissionGate({ 
  permission, 
  permissions, 
  requireAll = false,
  fallback = null, 
  children 
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  // Handle single permission
  if (permission) {
    if (!hasPermission(permission)) {
      return fallback;
    }
    return <>{children}</>;
  }

  // Handle multiple permissions
  if (permissions && Array.isArray(permissions)) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return fallback;
    }
    return <>{children}</>;
  }

  // No permission specified - render children
  return <>{children}</>;
}

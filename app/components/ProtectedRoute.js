/**
 * ProtectedRoute Component
 * Wraps routes and redirects if user lacks permission
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermission } from '@/app/lib/hooks/usePermission';
import { Loader2 } from 'lucide-react';
import useAuthStore from '@/app/lib/store/authStore';

export default function ProtectedRoute({ 
  permission, 
  permissions,
  requireAll = false,
  redirectTo = '/dashboard/unauthorized',
  children 
}) {
  const router = useRouter();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
  const { isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) return;

    let hasAccess = true;

    // Check single permission
    if (permission) {
      hasAccess = hasPermission(permission);
    }
    // Check multiple permissions
    else if (permissions && Array.isArray(permissions)) {
      hasAccess = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }

    // Redirect if no access
    if (!hasAccess) {
      router.replace(redirectTo);
    }
  }, [permission, permissions, requireAll, hasPermission, hasAnyPermission, hasAllPermissions, isInitialized, router, redirectTo]);

  // Show loading while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Check permission
  let hasAccess = true;
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && Array.isArray(permissions)) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Don't render if no access (will redirect via useEffect)
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

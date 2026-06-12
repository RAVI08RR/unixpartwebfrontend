/**
 * AuthProvider Component
 * Initializes user permissions on app load
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/app/lib/store/authStore';
import { authService } from '@/app/lib/services/authService';
import { getAuthToken, clearAuthToken } from '@/app/lib/api';

export default function AuthProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setAuth, clearAuth, setLoading } = useAuthStore();
  
  // Use a ref to track if we have already run the auth init for this session
  // This prevents re-running when isInitialized changes (which was causing loops)
  const hasInitialized = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Skip auth check on login/signup pages - they handle their own auth
      if (
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname === '/employee/login'
      ) {
        // Reset the flag when on login pages so next protected page works correctly
        hasInitialized.current = false;
        return;
      }

      // If we already ran the full init, only do route guard checks (no API calls)
      if (hasInitialized.current) {
        const state = useAuthStore.getState();
        const roleSlug = state.role?.slug;
        const isEmployee = roleSlug === 'employee' || roleSlug === 'staff';

        if (isEmployee && pathname.startsWith('/dashboard')) {
          router.replace('/employee');
        } else if (!isEmployee && state.isInitialized && pathname.startsWith('/employee')) {
          router.replace('/dashboard');
        }
        return;
      }

      const token = getAuthToken();

      // No token - redirect to login
      if (!token) {
        clearAuth();
        hasInitialized.current = false;
        // Employees go to employee login, others go to main login
        if (pathname.startsWith('/employee')) {
          router.replace('/employee/login?redirect=' + encodeURIComponent(pathname));
        } else {
          router.replace('/?redirect=' + encodeURIComponent(pathname));
        }
        return;
      }

      // Check if this is an employee session (has employee_id OR is_employee flag in current_user)
      let isEmployeeSession = false;
      let empId = null;
      if (typeof window !== 'undefined') {
        try {
          const currentUserStr = localStorage.getItem('current_user');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            if (currentUser && (currentUser.employee_id || currentUser.is_employee)) {
              isEmployeeSession = true;
              empId = currentUser.employee_id || null;
            }
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      if (isEmployeeSession) {
        // Initialize employee auth state
        const state = useAuthStore.getState();
        if (!state.isInitialized || state.role?.slug !== 'employee') {
          setAuth({
            role: { slug: 'employee', name: 'Employee' },
            permissions: [],
            user_id: empId,
          });
        }

        hasInitialized.current = true;

        // Employees must stay on /employee/* pages
        if (pathname.startsWith('/dashboard')) {
          router.replace('/employee');
        }
        return;
      }

      // Check existing store state (e.g., persisted from previous session)
      const existingState = useAuthStore.getState();
      if (existingState.isInitialized && existingState.role) {
        const roleSlug = existingState.role?.slug;
        const isEmployee = roleSlug === 'employee' || roleSlug === 'staff';

        hasInitialized.current = true;

        if (isEmployee && pathname.startsWith('/dashboard')) {
          router.replace('/employee');
        } else if (!isEmployee && pathname.startsWith('/employee')) {
          router.replace('/dashboard');
        }
        return;
      }

      // Fresh session - fetch permissions from API
      setLoading(true);
      try {
        const permissionsData = await authService.getUserPermissions();
        setAuth(permissionsData);

        hasInitialized.current = true;

        const roleSlug = permissionsData?.role?.slug;
        const isEmployee = roleSlug === 'employee' || roleSlug === 'staff';

        if (isEmployee && pathname.startsWith('/dashboard')) {
          router.replace('/employee');
        } else if (!isEmployee && pathname.startsWith('/employee')) {
          router.replace('/dashboard');
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        clearAuthToken();
        hasInitialized.current = false;
        clearAuth();
        if (pathname.startsWith('/employee')) {
          router.replace('/employee/login?redirect=' + encodeURIComponent(pathname));
        } else {
          router.replace('/?redirect=' + encodeURIComponent(pathname));
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    // Only re-run when pathname changes - NOT when isInitialized changes
    // This prevents the redirect loop that happened when setAuth() triggered a re-run
  }, [pathname, router, setAuth, clearAuth, setLoading]);

  return <>{children}</>;
}

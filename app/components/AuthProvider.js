/**
 * AuthProvider Component
 * Initializes user permissions on app load
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/app/lib/store/authStore';
import { authService } from '@/app/lib/services/authService';
import { getAuthToken } from '@/app/lib/api';

export default function AuthProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setAuth, clearAuth, setLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // Skip auth check on login/signup pages
      if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
        return;
      }

      const token = getAuthToken();
      
      // No token - redirect to login
      if (!token) {
        clearAuth();
        router.replace('/?redirect=' + encodeURIComponent(pathname));
        return;
      }

      // Already initialized - skip
      if (isInitialized) {
        return;
      }

      // Fetch user permissions
      setLoading(true);
      try {
        const permissionsData = await authService.getUserPermissions();
        setAuth(permissionsData);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        // On error, clear auth and redirect to login
        clearAuth();
        router.replace('/?redirect=' + encodeURIComponent(pathname));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [pathname, router, setAuth, clearAuth, setLoading, isInitialized]);

  return <>{children}</>;
}

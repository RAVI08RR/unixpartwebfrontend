"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '../lib/api';

export default function AuthGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      if (!token) {
        console.log('🔒 No authentication token found, redirecting to login');
        router.push('/');
        return false;
      }
      return true;
    };

    // Check authentication on mount
    checkAuth();

    // Listen for storage changes (token removal from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' && !e.newValue) {
        console.log('🔒 Token removed in another tab, redirecting to login');
        router.push('/');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  // Check if we have a token before rendering children
  const token = getAuthToken();
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Checking authentication...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return children;
}
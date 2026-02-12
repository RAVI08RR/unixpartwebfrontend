"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '../lib/api';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      if (!token) {
        console.log('🔒 No authentication token found, redirecting to login');
        router.push('/');
        return false;
      }
      setIsChecking(false);
      return true;
    };

    // Quick check on mount
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

  // Fast check - only show loading briefly
  if (isChecking) {
    return null; // Return nothing instead of loading screen for faster perceived load
  }

  return children;
}
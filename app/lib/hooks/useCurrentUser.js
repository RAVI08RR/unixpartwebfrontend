import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getAuthToken } from '../api';

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        if (typeof window === 'undefined') return;

        // Try to get cached user first to show UI immediately
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
        }
        
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Check if it's a mock token (supports both 'mock_token_' and 'mock_OFFLINE_')
        if (token.startsWith('mock_')) {
          console.warn("Using Mock/Offline User Identity");
          const mockUser = {
            id: 1,
            name: "Demo User",
            email: "demo@unixparts.com",
            role: { name: "Administrator" },
            user_code: "USR-001",
            ...JSON.parse(localStorage.getItem('current_user') || '{}') // Merge with any stored details
          };
          setUser(mockUser);
          setLoading(false);
          return;
        }

        // Fetch real user data with comprehensive error handling
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
            localStorage.setItem('current_user', JSON.stringify(userData));
          }
        } catch (apiError) {
          console.warn('⚠️ Failed to fetch user from API (using cached/fallback data):', apiError.message);
          
          // If API fails but we have a valid token and cached user, use cached data
          if (storedUser) {
            console.log('📋 Using cached user data due to API failure');
            // User is already set from cached data above
          } else {
            // If no cached data and API fails, create a fallback user
            console.log('🔄 Creating fallback user due to API failure');
            const fallbackUser = {
              id: 1,
              name: "User",
              email: "user@unixparts.com",
              role: { name: "User" },
              user_code: "USR-001"
            };
            setUser(fallbackUser);
            localStorage.setItem('current_user', JSON.stringify(fallbackUser));
          }
          
          // Clear the error state since we handled it gracefully
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
        setError(err);
        
        // Even if there's an error, try to provide a fallback user
        if (!user) {
          const fallbackUser = {
            id: 1,
            name: "User",
            email: "user@unixparts.com",
            role: { name: "User" },
            user_code: "USR-001"
          };
          setUser(fallbackUser);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}

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
        
        // Check if user has valid token
        const token = getAuthToken();
        if (!token) {
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
          console.warn('⚠️ Failed to fetch user from API:', apiError.message);
          
          // If API fails but we have a valid token and cached user, use cached data
          if (storedUser) {
            console.log('📋 Using cached user data due to API failure');
            // User is already set from cached data above
          } else {
            // If no cached data and API fails, clear the token and redirect to login
            console.log('🔄 No cached user data and API failed - redirecting to login');
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('current_user');
              window.location.href = '/';
            }
            return;
          }
          
          // Clear the error state since we handled it gracefully
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
        setError(err);
        
        // If there's an error and no cached user, redirect to login
        if (!user && !storedUser) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('current_user');
            window.location.href = '/';
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}

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

        // Check if it's a mock token
        if (token.startsWith('mock_token_')) {
          const mockUser = {
            id: 1,
            name: "Demo User",
            email: "demo@unixparts.com",
            role: { name: "Administrator" },
            user_code: "USR-001"
          };
          setUser(mockUser);
          setLoading(false);
          return;
        }

        // Fetch real user data
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          localStorage.setItem('current_user', JSON.stringify(userData));
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}

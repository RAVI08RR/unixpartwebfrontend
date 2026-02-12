"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../lib/services/authService';
import { getAuthToken, setAuthToken } from '../lib/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status only on mount (not on every route change)
  useEffect(() => {
    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  const checkAuth = async () => {
    try {
      // Quick check: if token exists in localStorage
      const token = getAuthToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Fast path: Check if user is already in localStorage
      const cachedUser = localStorage.getItem('current_user');
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setLoading(false);
          return; // Skip API call for faster load
        } catch (e) {
          console.error('Failed to parse cached user:', e);
        }
      }

      // Slow path: Only verify with API if no cached user
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
        localStorage.setItem('current_user', JSON.stringify(currentUser));
      } catch (error) {
        // Token is invalid or expired
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
        // Clear invalid token
        await authService.logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response?.access_token) {
      setAuthToken(response.access_token);
      if (response.user) {
        setUser(response.user);
        localStorage.setItem("current_user", JSON.stringify(response.user));
      }
      setIsAuthenticated(true);
      return response;
    }
    throw new Error('Login failed');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

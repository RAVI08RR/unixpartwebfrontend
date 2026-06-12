import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { getAuthToken, fetchApi } from '../api';

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
            console.error('Failed to parse stored user', e);
          }
        }

        // Check if user has valid token
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Detect employee session: current_user has is_employee flag OR employee_id
        let isEmployeeSession = false;
        try {
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed && (parsed.is_employee || parsed.employee_id)) {
              isEmployeeSession = true;
            }
          }
        } catch (e) {
          // ignore
        }

        // Call the correct endpoint depending on user type
        try {
          let userData;
          if (isEmployeeSession) {
            // Employee: use /api/employee/me (uses employee token)
            userData = await fetchApi('/api/employee/me');
          } else {
            // Admin/system user: use /api/auth/me
            userData = await authService.getCurrentUser();
          }

          if (userData) {
            // For employee sessions, ALWAYS preserve is_employee flag and employee_id
            // so detection works correctly on every page reload
            if (isEmployeeSession) {
              let cachedEmployeeId = null;
              try {
                const cached = JSON.parse(storedUser);
                cachedEmployeeId = cached.employee_id || null;
              } catch (e) { /* ignore */ }

              // Build full name from first_name + last_name (API has no 'name' field)
              const fullName = [
                userData.first_name,
                userData.last_name
              ].filter(Boolean).join(' ') || userData.name || null;

              // Merge: API data wins, but we always ensure employee flags survive
              userData = {
                ...userData,
                name: fullName,
                is_employee: true,
                // Keep the numeric id (5) in emp_id, and the string ID ("EMP-AUH-003") in employee_id
                emp_id: userData.id || cachedEmployeeId,
                employee_id: userData.employee_id || cachedEmployeeId,
              };
            }
            setUser(userData);
            localStorage.setItem('current_user', JSON.stringify(userData));
          }
        } catch (apiError) {
          console.warn('⚠️ Failed to fetch user from API:', apiError.message);

          // If API fails but we have a valid token and cached user, use cached data
          if (storedUser) {
            console.log('📋 Using cached user data due to API failure');
            // User is already set from cached data above - just suppress the error
          } else {
            // No cached data and API failed - redirect to appropriate login
            console.log('🔄 No cached user data and API failed - redirecting to login');
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
              localStorage.removeItem('current_user');
              localStorage.removeItem('token_expiry');
              if (isEmployeeSession) {
                window.location.href = '/employee/login';
              } else {
                window.location.href = '/';
              }
            }
            return;
          }

          setError(null);
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

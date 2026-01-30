# API Client Usage Guide

## Overview

The new `apiClient` provides a modern, robust way to interact with your FastAPI backend with automatic authentication, error handling, and environment-based configuration.

## Key Features

- ✅ **Environment-based configuration** - Uses `NEXT_PUBLIC_API_URL`
- ✅ **Automatic Bearer token attachment** - From localStorage
- ✅ **Global 401 handling** - Automatic token cleanup on auth failure
- ✅ **Query parameter handling** - Clean, type-safe parameter passing
- ✅ **Comprehensive error handling** - Network errors, validation errors, etc.
- ✅ **Development logging** - Detailed request/response logging in dev mode
- ✅ **Production-ready** - Structured error logging for monitoring

## Basic Usage

```javascript
import { apiClient } from '../lib/api';

// GET request with query parameters
const users = await apiClient.get('api/users', { skip: 0, limit: 100 });

// POST request
const newUser = await apiClient.post('api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updatedUser = await apiClient.put('api/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await apiClient.delete('api/users/123');
```

## Authentication

The API client automatically handles authentication:

```javascript
import { tokenManager } from '../lib/api';

// After successful login, store the token
tokenManager.set(loginResponse.access_token);

// All subsequent API calls will include the Bearer token
const protectedData = await apiClient.get('api/protected-endpoint');

// Clear token on logout
tokenManager.clear();
```

## Service Layer Example

```javascript
// app/lib/services/userService.js
import { apiClient } from '../api';

export const userService = {
  // Get all users with pagination
  getAll: async (skip = 0, limit = 100) => {
    return apiClient.get('api/users', { skip, limit });
  },

  // Get single user
  getById: async (id) => {
    return apiClient.get(`api/users/${id}`);
  },

  // Create user
  create: async (userData) => {
    return apiClient.post('api/users', userData);
  },

  // Update user
  update: async (id, userData) => {
    return apiClient.put(`api/users/${id}`, userData);
  },

  // Delete user
  delete: async (id) => {
    return apiClient.delete(`api/users/${id}`);
  },
};
```

## React Hook Integration

```javascript
// app/lib/hooks/useUsers.js
import useSWR from 'swr';
import { apiClient } from '../api';

const fetcher = (url) => {
  const [endpoint, queryParams] = url.split('?');
  const params = new URLSearchParams(queryParams || '');
  return apiClient.get(endpoint, Object.fromEntries(params));
};

export function useUsers(skip = 0, limit = 100) {
  const { data, error, isLoading, mutate } = useSWR(
    `api/users?skip=${skip}&limit=${limit}`,
    fetcher
  );

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
```

## Error Handling

The API client provides comprehensive error handling:

```javascript
try {
  const user = await apiClient.get('api/users/123');
} catch (error) {
  if (error.message.includes('session has expired')) {
    // Handle 401 - user will be redirected to login
    router.push('/login');
  } else if (error.message.includes('Network error')) {
    // Handle network issues
    showNotification('Connection error. Please try again.');
  } else {
    // Handle other API errors
    showNotification(`Error: ${error.message}`);
  }
}
```

## Environment Configuration

Set up your environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

For different environments:

```bash
# Development
NEXT_PUBLIC_API_URL=https://289b47e1e00a.ngrok-free.app

# Production
NEXT_PUBLIC_API_URL=https://api.yourapp.com
```

## Migration from Old API

If you're migrating from the old `fetchApi` function:

### Before:
```javascript
const users = await fetchApi('/api/users?skip=0&limit=100');
```

### After:
```javascript
const users = await apiClient.get('api/users', { skip: 0, limit: 100 });
```

### Before:
```javascript
const newUser = await fetchApi('/api/users', {
  method: 'POST',
  body: JSON.stringify(userData),
});
```

### After:
```javascript
const newUser = await apiClient.post('api/users', userData);
```

## Advanced Usage

### Skip Authentication for Public Endpoints

```javascript
// For login/register endpoints that don't need auth
const loginResult = await apiClient.post('api/auth/login', {
  email: 'user@example.com',
  password: 'password'
}, { skipAuth: true });
```

### Custom Headers

```javascript
const data = await apiClient.get('api/data', {}, {
  headers: {
    'Custom-Header': 'value'
  }
});
```

### Raw Request Method

```javascript
const response = await apiClient.request('api/custom-endpoint', {
  method: 'PATCH',
  body: JSON.stringify(data),
  headers: { 'Content-Type': 'application/json' },
  queryParams: { filter: 'active' }
});
```

## Best Practices

1. **Use the service layer** - Don't call `apiClient` directly from components
2. **Handle errors appropriately** - Show user-friendly messages
3. **Use TypeScript** - Add proper typing for better development experience
4. **Environment variables** - Always use `NEXT_PUBLIC_API_URL`
5. **Token management** - Let the client handle authentication automatically
6. **Query parameters** - Use the `queryParams` option instead of manual URL building
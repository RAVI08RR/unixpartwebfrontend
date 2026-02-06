# Authentication System Documentation

## Overview

This Next.js application implements a secure authentication system using HttpOnly cookies and middleware-based route protection.

## Architecture

### 1. Token Storage Strategy

**Primary: HttpOnly Cookies (Secure)**
- Auth tokens are stored in HttpOnly cookies set by the server
- Cookies are inaccessible to client-side JavaScript (XSS protection)
- Automatically sent with every request to the server
- Set with `SameSite=Lax` to prevent CSRF attacks
- `Secure` flag enabled in production (HTTPS only)

**Fallback: localStorage**
- Token also stored in localStorage for client-side checks
- Used for immediate UI updates and client-side routing
- Provides better UX during navigation

### 2. Authentication Flow

#### Login Process
```
1. User submits credentials → /api/auth/login
2. Next.js proxy forwards to FastAPI backend
3. Backend validates and returns JWT token
4. Next.js API route:
   - Sets HttpOnly cookie with token
   - Returns token in response body
5. Client stores token in localStorage (fallback)
6. User redirected to /dashboard
```

#### Session Persistence
```
1. User visits any page
2. Middleware checks for auth_token cookie
3. If cookie exists:
   → User is authenticated
   → Access granted to protected routes
   → Redirect from /login to /dashboard
4. If cookie missing:
   → User is unauthenticated
   → Redirect to /login from protected routes
```

#### Logout Process
```
1. User clicks logout
2. Call /api/auth/logout
3. Server clears HttpOnly cookie (Max-Age=0)
4. Client clears localStorage
5. User redirected to /login
```

### 3. Middleware Protection

**File:** `middleware.ts`

**Protected Routes:**
- `/dashboard/*` - Main application
- `/profile/*` - User profile
- `/settings/*` - Settings pages

**Public Routes:**
- `/` - Login page
- `/signup` - Registration page

**Middleware Logic:**
```typescript
if (hasToken && isAuthRoute) {
  // Authenticated user trying to access login
  → Redirect to /dashboard
}

if (hasToken && isProtectedRoute) {
  // Authenticated user accessing protected route
  → Allow access
}

if (!hasToken && isProtectedRoute) {
  // Unauthenticated user trying to access protected route
  → Redirect to /?redirect=/original-path
}

if (!hasToken && isPublicRoute) {
  // Unauthenticated user accessing public route
  → Allow access
}
```

### 4. Security Features

#### HttpOnly Cookies
```javascript
// Set in app/api/auth/login/route.js
const cookieOptions = [
  `auth_token=${token}`,
  'Path=/',
  'HttpOnly',              // Prevents JavaScript access
  'SameSite=Lax',          // CSRF protection
  'Max-Age=86400',         // 24 hours
  isProduction ? 'Secure' : '', // HTTPS only in production
].filter(Boolean).join('; ');
```

#### Token Validation
- Middleware checks cookie presence on every request
- Client-side checks localStorage for immediate feedback
- Invalid/expired tokens trigger automatic logout
- 401 responses clear tokens and redirect to login

#### CORS Protection
- API routes include proper CORS headers
- Credentials included in cross-origin requests
- ngrok-skip-browser-warning header for development

### 5. File Structure

```
/
├── middleware.ts                    # Route protection
├── app/
│   ├── page.js                      # Login page (/)
│   ├── signup/
│   │   └── page.js                  # Registration page
│   ├── dashboard/
│   │   └── page.js                  # Protected dashboard
│   ├── api/
│   │   └── auth/
│   │       ├── login/
│   │       │   └── route.js         # Login endpoint + cookie setter
│   │       ├── logout/
│   │       │   └── route.js         # Logout endpoint + cookie clearer
│   │       └── me/
│   │           └── route.js         # Current user endpoint
│   ├── lib/
│   │   ├── api.js                   # API client + token management
│   │   └── services/
│   │       └── authService.js       # Auth service layer
│   └── components/
│       └── AuthProvider.js          # Auth context provider
└── docs/
    └── AUTHENTICATION.md            # This file
```

### 6. API Routes

#### POST /api/auth/login
**Purpose:** Authenticate user and set cookie

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Side Effects:**
- Sets `auth_token` HttpOnly cookie
- Cookie expires in 24 hours

#### POST /api/auth/logout
**Purpose:** Clear authentication cookie

**Response:**
```json
{
  "message": "Logged out successfully",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Side Effects:**
- Clears `auth_token` cookie (Max-Age=0)

#### GET /api/auth/me
**Purpose:** Get current authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "admin"
}
```

### 7. Client-Side Usage

#### Using AuthProvider
```jsx
import { AuthProvider, useAuth } from '@/app/components/AuthProvider';

// Wrap your app
function App() {
  return (
    <AuthProvider>
      <YourComponents />
    </AuthProvider>
  );
}

// Use in components
function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.full_name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Manual Token Management
```javascript
import { getAuthToken, setAuthToken, clearAuthToken } from '@/app/lib/api';

// Check if user is authenticated
const token = getAuthToken();
if (token) {
  console.log('User is authenticated');
}

// Store token after login
setAuthToken('eyJhbGc...');

// Clear token on logout
clearAuthToken();
```

### 8. Environment Variables

**Required:**
```env
NEXT_PUBLIC_API_URL=http://srv1029267.hstgr.cloud:8000/
NODE_ENV=production
```

**Optional:**
```env
NODE_TLS_REJECT_UNAUTHORIZED=0  # For development with self-signed certs
```

### 9. Deployment Checklist

#### Vercel/Production
- [ ] Set `NEXT_PUBLIC_API_URL` in environment variables
- [ ] Ensure backend API is accessible from production domain
- [ ] Verify HTTPS is enabled (required for Secure cookies)
- [ ] Test login/logout flow
- [ ] Test protected route access
- [ ] Test redirect after login
- [ ] Verify no infinite redirect loops

#### Local Development
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_API_URL` to your backend URL
- [ ] Run `npm run dev`
- [ ] Test authentication flow

### 10. Troubleshooting

#### Issue: Infinite redirect loop
**Cause:** Middleware and client-side auth checks conflicting
**Solution:** Ensure middleware only checks cookie, not localStorage

#### Issue: Cookie not being set
**Cause:** CORS or SameSite issues
**Solution:** 
- Check browser console for cookie warnings
- Verify API route is setting cookie correctly
- Ensure domain matches (localhost vs 127.0.0.1)

#### Issue: User logged out unexpectedly
**Cause:** Token expired or invalid
**Solution:**
- Check token expiration time
- Implement token refresh mechanism
- Verify backend is not rejecting token

#### Issue: Protected routes accessible without login
**Cause:** Middleware not running or misconfigured
**Solution:**
- Check `middleware.ts` matcher configuration
- Verify middleware is in root directory
- Check console logs for middleware execution

### 11. Best Practices

1. **Never expose tokens in URLs** - Use cookies or headers only
2. **Always use HTTPS in production** - Required for Secure cookies
3. **Implement token refresh** - For better UX with long sessions
4. **Log security events** - Track login attempts, logouts, token issues
5. **Rate limit auth endpoints** - Prevent brute force attacks
6. **Use strong JWT secrets** - In backend configuration
7. **Implement CSRF protection** - SameSite cookies help, but consider tokens
8. **Clear tokens on logout** - Both cookie and localStorage
9. **Handle token expiration gracefully** - Auto-logout with message
10. **Test edge cases** - Manual URL changes, browser back button, etc.

### 12. Future Enhancements

- [ ] Implement token refresh mechanism
- [ ] Add "Remember Me" functionality with longer-lived tokens
- [ ] Implement 2FA/MFA support
- [ ] Add session management (view/revoke active sessions)
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Implement rate limiting on auth endpoints
- [ ] Add audit logging for security events
- [ ] Implement JWT token rotation
- [ ] Add biometric authentication support

## Support

For issues or questions, contact the development team or refer to:
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- HTTP Cookies: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
- JWT Best Practices: https://tools.ietf.org/html/rfc8725

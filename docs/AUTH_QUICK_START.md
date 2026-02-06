# Authentication Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Environment Setup
```bash
# Copy environment file
cp .env.example .env.local

# Add your backend API URL
echo "NEXT_PUBLIC_API_URL=http://your-backend-url:8000/" >> .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Test Authentication
1. Visit http://localhost:3000
2. Login with test credentials
3. You should be redirected to /dashboard
4. Try accessing / again - you'll be redirected to /dashboard
5. Logout and verify you're redirected to /

## 📝 Common Tasks

### Protect a New Route
```typescript
// middleware.ts
const protectedRoutes = [
  '/dashboard', 
  '/profile', 
  '/settings',
  '/your-new-route'  // Add here
];
```

### Check Auth in Component
```jsx
'use client';
import { useAuth } from '@/app/components/AuthProvider';

export default function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Hello {user.full_name}</div>;
}
```

### Manual API Call with Auth
```javascript
import { fetchApi } from '@/app/lib/api';

// Token is automatically included
const data = await fetchApi('/api/users');
```

### Logout User
```jsx
import { useAuth } from '@/app/components/AuthProvider';

function LogoutButton() {
  const { logout } = useAuth();
  
  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

## 🔒 Security Checklist

- [x] HttpOnly cookies for token storage
- [x] Middleware protection for routes
- [x] Automatic redirect on auth state change
- [x] Token cleared on logout
- [x] CORS headers configured
- [x] SameSite cookie protection
- [ ] HTTPS in production (required!)
- [ ] Rate limiting on auth endpoints (backend)
- [ ] Token refresh mechanism (future)

## 🐛 Quick Troubleshooting

### Problem: Can't login
**Check:**
1. Is backend running? `curl http://your-backend-url:8000/`
2. Is NEXT_PUBLIC_API_URL set correctly?
3. Check browser console for errors
4. Check Network tab for API responses

### Problem: Redirected to login after successful login
**Check:**
1. Is cookie being set? Check Application > Cookies in DevTools
2. Is middleware running? Check console logs
3. Is token valid? Try decoding JWT at jwt.io

### Problem: Can access protected routes without login
**Check:**
1. Is middleware.ts in root directory?
2. Is matcher configuration correct?
3. Clear cookies and try again
4. Check that login page is at / (root), not /login

## 📚 Key Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection |
| `app/api/auth/login/route.js` | Login + set cookie |
| `app/api/auth/logout/route.js` | Logout + clear cookie |
| `app/lib/api.js` | API client + token management |
| `app/components/AuthProvider.js` | Auth context |

## 🎯 Testing Scenarios

1. **Login Flow**
   - Visit / → Should show login page
   - Login → Should redirect to /dashboard
   - Refresh page → Should stay on /dashboard

2. **Protected Routes**
   - Logout → Should redirect to /
   - Try /dashboard → Should redirect to /
   - Login → Should redirect back to /dashboard

3. **Auth Routes**
   - Login → Visit / → Should redirect to /dashboard
   - Logout → Visit / → Should show login page

4. **Manual URL Changes**
   - Login → Manually type / → Should redirect to /dashboard
   - Logout → Manually type /dashboard → Should redirect to /

## 💡 Pro Tips

1. **Check cookies in DevTools**: Application > Cookies > localhost
2. **Monitor middleware**: Check console for middleware logs
3. **Test in incognito**: Ensures clean state
4. **Use React DevTools**: Inspect AuthProvider state
5. **Check Network tab**: Verify API calls and responses

## 🔗 Related Documentation

- [Full Authentication Docs](./AUTHENTICATION.md)
- [API Client Usage](./api-client-usage.md)
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)

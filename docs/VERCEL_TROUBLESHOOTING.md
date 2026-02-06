# Vercel Deployment Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Issue 1: 404 Error on Vercel (Works Locally)

**Symptoms:**
- Login page shows 404 on Vercel
- Works fine on localhost
- URL shows: `https://your-app.vercel.app/`

**Possible Causes:**
1. Build failed to generate the page
2. Middleware is blocking the route
3. Route configuration issue

**Solutions:**

#### Solution A: Check Build Logs
```bash
# In Vercel dashboard:
1. Go to Deployments
2. Click on the latest deployment
3. Check "Building" logs for errors
4. Look for "Generating static pages" section
```

#### Solution B: Verify Page Exists
```bash
# Check if page.js exists
ls -la app/page.js

# Should show: app/page.js (login page)
```

#### Solution C: Check Middleware Configuration
```typescript
// middleware.ts should have:
const publicRoutes = ['/', '/signup'];

// And matcher should exclude API routes:
matcher: [
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
]
```

#### Solution D: Force Rebuild
```bash
# Clear Vercel cache and rebuild
vercel --prod --force
```

---

### Issue 2: Infinite Redirect Loop

**Symptoms:**
- Browser keeps redirecting between `/` and `/dashboard`
- Console shows multiple redirect logs
- Page never loads

**Possible Causes:**
1. Cookie not being set properly
2. Middleware logic conflict
3. Client-side and server-side auth state mismatch

**Solutions:**

#### Solution A: Check Cookie Settings
```javascript
// In app/api/auth/login/route.js
// Verify cookie is being set:
const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = [
  `auth_token=${token}`,
  'Path=/',
  'HttpOnly',
  'SameSite=Lax',
  'Max-Age=86400',
  isProduction ? 'Secure' : '', // Important!
].filter(Boolean).join('; ');
```

#### Solution B: Check Browser Cookies
1. Open DevTools > Application > Cookies
2. Look for `auth_token` cookie
3. Verify it has:
   - HttpOnly: ✓
   - SameSite: Lax
   - Secure: ✓ (on Vercel)
   - Path: /

#### Solution C: Check Middleware Logs
```bash
# In Vercel function logs, look for:
🔐 Middleware: { pathname: '/', hasToken: true/false, ... }

# If hasToken keeps changing, cookie isn't persisting
```

#### Solution D: Clear All Cookies
```javascript
// In browser console:
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Then refresh and try again
```

---

### Issue 3: Authentication Works Locally, Not on Vercel

**Symptoms:**
- Login works on localhost:3000
- Login fails on Vercel URL
- No error messages, just doesn't work

**Possible Causes:**
1. Environment variable not set
2. Backend not accessible from Vercel
3. CORS issues
4. Cookie domain mismatch

**Solutions:**

#### Solution A: Verify Environment Variable
```bash
# In Vercel dashboard:
1. Settings > Environment Variables
2. Check NEXT_PUBLIC_API_URL is set
3. Value should be: http://srv1029267.hstgr.cloud:8000/
4. Applied to: Production, Preview, Development
```

#### Solution B: Test Backend from Vercel
```bash
# Check Vercel function logs for API calls
# Look for:
🚀 API Request: POST /api/auth/login
❌ API Error: /api/auth/login Error: ...

# If you see network errors, backend isn't accessible
```

#### Solution C: Check CORS on Backend
```python
# FastAPI backend should have:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",
        "https://*.vercel.app",  # For preview deployments
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Solution D: Test Backend Directly
```bash
# From your local machine:
curl -X POST http://srv1029267.hstgr.cloud:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'

# Should return: {"access_token":"...","user":{...}}
```

---

### Issue 4: Cookies Not Being Set

**Symptoms:**
- Login appears successful
- But no cookie in DevTools
- Redirects don't work properly

**Possible Causes:**
1. Secure flag required but not set
2. SameSite too restrictive
3. Domain mismatch
4. Browser blocking third-party cookies

**Solutions:**

#### Solution A: Check Cookie Response Headers
```bash
# In DevTools > Network tab:
1. Click on login request
2. Check Response Headers
3. Look for: Set-Cookie: auth_token=...

# If missing, cookie isn't being set by server
```

#### Solution B: Verify Production Flag
```javascript
// In app/api/auth/login/route.js
const isProduction = process.env.NODE_ENV === 'production';
console.log('Is Production:', isProduction); // Should be true on Vercel

// Check Vercel function logs for this message
```

#### Solution C: Test in Incognito Mode
```
1. Open incognito/private window
2. Visit Vercel URL
3. Try login
4. Check if cookie is set

# This rules out browser extensions/settings
```

#### Solution D: Check Browser Console
```javascript
// Look for cookie warnings:
// "Cookie was blocked because it had the 'Secure' attribute but was not received over a secure connection"
// "Cookie was blocked due to user preferences"
```

---

### Issue 5: Environment Variable Not Working

**Symptoms:**
- Error: "NEXT_PUBLIC_API_URL is not configured"
- API calls fail with undefined URL
- Works locally but not on Vercel

**Possible Causes:**
1. Variable not set in Vercel
2. Variable set after deployment
3. Typo in variable name
4. Not applied to correct environment

**Solutions:**

#### Solution A: Verify Variable in Vercel
```bash
# In Vercel dashboard:
1. Settings > Environment Variables
2. Look for: NEXT_PUBLIC_API_URL
3. Check value is correct
4. Check it's applied to Production
```

#### Solution B: Redeploy After Setting Variable
```bash
# Environment variables are embedded at build time
# You MUST redeploy after changing them:

vercel --prod --force

# Or trigger redeploy in Vercel dashboard
```

#### Solution C: Check Variable Name
```javascript
// Must be exactly: NEXT_PUBLIC_API_URL
// Not: NEXT_PUBLIC_API_BASE_URL
// Not: API_URL
// Not: NEXT_PUBLIC_BACKEND_URL

// Check in your code:
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

#### Solution D: Check Build Logs
```bash
# In Vercel build logs, look for:
🔍 API URL Debug: {
  NEXT_PUBLIC_API_URL: 'http://srv1029267.hstgr.cloud:8000/',
  NODE_ENV: 'production',
  ...
}

# If undefined, variable isn't set correctly
```

---

### Issue 6: Protected Routes Accessible Without Login

**Symptoms:**
- Can access /dashboard without logging in
- Middleware not blocking routes
- No redirects happening

**Possible Causes:**
1. Middleware not running
2. Matcher configuration wrong
3. Cookie check failing silently

**Solutions:**

#### Solution A: Check Middleware Logs
```bash
# In Vercel function logs:
# Should see: 🔐 Middleware: { pathname: '/dashboard', ... }

# If missing, middleware isn't running
```

#### Solution B: Verify Middleware File Location
```bash
# Must be in root directory:
ls -la middleware.ts

# Not in app/ or src/
```

#### Solution C: Check Matcher Configuration
```typescript
// middleware.ts config should be:
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
};
```

#### Solution D: Test Middleware Locally
```bash
# Run locally and check console:
npm run dev

# Visit /dashboard without login
# Should see middleware logs and redirect
```

---

## 🔧 Debugging Tools

### 1. Vercel Function Logs
```bash
# Real-time logs:
vercel logs --follow

# Or in dashboard:
Deployments > [Your Deployment] > Functions
```

### 2. Browser DevTools
```javascript
// Check cookies:
Application > Cookies > [Your Domain]

// Check network:
Network > Filter: Fetch/XHR

// Check console:
Console > Look for errors
```

### 3. Test API Directly
```bash
# Test backend:
curl http://srv1029267.hstgr.cloud:8000/

# Test login endpoint:
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### 4. Check Build Output
```bash
# In Vercel build logs:
✓ Compiled successfully
✓ Generating static pages
✓ Collecting page data

# Look for errors in these sections
```

---

## 📋 Pre-Deployment Checklist

Before deploying to Vercel:

- [ ] `NEXT_PUBLIC_API_URL` set in Vercel dashboard
- [ ] Backend API is accessible from internet
- [ ] CORS configured on backend for Vercel domain
- [ ] Tested authentication locally
- [ ] Middleware logs show correct behavior
- [ ] Cookies being set properly locally
- [ ] No build errors: `npm run build`
- [ ] No TypeScript errors: `npm run type-check` (if applicable)
- [ ] Environment variables don't have trailing spaces
- [ ] Backend URL includes protocol (http:// or https://)

---

## 🆘 Still Having Issues?

### Step 1: Collect Information
```bash
# Gather these details:
1. Vercel deployment URL
2. Error message (exact text)
3. Browser console errors
4. Vercel function logs
5. Network tab showing failed requests
6. Environment variables (screenshot)
```

### Step 2: Check Documentation
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Full auth docs
- [AUTH_QUICK_START.md](./AUTH_QUICK_START.md) - Quick reference
- [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md) - Deployment guide

### Step 3: Common Quick Fixes
```bash
# 1. Clear Vercel cache and redeploy
vercel --prod --force

# 2. Clear browser cache and cookies
# DevTools > Application > Clear storage

# 3. Test in incognito mode
# Rules out browser extensions

# 4. Check backend is running
curl http://srv1029267.hstgr.cloud:8000/

# 5. Verify environment variable
# Vercel dashboard > Settings > Environment Variables
```

### Step 4: Enable Debug Mode
```javascript
// Add to middleware.ts temporarily:
console.log('🔍 Debug:', {
  pathname: request.nextUrl.pathname,
  cookies: request.cookies.getAll(),
  headers: Object.fromEntries(request.headers.entries()),
});

// Check Vercel function logs for output
```

---

## 📞 Support Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [HTTP Cookies MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Vercel Support](https://vercel.com/support)

---

## 🎯 Quick Reference

### Working Configuration

**Environment Variable:**
```
NEXT_PUBLIC_API_URL=http://srv1029267.hstgr.cloud:8000/
```

**Cookie Settings (Production):**
```javascript
HttpOnly: true
SameSite: Lax
Secure: true
Path: /
Max-Age: 86400
```

**Middleware Routes:**
```typescript
Public: ['/', '/signup']
Protected: ['/dashboard', '/profile', '/settings']
```

**Expected Behavior:**
- Unauthenticated + `/dashboard` → Redirect to `/`
- Authenticated + `/` → Redirect to `/dashboard`
- Login success → Set cookie → Redirect to `/dashboard`
- Logout → Clear cookie → Redirect to `/`

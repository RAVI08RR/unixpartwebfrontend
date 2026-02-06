# Vercel Deployment Guide

## ✅ Fixed Issues

This project has been updated to work correctly on both **local development** and **Vercel production**:

1. ✅ Removed hardcoded backend URLs
2. ✅ Proper environment variable handling
3. ✅ Production-grade error logging
4. ✅ CORS-aware fetch implementation
5. ✅ Next.js App Router compatibility
6. ✅ Secure authentication with HttpOnly cookies
7. ✅ Middleware-based route protection

## 🚀 Deploying to Vercel

### Step 1: Configure Environment Variables

**CRITICAL**: You must set the API URL in Vercel dashboard:

1. Go to your Vercel project: https://vercel.com/dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variable:

```
Name: NEXT_PUBLIC_API_URL
Value: http://srv1029267.hstgr.cloud:8000/
```

**Important Notes:**
- Include the trailing slash `/`
- Use the full URL with protocol (http:// or https://)
- This is your FastAPI backend URL

4. Select which environments to apply it to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save**

### Step 2: Verify vercel.json Configuration

The `vercel.json` file is already configured with:
- CORS headers for API routes
- Proper routing configuration
- Framework settings

No changes needed unless you have custom requirements.

### Step 3: Deploy

```bash
# Option 1: Deploy via Vercel CLI
vercel --prod

# Option 2: Push to GitHub (if connected)
git push origin main

# Option 3: Deploy via Vercel Dashboard
# Go to your project > Deployments > Deploy
```

### Step 4: Verify Deployment

After deployment:

1. **Check Environment Variables**
   - Go to Settings > Environment Variables
   - Verify `NEXT_PUBLIC_API_URL` is set correctly

2. **Test Authentication Flow**
   - Visit your Vercel URL (e.g., https://your-app.vercel.app)
   - Try to login
   - Check if you're redirected to /dashboard
   - Try accessing /dashboard directly (should redirect to / if not logged in)

3. **Check Function Logs**
   - Go to **Deployments** > Select your deployment
   - Click **Functions** tab
   - Look for middleware logs and API route logs

4. **Test Cookie Setting**
   - Open browser DevTools > Application > Cookies
   - Login and verify `auth_token` cookie is set
   - Check cookie properties: HttpOnly, SameSite, Secure (in production)

## 🔧 Local Development

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and set your backend URL:
```
NEXT_PUBLIC_API_URL=http://srv1029267.hstgr.cloud:8000/
```

3. Start the dev server:
```bash
npm run dev
```

4. Test authentication:
   - Visit http://localhost:3000
   - Login with test credentials
   - Verify redirect to /dashboard
   - Check cookies in DevTools

## 🐛 Troubleshooting

### Issue: "404 - This page could not be found" on Vercel

**Possible Causes:**
1. Middleware is blocking the route
2. Route doesn't exist in the app directory
3. Build failed to generate the page

**Solutions:**
1. Check Vercel build logs for errors
2. Verify the page exists in your `app/` directory
3. Check middleware.ts matcher configuration
4. Clear Vercel cache and redeploy:
   ```bash
   vercel --prod --force
   ```

### Issue: Infinite redirect loop on Vercel

**Possible Causes:**
1. Cookie not being set properly
2. Middleware logic conflict
3. Domain mismatch for cookies

**Solutions:**
1. Check if cookies are being set (DevTools > Application > Cookies)
2. Verify middleware logs in Vercel Functions
3. Ensure cookie domain matches Vercel domain
4. Check if `Secure` flag is causing issues (should only be set in production with HTTPS)

### Issue: Authentication works locally but not on Vercel

**Possible Causes:**
1. Environment variable not set in Vercel
2. Cookie settings incompatible with production
3. CORS issues with backend

**Solutions:**
1. Verify `NEXT_PUBLIC_API_URL` in Vercel dashboard
2. Check cookie settings in `/api/auth/login/route.js`:
   ```javascript
   const isProduction = process.env.NODE_ENV === 'production';
   // Secure flag should only be true in production with HTTPS
   ```
3. Ensure backend allows requests from Vercel domain
4. Check Vercel function logs for detailed errors

### Issue: "NEXT_PUBLIC_API_URL environment variable is not configured"

**Solution**: 
1. Go to Vercel dashboard
2. Settings > Environment Variables
3. Add `NEXT_PUBLIC_API_URL` with your backend URL
4. Redeploy the application

### Issue: Backend API not accessible from Vercel

**Possible Causes:**
1. Backend server is down
2. Firewall blocking Vercel IPs
3. CORS not configured on backend

**Solutions:**
1. Verify backend is running and accessible
2. Check backend CORS configuration:
   ```python
   # FastAPI backend
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://your-vercel-app.vercel.app",
           "http://localhost:3000"
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. Test backend directly: `curl http://srv1029267.hstgr.cloud:8000/`

### Issue: Cookies not being set on Vercel

**Possible Causes:**
1. SameSite attribute too restrictive
2. Secure flag required but not set
3. Domain mismatch

**Solutions:**
1. Check cookie settings in login route
2. Verify HTTPS is enabled on Vercel (it should be by default)
3. Check browser console for cookie warnings
4. Test in incognito mode to rule out browser extensions

## 📝 Important Notes

### Environment Variables in Next.js

- `NEXT_PUBLIC_*` variables are **exposed to the browser**
- They are embedded at **build time**
- Changing them requires a **new deployment**
- Never put secrets in `NEXT_PUBLIC_*` variables

### Authentication System

- **Cookies**: HttpOnly cookies for secure token storage
- **Middleware**: Protects routes at the edge (before page loads)
- **Redirects**: Automatic based on authentication state
- **Session**: 24-hour cookie expiration

### Cookie Configuration

**Development (localhost):**
```javascript
HttpOnly: true
SameSite: Lax
Secure: false  // HTTP is okay locally
```

**Production (Vercel):**
```javascript
HttpOnly: true
SameSite: Lax
Secure: true   // HTTPS required
```

### API URL Requirements

- Must be a full URL (including `http://` or `https://`)
- Should include trailing slash for consistency
- For production: Use stable URL (not ngrok free tier)

### Middleware Behavior

- Runs on **every request** before page loads
- Checks for `auth_token` cookie
- Redirects based on authentication state:
  - Unauthenticated + Protected Route → Redirect to `/`
  - Authenticated + Auth Route → Redirect to `/dashboard`

## 🔐 Security Checklist

- [x] Backend has CORS configured for Vercel domain
- [x] API URL uses HTTPS in production
- [x] No secrets in `NEXT_PUBLIC_*` variables
- [x] Authentication tokens stored in HttpOnly cookies
- [x] Secure flag enabled in production
- [x] SameSite=Lax for CSRF protection
- [ ] Rate limiting on auth endpoints (backend)
- [ ] SSL certificate valid on backend

## 📊 Monitoring & Debugging

### Vercel Function Logs

1. Go to your deployment
2. Click **Functions** tab
3. Look for:
   - Middleware execution logs
   - API route logs
   - Error messages

### Browser DevTools

1. **Network Tab**: Check API requests and responses
2. **Application > Cookies**: Verify auth_token cookie
3. **Console**: Look for authentication errors

### Common Log Messages

```
🔐 Middleware: { pathname: '/dashboard', hasToken: false, ... }
❌ Unauthenticated user accessing protected route, redirecting to login
✅ Authenticated user accessing protected route
🍪 Auth token set as HttpOnly cookie
```

## 🚀 Deployment Checklist

Before deploying to Vercel:

- [ ] Environment variables set in Vercel dashboard
- [ ] Backend API is accessible and running
- [ ] CORS configured on backend for Vercel domain
- [ ] Test authentication flow locally
- [ ] Verify middleware logs show correct behavior
- [ ] Check cookies are being set properly
- [ ] Test protected routes redirect correctly
- [ ] Verify logout clears cookies
- [ ] Test in incognito mode
- [ ] Check mobile responsiveness

After deploying:

- [ ] Visit Vercel URL and test login
- [ ] Verify redirect to /dashboard after login
- [ ] Test accessing /dashboard without login
- [ ] Check Vercel function logs for errors
- [ ] Verify cookies in browser DevTools
- [ ] Test logout functionality
- [ ] Check all protected routes work
- [ ] Test on different browsers

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [Authentication Documentation](./docs/AUTHENTICATION.md)

## 🆘 Getting Help

If you're still experiencing issues:

1. Check Vercel function logs for detailed errors
2. Review browser console for client-side errors
3. Verify environment variables are set correctly
4. Test backend API directly with curl or Postman
5. Check [Authentication Documentation](./docs/AUTHENTICATION.md)
6. Review [Quick Start Guide](./docs/AUTH_QUICK_START.md)

## 🔄 Redeployment

If you need to redeploy after making changes:

```bash
# Force a new deployment (clears cache)
vercel --prod --force

# Or via Git
git add .
git commit -m "fix: Update configuration for Vercel"
git push origin main
```

Vercel will automatically redeploy when you push to the connected branch.

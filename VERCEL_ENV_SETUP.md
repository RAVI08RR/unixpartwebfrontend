# Vercel Environment Variables Setup

## Required Environment Variables

To ensure profile images and all API calls work correctly on Vercel, you need to set the following environment variable in your Vercel project settings:

### 1. NEXT_PUBLIC_API_URL

This is the URL of your FastAPI backend server.

**Steps to set in Vercel:**

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add a new environment variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `http://srv1029267.hstgr.cloud:8000`
   - **Environment:** Select all (Production, Preview, Development)

5. Click "Save"
6. Redeploy your application for changes to take effect

### Important Notes:

- The `NEXT_PUBLIC_` prefix is required for environment variables that need to be accessible in the browser
- Without this variable, profile images and API calls will fail
- After adding the environment variable, you must redeploy your application
- You can trigger a redeploy by:
  - Pushing a new commit to your repository
  - Or going to Deployments tab and clicking "Redeploy" on the latest deployment

### Verification:

After redeploying, you can verify the environment variable is set by:
1. Opening your deployed app
2. Opening browser console
3. Checking if profile images load correctly
4. The console should show the correct API URL in the logs

### Troubleshooting:

If profile images still don't load after setting the environment variable:

1. **Check the environment variable value:**
   - Make sure there are no trailing slashes
   - Make sure the URL is correct and accessible
   - Example: `http://srv1029267.hstgr.cloud:8000` (no trailing slash)

2. **Check CORS settings on your backend:**
   - Your FastAPI backend must allow requests from your Vercel domain
   - Add your Vercel domain to the CORS allowed origins

3. **Check image paths:**
   - Profile images should be stored at: `uploads/profiles/users/{uuid}.{ext}`
   - The backend should serve these files correctly

4. **Check browser console:**
   - Look for any CORS errors
   - Look for 404 errors on image URLs
   - Check the constructed image URLs in the console logs

### Example Environment Variable Values:

**Development:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Production:**
```
NEXT_PUBLIC_API_URL=http://srv1029267.hstgr.cloud:8000
```

**With ngrok (for testing):**
```
NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app
```

## Additional Configuration

### NODE_TLS_REJECT_UNAUTHORIZED (Optional)

Only needed if your backend uses self-signed SSL certificates in development.

- **Name:** `NODE_TLS_REJECT_UNAUTHORIZED`
- **Value:** `0`
- **Environment:** Development only (not recommended for production)

**Warning:** Do not use this in production as it disables SSL certificate verification.

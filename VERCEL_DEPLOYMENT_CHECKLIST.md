# Vercel Deployment Checklist for Profile Images

## ✅ Steps to Fix Profile Images on Vercel

### 1. Set Environment Variable in Vercel
- [ ] Go to your Vercel project: https://vercel.com/dashboard
- [ ] Click on your project (unixpartwebfrontend)
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add new variable:
  - **Name:** `NEXT_PUBLIC_API_URL`
  - **Value:** `http://srv1029267.hstgr.cloud:8000`
  - **Environments:** Check all (Production, Preview, Development)
- [ ] Click **Save**

### 2. Redeploy Your Application
After adding the environment variable, you MUST redeploy:

**Option A: Automatic (Recommended)**
- [ ] The push to GitHub will automatically trigger a new deployment
- [ ] Wait for the deployment to complete (check Vercel dashboard)

**Option B: Manual**
- [ ] Go to **Deployments** tab in Vercel
- [ ] Click on the latest deployment
- [ ] Click **Redeploy** button
- [ ] Select "Use existing Build Cache" (faster) or "Rebuild" (if issues persist)

### 3. Verify the Fix
After deployment completes:

- [ ] Open your Vercel app URL
- [ ] Go to User Management page
- [ ] Check if profile images are loading
- [ ] Open browser console (F12)
- [ ] Look for log messages like: `🖼️ Profile image URL: {...}`
- [ ] Verify the URL shows: `http://srv1029267.hstgr.cloud:8000/uploads/profiles/users/...`

### 4. Test Profile Image Upload
- [ ] Try uploading a new profile image
- [ ] Check if it displays immediately after upload
- [ ] Refresh the page and verify image persists

## 🔍 Troubleshooting

### If images still don't load:

1. **Check Environment Variable:**
   ```bash
   # In Vercel dashboard, verify:
   NEXT_PUBLIC_API_URL=http://srv1029267.hstgr.cloud:8000
   # No trailing slash!
   ```

2. **Check Browser Console:**
   - Look for the log: `🖼️ Profile image URL:`
   - Check if the URL is correct
   - Look for CORS errors
   - Look for 404 errors

3. **Check Backend CORS:**
   Your FastAPI backend must allow requests from Vercel domain:
   ```python
   # In your FastAPI app
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://your-vercel-app.vercel.app",
           "http://localhost:3000",
           # ... other origins
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. **Check Image File Serving:**
   - Verify backend serves files from `uploads/profiles/users/` directory
   - Check file permissions on the server
   - Test image URL directly in browser: `http://srv1029267.hstgr.cloud:8000/uploads/profiles/users/test.png`

5. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or open in incognito/private window

## 📝 Notes

- Environment variables with `NEXT_PUBLIC_` prefix are embedded at build time
- Changes to environment variables require a redeploy
- The fallback URL is hardcoded but environment variable takes precedence
- Profile images are stored on your backend server, not on Vercel
- Vercel only serves the Next.js frontend; images come from your FastAPI backend

## 🎯 Expected Result

After completing these steps:
- ✅ Profile images load in user listing
- ✅ Profile images show in view modal
- ✅ Profile images show in delete confirmation
- ✅ New uploads work correctly
- ✅ No console errors related to images
- ✅ Images load from: `http://srv1029267.hstgr.cloud:8000/uploads/...`

## 📞 Need Help?

If issues persist after following all steps:
1. Check the browser console for specific error messages
2. Check Vercel deployment logs for build errors
3. Verify the backend API is accessible from Vercel's servers
4. Test the image URLs directly in your browser

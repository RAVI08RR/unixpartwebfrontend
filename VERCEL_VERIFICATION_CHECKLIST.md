# Vercel Deployment Verification Checklist

## ✅ Step-by-Step Verification

### 1. Check Vercel Deployment Status

Go to: https://vercel.com/dashboard

- [ ] Check if latest deployment is complete
- [ ] Look for commit: `16c7ca8 - docs: Add comprehensive mixed content solution documentation`
- [ ] Deployment status should be: **Ready** ✅
- [ ] If still deploying, wait for it to complete

### 2. Verify Environment Variable

In Vercel Dashboard → Your Project → Settings → Environment Variables:

- [ ] Check if `NEXT_PUBLIC_API_URL` exists
- [ ] Value should be: `http://srv1029267.hstgr.cloud:8000`
- [ ] Should be enabled for: Production, Preview, Development
- [ ] If missing or wrong, add/update it and redeploy

### 3. Test Profile Image Upload on Vercel

Open your Vercel app: `https://unixpartwebfrontend.vercel.app`

#### Test Upload:
1. [ ] Go to User Management
2. [ ] Click "Edit" on any user
3. [ ] Upload a profile image
4. [ ] Open browser console (F12)
5. [ ] Look for these logs:

**Expected logs:**
```
📸 Uploading profile image: {userId: 1, fileName: "...", ...}
📸 Upload response status: 200
✅ Profile image uploaded successfully: {message: "...", profile_image: "..."}
```

**Should NOT see:**
```
❌ Mixed Content error
❌ ERR_SSL_PROTOCOL_ERROR
❌ Network error
```

#### Test Display:
1. [ ] Go to User Management listing
2. [ ] Check if profile images are visible
3. [ ] Open browser console (F12)
4. [ ] Look for these logs:

**Expected logs:**
```
🖼️ Profile image URL: {originalPath: "uploads/...", proxyUrl: "/api/images/..."}
```

**Check Network tab:**
- [ ] Image requests should go to: `/api/images/uploads/profiles/users/...`
- [ ] Status should be: `200 OK`
- [ ] Should NOT see requests to: `http://srv1029267.hstgr.cloud:8000/...`

### 4. Test Proxy Routes Directly

Open these URLs in your browser:

#### Test Image Proxy:
```
https://unixpartwebfrontend.vercel.app/api/images/uploads/profiles/users/9f5e61a3-ac84-4f6a-a7b5-ba6da747908f.png
```

**Expected:** Image displays or 404 if image doesn't exist
**Should NOT see:** Mixed content error or SSL error

#### Test Upload Proxy (using curl or Postman):
```bash
curl -X POST \
  'https://unixpartwebfrontend.vercel.app/api/users/2/upload-profile-image' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'file=@test-image.png'
```

**Expected:** 
```json
{
  "message": "Profile image uploaded successfully",
  "profile_image": "uploads/profiles/users/xxx.png"
}
```

### 5. Common Issues and Solutions

#### Issue: "Environment variable not found"

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `NEXT_PUBLIC_API_URL` = `http://srv1029267.hstgr.cloud:8000`
3. Redeploy the application

#### Issue: "Still seeing old code"

**Solution:**
1. Check Vercel deployment logs
2. Verify latest commit is deployed
3. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Or open in incognito/private window

#### Issue: "404 on proxy routes"

**Solution:**
1. Verify files exist in repository:
   - `app/api/images/[...path]/route.js`
   - `app/api/users/[id]/upload-profile-image/route.js`
2. Check Vercel build logs for errors
3. Redeploy if needed

#### Issue: "Images still not loading"

**Solution:**
1. Check browser console for errors
2. Check Network tab to see where requests are going
3. Verify proxy routes are being used (not direct backend URLs)
4. Check if backend is accessible from Vercel servers

### 6. Verify Backend Accessibility

Test if Vercel can reach your backend:

```bash
# From your local machine
curl http://srv1029267.hstgr.cloud:8000/api/users/

# Should return user list
```

If this works locally but not from Vercel:
- [ ] Check if backend firewall allows Vercel IPs
- [ ] Check if backend is publicly accessible
- [ ] Check backend logs for blocked requests

### 7. Check Vercel Logs

In Vercel Dashboard → Your Project → Deployments → Latest → View Function Logs

Look for:
- [ ] `Image proxy - Fetching: http://srv1029267.hstgr.cloud:8000/...`
- [ ] `Image proxy - Success: {...}`
- [ ] `Upload profile image proxy - Backend response status: 200`

If you see errors:
- [ ] Check the error message
- [ ] Verify backend is accessible
- [ ] Check authentication tokens

## ✅ Success Criteria

Your deployment is working correctly if:

✅ Profile images display in user listing
✅ Profile images display in view/edit modals  
✅ New profile images can be uploaded
✅ No mixed content errors in console
✅ No SSL protocol errors in console
✅ Image requests go to `/api/images/...` (not direct backend)
✅ Upload requests go to `/api/users/.../upload-profile-image` (not direct backend)
✅ Browser console shows successful logs

## 🔧 Quick Fixes

### Force Redeploy

If nothing works:

1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Click "..." menu → "Redeploy"
4. Select "Use existing Build Cache" or "Rebuild" if issues persist

### Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use incognito/private window

### Verify Latest Code

Check if these files exist in your Vercel deployment:

```
app/api/images/[...path]/route.js
app/api/users/[id]/upload-profile-image/route.js
```

You can verify by checking the GitHub repository or Vercel source code viewer.

## 📞 Still Having Issues?

If you've completed all steps and it's still not working:

1. **Check Vercel deployment logs** for specific errors
2. **Check browser console** for detailed error messages
3. **Check Network tab** to see actual requests being made
4. **Test proxy routes directly** using curl or Postman
5. **Verify backend is accessible** from external networks

## 📝 Notes

- Changes to environment variables require a redeploy
- Proxy routes work in both local and production
- Images are cached for 1 year for performance
- First load may be slower due to proxy overhead
- Subsequent loads are fast due to caching

# Mixed Content Solution for Profile Images

## Problem

When deploying to Vercel (HTTPS), the application couldn't load profile images or upload new ones because:

1. **Vercel serves the app over HTTPS** (secure)
2. **Backend server uses HTTP** (not secure)
3. **Browsers block HTTP requests from HTTPS pages** (Mixed Content Policy)

### Errors Encountered:

```
Mixed Content: The page at 'https://unixpartwebfrontend.vercel.app/...' 
was loaded over HTTPS, but requested an insecure resource 
'http://srv1029267.hstgr.cloud:8000/...'. This request has been blocked.

ERR_SSL_PROTOCOL_ERROR
```

## Solution: API Proxy Routes

We created two Next.js API proxy routes that act as a bridge between the HTTPS frontend and HTTP backend:

### 1. Image Display Proxy (`/api/images/[...path]/route.js`)

**Purpose:** Serves profile images through HTTPS

**How it works:**
```
Browser (HTTPS) → /api/images/uploads/profiles/users/image.png (HTTPS)
                  ↓
                  Vercel Next.js API fetches from backend (HTTP)
                  ↓
                  Returns image to browser (HTTPS)
```

**Features:**
- Handles any image path dynamically
- Adds 1-year cache headers for performance
- Proper error handling
- Works in both local and production

**Example:**
```javascript
// Before (blocked by browser):
https://srv1029267.hstgr.cloud:8000/uploads/profiles/users/image.png

// After (works):
/api/images/uploads/profiles/users/image.png
```

### 2. Image Upload Proxy (`/api/users/[id]/upload-profile-image/route.js`)

**Purpose:** Handles profile image uploads through HTTPS

**How it works:**
```
Browser (HTTPS) → /api/users/1/upload-profile-image (HTTPS)
                  ↓
                  Vercel Next.js API forwards to backend (HTTP)
                  ↓
                  Returns success response (HTTPS)
```

**Features:**
- Forwards FormData to backend
- Maintains authentication headers
- 30-second timeout for large uploads
- Proper error handling

## Implementation Details

### Files Created:

1. **`app/api/images/[...path]/route.js`**
   - Catch-all route for any image path
   - Fetches from HTTP backend
   - Serves via HTTPS to browser

2. **`app/api/users/[id]/upload-profile-image/route.js`**
   - Proxies upload requests
   - Forwards FormData and auth headers
   - Returns backend response

### Files Modified:

1. **`app/lib/services/userService.js`**
   - `uploadProfileImage`: Now uses `/api/users/${userId}/upload-profile-image`
   - `getProfileImageUrl`: Now returns `/api/images/${imagePath}`

## Benefits

✅ **Works on HTTPS (Vercel)** - No mixed content errors
✅ **Works on HTTP (Local)** - Proxy routes work locally too
✅ **No backend changes needed** - Backend stays on HTTP
✅ **Better performance** - Images cached for 1 year
✅ **Secure** - All traffic encrypted between browser and Vercel
✅ **Transparent** - Frontend code doesn't need to know about HTTP/HTTPS

## How Images Flow

### Display Flow:
```
1. User opens page
2. Frontend calls: userService.getProfileImageUrl('uploads/profiles/users/image.png')
3. Returns: '/api/images/uploads/profiles/users/image.png'
4. Browser requests: GET /api/images/uploads/profiles/users/image.png (HTTPS)
5. Vercel API fetches: http://srv1029267.hstgr.cloud:8000/uploads/profiles/users/image.png
6. Vercel returns image to browser (HTTPS)
7. Browser displays image ✅
```

### Upload Flow:
```
1. User selects image
2. Frontend calls: userService.uploadProfileImage(userId, file)
3. Sends to: POST /api/users/1/upload-profile-image (HTTPS)
4. Vercel API forwards to: http://srv1029267.hstgr.cloud:8000/api/users/1/upload-profile-image
5. Backend saves image and returns path
6. Vercel returns success to browser (HTTPS)
7. Image uploaded ✅
```

## Testing

After deployment, verify:

1. **Profile images display correctly**
   - Check user listing page
   - Check user view modal
   - Check user edit page

2. **No console errors**
   - Open browser console (F12)
   - Should see: `🖼️ Profile image URL: { originalPath: '...', proxyUrl: '/api/images/...' }`
   - No mixed content errors
   - No SSL protocol errors

3. **Image uploads work**
   - Try uploading a new profile image
   - Should see: `📸 Uploading profile image:` in console
   - Should see: `✅ Profile image uploaded successfully:` in console
   - Image should display immediately

4. **Images load from proxy**
   - Check Network tab in browser DevTools
   - Image requests should go to: `/api/images/uploads/...`
   - Status should be: `200 OK`

## Performance Considerations

- **Caching:** Images cached for 1 year (`Cache-Control: public, max-age=31536000, immutable`)
- **First load:** Slightly slower (proxy overhead)
- **Subsequent loads:** Fast (served from browser cache)
- **Vercel edge caching:** Images may be cached at Vercel's edge network

## Alternative Solutions (Future)

While the proxy solution works perfectly, you could also:

### Option 1: Enable HTTPS on Backend (Recommended)
- Install SSL certificate on `srv1029267.hstgr.cloud`
- Use Let's Encrypt (free)
- Update `NEXT_PUBLIC_API_URL` to use `https://`
- Remove proxy routes (direct connection)

### Option 2: Use Cloudflare
- Put backend behind Cloudflare
- Cloudflare provides free SSL
- Update `NEXT_PUBLIC_API_URL` to Cloudflare URL
- Remove proxy routes

### Option 3: Store Images on CDN
- Upload images to AWS S3, Cloudinary, or similar
- Serve images from CDN (HTTPS)
- Keep proxy for uploads only

## Troubleshooting

### Images still not loading?

1. **Check Vercel deployment**
   - Ensure latest code is deployed
   - Check deployment logs for errors

2. **Check environment variable**
   - Verify `NEXT_PUBLIC_API_URL` is set in Vercel
   - Should be: `http://srv1029267.hstgr.cloud:8000`

3. **Check browser console**
   - Look for proxy URL: `/api/images/...`
   - Check for any error messages

4. **Check Network tab**
   - See if requests are going to proxy route
   - Check response status codes

5. **Test proxy directly**
   - Open: `https://your-app.vercel.app/api/images/uploads/profiles/users/test.png`
   - Should either show image or error message

### Uploads still failing?

1. **Check console logs**
   - Look for: `📸 Uploading profile image:`
   - Check error messages

2. **Check backend logs**
   - Verify backend received the upload request
   - Check for backend errors

3. **Test upload endpoint**
   - Use Postman or curl to test backend directly
   - Verify backend upload functionality works

## Summary

The proxy solution elegantly solves the mixed content problem by:
- Acting as a secure bridge between HTTPS frontend and HTTP backend
- Requiring no backend changes
- Working transparently in all environments
- Providing good performance with caching
- Maintaining security between browser and Vercel

This is a production-ready solution that will work reliably until you can enable HTTPS on your backend server.

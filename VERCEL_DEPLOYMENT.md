# Vercel Deployment Guide

## ✅ Fixed Issues

This project has been updated to work correctly on both **local development** and **Vercel production**:

1. ✅ Removed hardcoded backend URLs
2. ✅ Proper environment variable handling
3. ✅ Production-grade error logging
4. ✅ CORS-aware fetch implementation
5. ✅ Next.js App Router compatibility

## 🚀 Deploying to Vercel

### Step 1: Configure Environment Variables

**CRITICAL**: You must set the API URL in Vercel dashboard:

1. Go to your Vercel project
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variable:

```
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-url.ngrok-free.app
```

4. Select which environments to apply it to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save**

### Step 2: Deploy

```bash
# Option 1: Deploy via Vercel CLI
vercel --prod

# Option 2: Push to GitHub (if connected)
git push origin main
```

### Step 3: Verify

After deployment, check Vercel function logs:

1. Go to **Deployments** > Select your deployment
2. Click **Functions** tab
3. Look for any errors related to `NEXT_PUBLIC_API_URL`

## 🔧 Local Development

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and set your ngrok URL:
```
NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app
```

3. Start the dev server:
```bash
npm run dev
```

## 🐛 Troubleshooting

### Error: "NEXT_PUBLIC_API_URL environment variable is not configured"

**Solution**: Set the environment variable in Vercel dashboard (see Step 1 above)

### Error: "Network error: Unable to connect to the API"

**Possible causes**:
1. Backend server is down
2. CORS not configured on backend
3. ngrok URL expired (ngrok free tier URLs expire)
4. Firewall blocking the request

**Solutions**:
- Verify backend is running
- Check ngrok URL is current
- Add CORS headers to FastAPI backend:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://your-vercel-app.vercel.app"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

### Production logs show "Failed to fetch"

**Check**:
1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. Ensure backend accepts requests from Vercel domain
3. Check Vercel function logs for detailed error messages

## 📝 Important Notes

### Environment Variables in Next.js

- `NEXT_PUBLIC_*` variables are **exposed to the browser**
- They are embedded at **build time**
- Changing them requires a **new deployment**
- Never put secrets in `NEXT_PUBLIC_*` variables

### API URL Requirements

- Must be a full URL (including `https://`)
- Should NOT have trailing slash (handled automatically)
- For ngrok: Use the full ngrok URL

### Production vs Development

- **Development**: Falls back to `http://localhost:8000` if not set
- **Production**: Throws error if not configured (fail-fast)

## 🔐 Security Checklist

- [ ] Backend has CORS configured for Vercel domain
- [ ] API URL uses HTTPS (not HTTP)
- [ ] No secrets in `NEXT_PUBLIC_*` variables
- [ ] Authentication tokens stored in httpOnly cookies (if applicable)

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)

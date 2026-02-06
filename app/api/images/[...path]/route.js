/**
 * Image Proxy Route
 * Proxies image requests to avoid mixed content errors
 * Handles: /api/images/uploads/profiles/users/filename.png
 */

export async function GET(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { path } = await params;
    
    // Validate path
    if (!path || !Array.isArray(path) || path.length === 0) {
      console.error('Image proxy - Invalid path:', path);
      return new Response('Invalid image path', { status: 400 });
    }
    
    // Reconstruct the full path
    const imagePath = path.join('/');
    
    // Get API base URL (force HTTP)
    let apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    // Force HTTP protocol (backend doesn't support HTTPS)
    apiBaseUrl = apiBaseUrl.replace('https://', 'http://');
    
    // Construct the backend URL
    const backendUrl = `${apiBaseUrl}/${imagePath}`;
    
    console.log('Image proxy - Fetching:', backendUrl);
    
    // Fetch the image from the backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      console.error('Image proxy - Backend returned:', response.status);
      return new Response('Image not found', { status: response.status });
    }
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    console.log('Image proxy - Success:', {
      path: imagePath,
      contentType,
      size: imageBuffer.byteLength
    });
    
    // Return the image with proper headers
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

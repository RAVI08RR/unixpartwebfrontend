/**
 * Profile Image Upload Proxy Route
 * Proxies image uploads to avoid mixed content errors
 */

export async function POST(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id } = await params;
    
    // Validate the user ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Upload profile image proxy - Invalid user ID:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid user ID', 
          details: 'User ID is required and must be a valid number' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Convert to integer and validate
    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) {
      console.error('Upload profile image proxy - Invalid user ID format:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid user ID format', 
          details: 'User ID must be a positive integer' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Get the form data from the request
    const formData = await request.formData();
    
    console.log('Upload profile image proxy - User ID:', userId);
    console.log('Upload profile image proxy - API Base URL:', apiBaseUrl);
    console.log('Upload profile image proxy - Auth header present:', !!authHeader);
    console.log('Upload profile image proxy - Form data keys:', Array.from(formData.keys()));
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/users/${userId}/upload-profile-image`;
    console.log('Upload profile image proxy - Backend URL:', backendUrl);
    
    const headers = {
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(30000), // 30 second timeout for image upload
    });
    
    console.log('Upload profile image proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Upload profile image proxy - Backend response data length:', data.length);
    
    // Forward the response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Upload profile image proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload profile image',
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

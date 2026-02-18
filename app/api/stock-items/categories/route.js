/**
 * Stock Items Categories API Proxy Route
 * Proxies requests to the FastAPI backend for categories
 */

export async function GET(request) {
  try {
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    const backendUrl = `${apiBaseUrl}/api/stock-items/categories`;
    
    console.log('Categories proxy - Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    console.log('Categories proxy - Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Categories proxy - Backend error:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('Categories proxy - Success, categories count:', Array.isArray(data) ? data.length : 'unknown');
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Categories proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Categories proxy failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Stock Items API Proxy Route
 * Proxies requests to the FastAPI backend
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';
    const parent_id = searchParams.get('parent_id');
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://d7fc9ee6fefb.ngrok-free.app').replace(/\/+$/, '');
    
    // Build backend URL with query parameters
    let backendUrl = `${apiBaseUrl}/api/stock-items/?skip=${skip}&limit=${limit}`;
    if (parent_id) {
      backendUrl += `&parent_id=${parent_id}`;
    }
    
    console.log('Stock Items proxy - Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    console.log('Stock Items proxy - Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stock Items proxy - Backend error:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('Stock Items proxy - Success, items count:', Array.isArray(data) ? data.length : 'unknown');
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Stock Items proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Stock Items proxy failed', 
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

export async function POST(request) {
  try {
    const stockItemData = await request.json();
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://d7fc9ee6fefb.ngrok-free.app').replace(/\/+$/, '');
    const backendUrl = `${apiBaseUrl}/api/stock-items/`;
    
    console.log('Stock Items proxy - Create URL:', backendUrl);
    console.log('Stock Items proxy - Create data:', stockItemData);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(stockItemData),
    });
    
    console.log('Stock Items proxy - Create response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stock Items proxy - Create error:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('Stock Items proxy - Create success:', data);
    
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Stock Items proxy create error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Stock Items create proxy failed', 
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
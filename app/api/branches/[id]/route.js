/**
 * Branch by ID API Proxy Route
 * Proxies requests to the FastAPI backend for individual branch operations
 */

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;
    
    // Convert ID to integer to match backend expectations
    const branchId = parseInt(id, 10);
    
    if (isNaN(branchId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid branch ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    const backendUrl = `${apiBaseUrl}/api/branches/${branchId}`;
    
    console.log('Branch by ID proxy - Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    console.log('Branch by ID proxy - Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Branch by ID proxy - Backend error:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('Branch by ID proxy - Success');
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Branch by ID proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Branch by ID proxy failed', 
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

export async function PUT(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;
    const branchData = await request.json();
    
    // Convert ID to integer to match backend expectations
    const branchId = parseInt(id, 10);
    
    if (isNaN(branchId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid branch ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    const backendUrl = `${apiBaseUrl}/api/branches/${branchId}`;
    
    console.log('Branch update proxy - Backend URL:', backendUrl);
    console.log('Branch update proxy - Data:', branchData);
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(branchData),
    });
    
    console.log('Branch update proxy - Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Branch update proxy - Backend error:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('Branch update proxy - Success');
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Branch update proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Branch update proxy failed', 
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

export async function DELETE(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;
    
    // Convert ID to integer to match backend expectations
    const branchId = parseInt(id, 10);
    
    if (isNaN(branchId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid branch ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    const backendUrl = `${apiBaseUrl}/api/branches/${branchId}`;
    
    console.log('Branch delete proxy - Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    console.log('Branch delete proxy - Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Branch delete proxy - Backend error:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('Branch delete proxy - Success');
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Branch delete proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Branch delete proxy failed', 
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

/**
 * Invoices Proxy Route - Bypasses CORS issues for invoices API
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '100';
    const customer_id = searchParams.get('customer_id') || '';
    const status = searchParams.get('status') || '';
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Invoices proxy GET - API Base URL:', apiBaseUrl);
    console.log('Invoices proxy GET - Auth header present:', !!authHeader);
    
    // Build query parameters
    let queryParams = `skip=${skip}&limit=${limit}`;
    if (customer_id) queryParams += `&customer_id=${customer_id}`;
    if (status) queryParams += `&status=${status}`;
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/invoices/?${queryParams}`;
    console.log('Invoices proxy GET - Backend URL:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log('Invoices proxy GET - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Invoices proxy GET - Backend response data length:', data.length);
    
    // Forward the response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Invoices proxy GET error:', error);
    
    let errorMessage = 'Invoices proxy GET failed';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - backend took too long to respond';
      statusCode = 504;
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to backend API';
      statusCode = 502;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        details: error.message 
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function POST(request) {
  try {
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Get request body
    const body = await request.text();
    
    console.log('Invoices proxy POST - API Base URL:', apiBaseUrl);
    console.log('Invoices proxy POST - Auth header present:', !!authHeader);
    console.log('Invoices proxy POST - Request body length:', body.length);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/invoices/`;
    console.log('Invoices proxy POST - Backend URL:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(15000), // 15 second timeout for invoice creation
    });
    
    console.log('Invoices proxy POST - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Invoices proxy POST - Backend response data length:', data.length);
    
    // Forward the response with CORS headers
    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('Invoices proxy POST error:', error);
    
    let errorMessage = 'Invoices proxy POST failed';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - backend took too long to respond';
      statusCode = 504;
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to backend API';
      statusCode = 502;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        details: error.message 
      }),
      {
        status: statusCode,
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
/**
 * Individual Invoice Proxy Route - Handle GET, PUT, DELETE for specific invoice
 */

export async function GET(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id } = await params;
    
    // Validate the invoice ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Get invoice proxy - Invalid invoice ID:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid invoice ID', 
          details: 'Invoice ID is required and must be a valid number' 
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
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId) || invoiceId <= 0) {
      console.error('Get invoice proxy - Invalid invoice ID format:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid invoice ID format', 
          details: 'Invoice ID must be a positive integer' 
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
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Get invoice proxy - Invoice ID:', invoiceId);
    console.log('Get invoice proxy - API Base URL:', apiBaseUrl);
    console.log('Get invoice proxy - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/invoices/${invoiceId}`;
    console.log('Get invoice proxy - Backend URL:', backendUrl);
    
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
    
    console.log('Get invoice proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Get invoice proxy - Backend response data length:', data.length);
    
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
    console.error('Get invoice proxy error:', error);
    
    let errorMessage = 'Get invoice proxy failed';
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

export async function PUT(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id } = await params;
    
    // Validate the invoice ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Update invoice proxy - Invalid invoice ID:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid invoice ID', 
          details: 'Invoice ID is required and must be a valid number' 
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
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId) || invoiceId <= 0) {
      console.error('Update invoice proxy - Invalid invoice ID format:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid invoice ID format', 
          details: 'Invoice ID must be a positive integer' 
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
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Get request body
    const body = await request.text();
    
    console.log('Update invoice proxy - Invoice ID:', invoiceId);
    console.log('Update invoice proxy - API Base URL:', apiBaseUrl);
    console.log('Update invoice proxy - Auth header present:', !!authHeader);
    console.log('Update invoice proxy - Request body length:', body.length);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/invoices/${invoiceId}`;
    console.log('Update invoice proxy - Backend URL:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body,
      signal: AbortSignal.timeout(45000), // 45 second timeout for invoice update
    });
    
    console.log('Update invoice proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Update invoice proxy - Backend response data length:', data.length);
    
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
    console.error('Update invoice proxy error:', error);
    
    let errorMessage = 'Update invoice proxy failed';
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

export async function DELETE(request, { params }) {
  try {
    // In Next.js 15+, params is a Promise that needs to be awaited
    const { id } = await params;
    
    // Validate the invoice ID parameter
    if (!id || id === 'undefined' || id === 'null') {
      console.error('Delete invoice proxy - Invalid invoice ID:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid invoice ID', 
          details: 'Invoice ID is required and must be a valid number' 
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
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId) || invoiceId <= 0) {
      console.error('Delete invoice proxy - Invalid invoice ID format:', id);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid invoice ID format', 
          details: 'Invoice ID must be a positive integer' 
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
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    console.log('Delete invoice proxy - Invoice ID:', invoiceId);
    console.log('Delete invoice proxy - API Base URL:', apiBaseUrl);
    console.log('Delete invoice proxy - Auth header present:', !!authHeader);
    
    // Make the request to FastAPI backend
    const backendUrl = `${apiBaseUrl}/api/invoices/${invoiceId}`;
    console.log('Delete invoice proxy - Backend URL:', backendUrl);
    
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    // Forward auth header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.log('Delete invoice proxy - Backend response status:', response.status);
    
    // Get response data
    const data = await response.text();
    console.log('Delete invoice proxy - Backend response data length:', data.length);
    
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
    console.error('Delete invoice proxy error:', error);
    
    let errorMessage = 'Delete invoice proxy failed';
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
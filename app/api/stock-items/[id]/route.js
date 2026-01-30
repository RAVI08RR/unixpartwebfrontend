/**
 * Individual Stock Item API Proxy Route
 * Handles GET, PUT, DELETE for specific stock items
 */

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    const backendUrl = `${apiBaseUrl}/api/stock-items/${id}`;
    
    console.log('Stock Item proxy - Get URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    console.log('Stock Item proxy - Get response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stock Item proxy - Get error:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('Stock Item proxy - Get success:', data);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Stock Item proxy get error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Stock Item get proxy failed', 
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
    const { id } = params;
    const stockItemData = await request.json();
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    const backendUrl = `${apiBaseUrl}/api/stock-items/${id}`;
    
    console.log('Stock Item proxy - Update URL:', backendUrl);
    console.log('Stock Item proxy - Update data:', stockItemData);
    
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(stockItemData),
    });
    
    console.log('Stock Item proxy - Update response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stock Item proxy - Update error:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('Stock Item proxy - Update success:', data);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Stock Item proxy update error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Stock Item update proxy failed', 
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
    const { id } = params;
    
    // Get API base URL
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://289b47e1e00a.ngrok-free.app').replace(/\/+$/, '');
    const backendUrl = `${apiBaseUrl}/api/stock-items/${id}`;
    
    console.log('Stock Item proxy - Delete URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });
    
    console.log('Stock Item proxy - Delete response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stock Item proxy - Delete error:', errorText);
      return new Response(errorText, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Handle 204 No Content response
    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }
    
    const data = await response.json();
    console.log('Stock Item proxy - Delete success:', data);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Stock Item proxy delete error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Stock Item delete proxy failed', 
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
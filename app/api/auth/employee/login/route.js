import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://srv1029267.hstgr.cloud:8000').replace(/\/+$/, '');
    
    console.log('Employee login proxy - API Base URL:', apiBaseUrl);
    
    // Construct backend URL with query parameters as expected by FastAPI
    const backendUrl = `${apiBaseUrl}/api/auth/employee/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    console.log('Employee login proxy - Backend URL:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    console.log('Employee login proxy - Backend response status:', response.status);
    
    const data = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = null;
    }
    
    const nextResponse = new Response(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
    // Set HttpOnly cookie on success
    const token = parsedData?.access_token || parsedData?.token;
    if (response.ok && token) {
      const isProduction = process.env.NODE_ENV === 'production';
      
      const authCookieOptions = [
        `auth_token=${token}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=604800', // 7 days
        isProduction ? 'Secure' : '',
      ].filter(Boolean).join('; ');
      
      const roleCookieOptions = [
        `user_role=employee`,
        'Path=/',
        'SameSite=Lax',
        'Max-Age=604800', // 7 days
        isProduction ? 'Secure' : '',
      ].filter(Boolean).join('; ');
      
      nextResponse.headers.set('Set-Cookie', authCookieOptions);
      nextResponse.headers.append('Set-Cookie', roleCookieOptions);
      console.log('🍪 Employee Auth token and user_role cookies set');
    }
    
    return nextResponse;
  } catch (error) {
    console.error('Employee login proxy error:', error);
    
    let errorMessage = 'Employee login proxy failed';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorMessage = 'Backend request timeout - server took too long to respond';
      statusCode = 504;
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to backend server';
      statusCode = 502;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        details: error.message,
        timestamp: new Date().toISOString()
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

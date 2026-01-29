/**
 * Test Configuration Route - Debug API setup
 */

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    // Test backend connectivity
    const testUrl = `${apiUrl}/api/users/`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
      },
    });
    
    return Response.json({
      config: {
        NEXT_PUBLIC_API_URL: apiUrl,
        NODE_ENV: process.env.NODE_ENV,
        testUrl: testUrl,
      },
      backendTest: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({
      config: {
        NEXT_PUBLIC_API_URL: apiUrl,
        NODE_ENV: process.env.NODE_ENV,
      },
      error: {
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
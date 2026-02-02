export async function GET() {
  return Response.json({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    message: 'Debug endpoint to check environment variables',
    timestamp: new Date().toISOString(),
    // Add more debug info
    vercel: {
      VERCEL: process.env.VERCEL,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
    }
  });
}

export async function POST(request) {
  try {
    const headers = Object.fromEntries(request.headers.entries());
    const origin = request.headers.get('origin');
    
    // Test backend connectivity
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app').replace(/\/+$/, '');
    
    console.log('🔍 Debug POST - Testing backend connectivity...');
    console.log('🔍 API Base URL:', apiBaseUrl);
    
    // Test 1: Basic connectivity
    let backendTest = { status: 'unknown', error: null, response: null };
    try {
      const testResponse = await fetch(`${apiBaseUrl}/`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        signal: AbortSignal.timeout(5000),
      });
      
      backendTest.status = testResponse.status;
      backendTest.response = await testResponse.text();
      console.log('✅ Backend connectivity test passed:', testResponse.status);
    } catch (error) {
      backendTest.error = error.message;
      console.log('❌ Backend connectivity test failed:', error.message);
    }
    
    // Test 2: Login endpoint test
    let loginTest = { status: 'unknown', error: null, response: null };
    try {
      const loginResponse = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass'
        }),
        signal: AbortSignal.timeout(5000),
      });
      
      loginTest.status = loginResponse.status;
      loginTest.response = await loginResponse.text();
      console.log('🔍 Login endpoint test status:', loginResponse.status);
    } catch (error) {
      loginTest.error = error.message;
      console.log('❌ Login endpoint test failed:', error.message);
    }
    
    return Response.json({
      message: 'Debug POST endpoint with backend tests',
      origin: origin,
      headers: headers,
      url: request.url,
      timestamp: new Date().toISOString(),
      apiBaseUrl: apiBaseUrl,
      tests: {
        backendConnectivity: backendTest,
        loginEndpoint: loginTest
      }
    });
    
  } catch (error) {
    console.error('Debug POST error:', error);
    return Response.json({
      error: 'Debug endpoint failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
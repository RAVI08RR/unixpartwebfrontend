/**
 * Logout Route - Clears authentication cookie
 */

export async function POST(request) {
  try {
    console.log('🚪 Logout request received');
    
    // Create response
    const response = new Response(
      JSON.stringify({ 
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
    
    // Clear the auth and role cookies by setting them with Max-Age=0
    const authCookieOptions = [
      'auth_token=',
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=0', // Expire immediately
    ].join('; ');

    const roleCookieOptions = [
      'user_role=',
      'Path=/',
      'SameSite=Lax',
      'Max-Age=0', // Expire immediately
    ].join('; ');
    
    response.headers.set('Set-Cookie', authCookieOptions);
    response.headers.append('Set-Cookie', roleCookieOptions);
    console.log('🍪 Auth and user_role cookies cleared');
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Logout failed', 
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

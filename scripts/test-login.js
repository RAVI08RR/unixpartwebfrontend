#!/usr/bin/env node

/**
 * Login Endpoint Test Script
 * Tests the login functionality with proper credentials
 */

const https = require('https');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app';

console.log('🔐 Testing Login Endpoint...');
console.log('📍 API URL:', API_URL);
console.log('⏰ Timestamp:', new Date().toISOString());
console.log('');

async function testLogin(credentials, description) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(`${API_URL}/api/auth/login`);
    
    const postData = JSON.stringify(credentials);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000 // 30 second timeout
    };

    const req = https.request(options, (res) => {
      const duration = Date.now() - startTime;
      console.log(`📝 ${description}: ${res.statusCode} (${duration}ms)`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Response: ${data.substring(0, 300)}${data.length > 300 ? '...' : ''}`);
        resolve({ success: true, status: res.statusCode, duration, data });
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ ${description}: ${error.message} (${duration}ms)`);
      resolve({ success: false, error: error.message, duration });
    });

    req.on('timeout', () => {
      const duration = Date.now() - startTime;
      console.log(`⏰ ${description}: Timeout (${duration}ms)`);
      req.destroy();
      resolve({ success: false, error: 'Timeout', duration });
    });

    req.write(postData);
    req.end();
  });
}

// Test with different scenarios
async function runLoginTests() {
  const tests = [
    {
      credentials: { email: 'test@example.com', password: 'short' },
      description: 'Short Password (should fail with 422)'
    },
    {
      credentials: { email: 'test@example.com', password: 'validpassword123' },
      description: 'Valid Format (should fail with 401 if user doesn\'t exist)'
    },
    {
      credentials: { email: 'admin@example.com', password: 'admin123456' },
      description: 'Admin Credentials (might work if seeded)'
    }
  ];

  console.log('Running login tests...\n');
  
  for (const test of tests) {
    await testLogin(test.credentials, test.description);
    console.log(''); // Add spacing
  }
  
  console.log('🏁 Login tests completed');
  console.log('\n💡 Expected results:');
  console.log('   - 422: Validation error (password too short, invalid email, etc.)');
  console.log('   - 401: Invalid credentials (user not found or wrong password)');
  console.log('   - 200: Successful login (returns access token)');
  console.log('   - Timeout: Backend server is too slow or unresponsive');
}

runLoginTests().catch(console.error);
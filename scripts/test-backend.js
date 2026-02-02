#!/usr/bin/env node

/**
 * Backend Connectivity Test Script
 * Tests the backend API endpoints to diagnose connectivity issues
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://228385806398.ngrok-free.app';

console.log('🔍 Testing Backend Connectivity...');
console.log('📍 API URL:', API_URL);
console.log('⏰ Timestamp:', new Date().toISOString());
console.log('');

// Test function
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Backend-Test-Script/1.0'
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      const duration = Date.now() - startTime;
      console.log(`✅ ${description}: ${res.statusCode} (${duration}ms)`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          console.log(`   Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        }
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

    req.end();
  });
}

// Run tests
async function runTests() {
  const tests = [
    { url: API_URL, description: 'Base URL' },
    { url: `${API_URL}/api/auth/me`, description: 'Auth Me Endpoint' },
    { url: `${API_URL}/api/invoices`, description: 'Invoices Endpoint' },
    { url: `${API_URL}/api/customers`, description: 'Customers Endpoint' },
    { url: `${API_URL}/docs`, description: 'API Documentation' },
  ];

  console.log('Running connectivity tests...\n');
  
  for (const test of tests) {
    await testEndpoint(test.url, test.description);
  }
  
  console.log('\n🏁 Test completed');
  console.log('\n💡 If you see timeouts or connection errors:');
  console.log('   1. Check if ngrok is still running');
  console.log('   2. Restart ngrok if needed');
  console.log('   3. Update NEXT_PUBLIC_API_URL in .env.local');
  console.log('   4. Check if your backend server is running');
}

runTests().catch(console.error);
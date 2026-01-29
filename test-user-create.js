// Test script to debug user creation API
const API_BASE_URL = 'https://a36498aba6e6.ngrok-free.app';

async function testUserCreate() {
  // Get token from localStorage (you'll need to run this in browser console)
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.error('No token found. Please log in first.');
    return;
  }

  // Test payload - minimal required fields
  const testPayload = {
    name: "Test User",
    email: "test@example.com",
    password: "testpassword123",
    user_code: "TEST001",
    role_id: 1,
    status: true,
    branch_ids: [],
    supplier_ids: [],
    permission_ids: []
  };

  console.log('🧪 Testing user creation with payload:', testPayload);

  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📡 Raw response:', responseText);

    if (response.ok) {
      console.log('✅ User creation successful!');
      try {
        const jsonData = JSON.parse(responseText);
        console.log('📋 Created user data:', jsonData);
      } catch (e) {
        console.log('⚠️ Response is not JSON');
      }
    } else {
      console.error('❌ User creation failed');
      try {
        const errorData = JSON.parse(responseText);
        console.error('🚨 Error details:', errorData);
      } catch (e) {
        console.error('🚨 Error response (not JSON):', responseText);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Also test with trailing slash
async function testUserCreateWithSlash() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.error('No token found. Please log in first.');
    return;
  }

  const testPayload = {
    name: "Test User 2",
    email: "test2@example.com",
    password: "testpassword123",
    user_code: "TEST002",
    role_id: 1,
    status: true,
    branch_ids: [],
    supplier_ids: [],
    permission_ids: []
  };

  console.log('🧪 Testing user creation with trailing slash:', testPayload);

  try {
    const response = await fetch(`${API_BASE_URL}/api/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📡 Response status (with slash):', response.status);
    const responseText = await response.text();
    console.log('📡 Raw response (with slash):', responseText);

    if (response.ok) {
      console.log('✅ User creation with slash successful!');
    } else {
      console.error('❌ User creation with slash failed');
      try {
        const errorData = JSON.parse(responseText);
        console.error('🚨 Error details (with slash):', errorData);
      } catch (e) {
        console.error('🚨 Error response (not JSON):', responseText);
      }
    }
  } catch (error) {
    console.error('❌ Network error (with slash):', error);
  }
}

console.log('🔧 User Creation Test Script Loaded');
console.log('📝 Run testUserCreate() to test without trailing slash');
console.log('📝 Run testUserCreateWithSlash() to test with trailing slash');
console.log('⚠️ Make sure you are logged in first!');
#!/usr/bin/env node

/**
 * Vercel Deployment Verification Script
 * Run this before deploying to catch configuration issues early
 */

console.log('🔍 Verifying Vercel deployment configuration...\n');

let hasErrors = false;

// Check 1: Environment variable
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) {
  console.error('❌ NEXT_PUBLIC_API_URL is not set');
  console.log('   Set it in .env.local for development');
  console.log('   Set it in Vercel dashboard for production\n');
  hasErrors = true;
} else {
  console.log('✅ NEXT_PUBLIC_API_URL is set:', apiUrl);
  
  // Check 2: URL format
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    console.error('❌ API URL must start with http:// or https://');
    hasErrors = true;
  } else {
    console.log('✅ API URL format is valid');
  }
  
  // Check 3: Trailing slash
  if (apiUrl.endsWith('/')) {
    console.warn('⚠️  API URL has trailing slash (will be removed automatically)');
  }
}

// Check 4: .env.local exists
const fs = require('fs');
const path = require('path');
const envLocalPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envLocalPath)) {
  console.warn('\n⚠️  .env.local file not found');
  console.log('   Copy .env.example to .env.local and configure it\n');
}

// Check 5: API utility exists
const apiPath = path.join(process.cwd(), 'app', 'lib', 'api.js');
if (!fs.existsSync(apiPath)) {
  console.error('❌ API utility not found at app/lib/api.js');
  hasErrors = true;
} else {
  console.log('✅ API utility exists');
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.error('\n❌ Configuration has errors. Fix them before deploying.\n');
  process.exit(1);
} else {
  console.log('\n✅ Configuration looks good! Ready to deploy.\n');
  console.log('Next steps:');
  console.log('1. Ensure NEXT_PUBLIC_API_URL is set in Vercel dashboard');
  console.log('2. Run: vercel --prod');
  console.log('3. Check Vercel function logs after deployment\n');
  process.exit(0);
}

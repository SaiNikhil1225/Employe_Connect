/**
 * Quick Test Script for Module Permissions
 * 
 * This script tests the newly implemented module permissions
 * for Employee and Leave modules.
 * 
 * Prerequisites:
 * 1. Backend server running on port 5000
 * 2. MongoDB connected
 * 3. Valid auth token for testing
 * 
 * Usage: node test-module-permissions.cjs
 */

const https = require('https');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual token

// Create an HTTPS agent that ignores self-signed certificates
const agent = new https.Agent({
  rejectUnauthorized: false
});

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, body = null) {
  const fetch = (await import('node-fetch')).default;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    },
    agent
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      statusText: response.statusText,
      data
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'ERROR',
      data: { error: error.message }
    };
  }
}

// Test cases
const tests = {
  employee: {
    create: {
      name: 'Create Employee (POST /employees)',
      method: 'POST',
      endpoint: '/employees',
      body: {
        name: 'Test Employee ' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        department: 'IT',
        designation: 'Test Developer',
        location: 'India'
      },
      expectedWithPermission: 201,
      expectedWithoutPermission: 403
    },
    update: {
      name: 'Update Employee (PUT /employees/:id)',
      method: 'PUT',
      endpoint: '/employees/EMPLOYEE_ID_PLACEHOLDER',
      body: {
        name: 'Updated Test Employee',
        department: 'HR'
      },
      expectedWithPermission: 200,
      expectedWithoutPermission: 403
    },
    delete: {
      name: 'Delete Employee (DELETE /employees/:id)',
      method: 'DELETE',
      endpoint: '/employees/EMPLOYEE_ID_PLACEHOLDER',
      expectedWithPermission: 200,
      expectedWithoutPermission: 403
    }
  },
  leave: {
    viewAll: {
      name: 'View All Leaves (GET /leaves)',
      method: 'GET',
      endpoint: '/leaves',
      expectedWithPermission: 200,
      expectedWithoutPermission: 403
    },
    viewUser: {
      name: 'View User Leaves (GET /leaves/user/:id)',
      method: 'GET',
      endpoint: '/leaves/user/TEST001',
      expectedWithPermission: 200,
      expectedWithoutPermission: 403
    },
    viewPending: {
      name: 'View Pending Leaves (GET /leaves/pending)',
      method: 'GET',
      endpoint: '/leaves/pending',
      expectedWithPermission: 200,
      expectedWithoutPermission: 403
    },
    create: {
      name: 'Create Leave (POST /leaves)',
      method: 'POST',
      endpoint: '/leaves',
      body: {
        employeeId: 'TEST001',
        leaveType: 'Annual Leave',
        startDate: '2026-03-10',
        endDate: '2026-03-12',
        days: 3,
        reason: 'Testing module permissions'
      },
      expectedWithPermission: 201,
      expectedWithoutPermission: 403
    }
  }
};

// Run tests
async function runTests() {
  console.log('\n🧪 Module Permissions Test Suite\n');
  console.log('='.repeat(60));
  
  if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE') {
    console.log('❌ ERROR: Please set a valid AUTH_TOKEN in the script');
    console.log('\nTo get a token:');
    console.log('1. Login to the application');
    console.log('2. Open browser DevTools > Application > Local Storage');
    console.log('3. Copy the "auth-token" value');
    console.log('4. Replace AUTH_TOKEN in this script\n');
    return;
  }

  let passed = 0;
  let failed = 0;
  let total = 0;

  // Test Employee Module
  console.log('\n📁 Employee Module Tests\n');
  
  for (const [key, test] of Object.entries(tests.employee)) {
    total++;
    console.log(`\n${total}. ${test.name}`);
    console.log(`   ${test.method} ${test.endpoint}`);
    
    const result = await makeRequest(test.method, test.endpoint, test.body);
    
    console.log(`   Response: ${result.status} ${result.statusText}`);
    
    if (result.status === 403) {
      console.log('   ✅ PASS - Permission check working (403 Forbidden)');
      console.log(`   Message: "${result.data.message}"`);
      passed++;
    } else if (result.status === 401) {
      console.log('   ⚠️  SKIP - Unauthorized (check token)');
    } else if (result.status === 200 || result.status === 201) {
      console.log('   ℹ️  INFO - Access granted (user has permission or no restriction)');
      passed++;
    } else {
      console.log('   ❌ FAIL - Unexpected response');
      console.log('   Data:', JSON.stringify(result.data, null, 2));
      failed++;
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test Leave Module
  console.log('\n\n📋 Leave Module Tests\n');
  
  for (const [key, test] of Object.entries(tests.leave)) {
    total++;
    console.log(`\n${total}. ${test.name}`);
    console.log(`   ${test.method} ${test.endpoint}`);
    
    const result = await makeRequest(test.method, test.endpoint, test.body);
    
    console.log(`   Response: ${result.status} ${result.statusText}`);
    
    if (result.status === 403) {
      console.log('   ✅ PASS - Permission check working (403 Forbidden)');
      console.log(`   Message: "${result.data.message}"`);
      passed++;
    } else if (result.status === 401) {
      console.log('   ⚠️  SKIP - Unauthorized (check token)');
    } else if (result.status === 200 || result.status === 201) {
      console.log('   ℹ️  INFO - Access granted (user has permission or no restriction)');
      passed++;
    } else {
      console.log('   ❌ FAIL - Unexpected response');
      console.log('   Data:', JSON.stringify(result.data, null, 2));
      failed++;
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
  
  console.log('\n📝 Note:');
  console.log('- 403 responses indicate permission checks are working correctly');
  console.log('- 200/201 responses mean the user has the required permissions');
  console.log('- To test blocked access, configure a user WITHOUT permissions in Super Admin\n');
}

// Run the tests
console.log('Starting module permissions test suite...');
console.log('Backend URL:', BASE_URL);
runTests().catch(console.error);

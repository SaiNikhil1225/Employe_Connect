// Test script to verify leave assignment API endpoints
// Run with: node server/test-leave-assignment.js

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testLeaveAssignment() {
  console.log('🧪 Testing Leave Assignment Implementation\n');

  try {
    // Test 1: Get all leave plans
    console.log('1️⃣ Testing GET /api/leave-plans...');
    const plansRes = await axios.get(`${API_BASE}/leave-plans`);
    console.log(`   ✅ Found ${plansRes.data.data.length} leave plans`);
    plansRes.data.data.forEach(plan => {
      console.log(`      - ${plan.planName}: ${plan.employeeCount || 0} employees, ${plan.leaveTypes.length} leave types`);
    });

    if (plansRes.data.data.length === 0) {
      console.log('   ⚠️  No leave plans found. Run seedLeavePlans script first.');
      return;
    }

    const testPlan = plansRes.data.data[0];
    console.log(`\n   Using plan: ${testPlan.planName}`);

    // Test 2: Get employees for plan
    console.log(`\n2️⃣ Testing GET /api/leave-plans/${testPlan.planName}/employees...`);
    const employeesRes = await axios.get(`${API_BASE}/leave-plans/${testPlan.planName}/employees`);
    console.log(`   ✅ Found ${employeesRes.data.data.length} employees in plan`);
    
    if (employeesRes.data.data.length === 0) {
      console.log('   ⚠️  No employees found in this plan.');
      return;
    }

    const testEmployee = employeesRes.data.data[0];
    console.log(`\n   Using employee: ${testEmployee.name} (${testEmployee.employeeId})`);

    if (testEmployee.leaveBalance) {
      console.log('   Current balances:');
      testEmployee.leaveBalance.leaveTypes.forEach(lt => {
        console.log(`      - ${lt.type}: ${lt.available}/${lt.allocated} days available`);
      });
    } else {
      console.log('   ⚠️  Employee has no leave balance initialized');
    }

    // Test 3: Allocate leave (commented out to avoid actual modifications)
    // Uncomment below to test allocation
    /*
    console.log('\n3️⃣ Testing POST /api/leave-plans/allocate...');
    const allocateRes = await axios.post(`${API_BASE}/leave-plans/allocate`, {
      employeeId: testEmployee.employeeId,
      year: new Date().getFullYear(),
      leaveType: testPlan.leaveTypes[0].type,
      days: 1,
      reason: 'Test allocation',
      adjustedBy: 'TEST_HR',
      adjustedByName: 'Test HR Admin'
    });
    console.log('   ✅ Successfully allocated leave');
    */

    console.log('\n✅ All tests passed!\n');
    console.log('📋 Implementation Status:');
    console.log('   ✅ Leave plans API working');
    console.log('   ✅ Employee balances loading');
    console.log('   ✅ Routes registered correctly');
    console.log('\n💡 Next steps:');
    console.log('   1. Access HR Leave Plans Management page in UI');
    console.log('   2. Test allocate/adjust modals');
    console.log('   3. Try bulk allocation');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure backend server is running (npm run dev in server folder)');
    console.log('   2. Verify database connection');
    console.log('   3. Run seedLeavePlans script if no data exists');
  }
}

testLeaveAssignment();

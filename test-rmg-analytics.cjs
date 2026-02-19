const axios = require('axios');

const API_URL = 'http://localhost:5000/api/rmg-analytics';

async function testRMGAnalyticsAPI() {
  console.log('🧪 Testing RMG Analytics API...\n');

  // Get auth token (you'll need to replace this with a valid token)
  const authToken = process.env.TEST_TOKEN || 'your-test-token-here';

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const params = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };

  try {
    // Test 1: Resource Utilization
    console.log('1️⃣  Testing /resource-utilization...');
    try {
      const utilization = await axios.get(`${API_URL}/resource-utilization`, { headers, params });
      console.log('✅ Resource Utilization:', {
        status: utilization.status,
        totalResources: utilization.data?.data?.summary?.totalResources || 0,
        overallUtilization: utilization.data?.data?.summary?.overallUtilization || 0
      });
    } catch (error) {
      console.log('❌ Resource Utilization failed:', error.response?.data?.message || error.message);
    }

    console.log('\n');

    // Test 2: Allocation Efficiency
    console.log('2️⃣  Testing /allocation-efficiency...');
    try {
      const efficiency = await axios.get(`${API_URL}/allocation-efficiency`, { headers, params });
      console.log('✅ Allocation Efficiency:', {
        status: efficiency.status,
        totalEmployees: efficiency.data?.data?.summary?.totalEmployees || 0,
        overAllocated: efficiency.data?.data?.summary?.overAllocatedCount || 0
      });
    } catch (error) {
      console.log('❌ Allocation Efficiency failed:', error.response?.data?.message || error.message);
    }

    console.log('\n');

    // Test 3: Cost Summary
    console.log('3️⃣  Testing /cost-summary...');
    try {
      const cost = await axios.get(`${API_URL}/cost-summary`, { headers, params });
      console.log('✅ Cost Summary:', {
        status: cost.status,
        totalResourceCost: cost.data?.data?.summary?.totalResourceCost || 0,
        benchCost: cost.data?.data?.summary?.benchCost || 0
      });
    } catch (error) {
      console.log('❌ Cost Summary failed:', error.response?.data?.message || error.message);
    }

    console.log('\n');

    // Test 4: Skills Gap
    console.log('4️⃣  Testing /skills-gap...');
    try {
      const skills = await axios.get(`${API_URL}/skills-gap`, { headers, params: { futureMonths: 3 } });
      console.log('✅ Skills Gap:', {
        status: skills.status,
        criticalGaps: skills.data?.data?.summary?.criticalGaps || 0,
        totalSkillsRequired: skills.data?.data?.summary?.totalSkillsRequired || 0
      });
    } catch (error) {
      console.log('❌ Skills Gap failed:', error.response?.data?.message || error.message);
    }

    console.log('\n');

    // Test 5: Demand Forecast
    console.log('5️⃣  Testing /demand-forecast...');
    try {
      const forecast = await axios.get(`${API_URL}/demand-forecast`, { headers, params });
      console.log('✅ Demand Forecast:', {
        status: forecast.status,
        upcomingProjects: forecast.data?.data?.summary?.upcomingProjectsCount || 0,
        totalDemand: forecast.data?.data?.summary?.totalDemand || 0
      });
    } catch (error) {
      console.log('❌ Demand Forecast failed:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run without auth for testing
async function testWithoutAuth() {
  console.log('🧪 Testing RMG Analytics API (without auth)...\n');

  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const params = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };

  try {
    console.log('Testing /resource-utilization...');
    const utilization = await axios.get(`${API_URL}/resource-utilization`, { params });
    console.log('✅ Success! API returned:', {
      totalResources: utilization.data?.data?.summary?.totalResources || 0,
      overallUtilization: utilization.data?.data?.summary?.overallUtilization || 0,
      benchStrength: utilization.data?.data?.summary?.benchStrength || 0
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️  API requires authentication (401). This is expected.');
    } else {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }
  }
}

// Run test
console.log('Choose test mode:');
console.log('1. Run without auth (quick test)');
console.log('2. Run with auth token\n');

// Run without auth by default
testWithoutAuth();

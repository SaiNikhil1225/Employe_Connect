// Quick script to check and manage PIPs
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function checkPIPs() {
  try {
    console.log('Fetching all PIPs...\n');
    const response = await axios.get(`${BASE_URL}/pip`);
    
    if (response.data.success) {
      const pips = response.data.data;
      console.log(`Found ${pips.length} PIPs:\n`);
      
      pips.forEach((pip, index) => {
        console.log(`${index + 1}. PIP Number: ${pip.pipNumber}`);
        console.log(`   Employee ID: ${pip.employeeId}`);
        console.log(`   Status: ${pip.status}`);
        console.log(`   Start Date: ${pip.startDate}`);
        console.log(`   End Date: ${pip.endDate}`);
        console.log(`   Reason: ${pip.reason}`);
        console.log(`   MongoDB ID: ${pip._id}`);
        console.log('');
      });

      // Find active PIPs
      const activePIPs = pips.filter(p => ['Pending', 'Acknowledged', 'Active'].includes(p.status));
      if (activePIPs.length > 0) {
        console.log(`\n⚠️  Found ${activePIPs.length} ACTIVE PIPs:`);
        activePIPs.forEach(pip => {
          console.log(`   - ${pip.pipNumber} (${pip.employeeId}) - Status: ${pip.status}`);
        });
        console.log('\nTo cancel a PIP, run:');
        console.log(`node cancel-pip.js <pipId>\n`);
      }
    } else {
      console.log('Failed to fetch PIPs:', response.data.message);
    }
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data.message || error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkPIPs();

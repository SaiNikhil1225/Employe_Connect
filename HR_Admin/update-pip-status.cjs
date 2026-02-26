// Script to cancel/complete a PIP
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function updatePIPStatus(pipId, status = 'Cancelled') {
  try {
    console.log(`Updating PIP ${pipId} to status: ${status}...\n`);
    
    const response = await axios.patch(`${BASE_URL}/pip/${pipId}/status`, {
      status: status
    });
    
    if (response.data.success) {
      console.log('✅ Success!');
      console.log(`PIP updated to: ${response.data.data.status}`);
      console.log(`PIP Number: ${response.data.data.pipNumber}`);
      console.log(`Employee: ${response.data.data.employeeId}`);
    } else {
      console.log('❌ Failed:', response.data.message);
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data.message || error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Get arguments from command line
const pipId = process.argv[2];
const status = process.argv[3] || 'Cancelled';

if (!pipId) {
  console.log('Usage: node update-pip-status.js <pipId> [status]');
  console.log('\nExample:');
  console.log('  node update-pip-status.js 507f1f77bcf86cd799439011 Cancelled');
  console.log('  node update-pip-status.js 507f1f77bcf86cd799439011 Completed');
  console.log('\nValid statuses: Pending, Acknowledged, Active, Completed, Failed, Cancelled');
  process.exit(1);
}

updatePIPStatus(pipId, status);

// Script to delete a PIP
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function deletePIP(pipId) {
  try {
    console.log(`Deleting PIP ${pipId}...\n`);
    
    const response = await axios.delete(`${BASE_URL}/pip/${pipId}`);
    
    if (response.data.success) {
      console.log('✅ Success!');
      console.log(response.data.message);
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

const pipId = process.argv[2];

if (!pipId) {
  console.log('Usage: node delete-pip.cjs <pipId>');
  console.log('\nExample:');
  console.log('  node delete-pip.cjs 507f1f77bcf86cd799439011');
  process.exit(1);
}

deletePIP(pipId);

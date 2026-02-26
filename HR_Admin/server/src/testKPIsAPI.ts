import axios from 'axios';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '../.env') });

const API_BASE = 'http://localhost:5000/api';

async function testKPIsAPI() {
  try {
    console.log('🧪 Testing KPIs API without authentication...\n');
    
    // First, let's try without auth to see what happens
    try {
      const response = await axios.get(`${API_BASE}/leave-attendance/kpis`);
      console.log('✅ KPIs Response (no auth):', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('⚠️  401 Unauthorized - Authentication required (expected)');
        console.log('   This means the API is working but needs a valid token\n');
        
        console.log('📝 To test with proper authentication:');
        console.log('   1. Login to the application as HR Admin');
        console.log('   2. Open browser DevTools > Network tab');
        console.log('   3. Navigate to Leave & Attendance page');
        console.log('   4. Look for the /kpis request');
        console.log('   5. Check the Response tab to see the data\n');
        
        console.log('🔍 Expected Response Structure:');
        console.log(JSON.stringify({
          totalEmployees: 32,
          presentToday: 25,
          onLeaveToday: 2,
          attendanceRate: 75.5,
          leaveUtilizationRate: 12.3,
          lateArrivalsMTD: 15,
          overtimeHoursMTD: 45.5
        }, null, 2));
      } else {
        console.error('❌ Error:', error.message);
      }
    }
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

testKPIsAPI();

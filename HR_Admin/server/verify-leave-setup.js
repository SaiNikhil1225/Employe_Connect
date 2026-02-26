// Script to verify leave management setup and show what user should see
const mongoose = require('mongoose');
require('dotenv').config();

async function verifySetup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Check leave plans
    const planCount = await db.collection('leaveplans').countDocuments();
    console.log(`📋 Leave Plans: ${planCount} plans found`);
    if (planCount === 5) {
      const plans = await db.collection('leaveplans').find({}, { projection: { planName: 1 } }).toArray();
      console.log('   ✅ Plans:', plans.map(p => p.planName).join(', '));
    } else {
      console.log('   ⚠️  Expected 5 plans. Run: npm run seed:leave-plans');
    }
    
    // Check employees with leave plans
    const employeesWithPlan = await db.collection('employees').find({ leavePlan: { $exists: true } }).toArray();
    console.log(`\n👥 Employees with Leave Plans: ${employeesWithPlan.length}`);
    
    if (employeesWithPlan.length === 0) {
      console.log('   ⚠️  No employees have leave plans assigned');
      console.log('   💡 Run: node setup-test-employee.js');
    } else {
      employeesWithPlan.forEach(emp => {
        console.log(`   - ${emp.firstName} ${emp.lastName} (${emp.employeeId}): ${emp.leavePlan} plan`);
      });
      
      // Show leave balance for first employee
      const emp = employeesWithPlan[0];
      const balance = await db.collection('leavebalances').findOne({ 
        employeeId: emp.employeeId,
        year: 2026
      });
      
      console.log(`\n📊 Leave Balance Preview for ${emp.firstName}:`);
      if (balance && balance.leaveTypes) {
        console.log(`   Plan: ${balance.leavePlan}`);
        console.log(`   Leave Types Available:`);
        balance.leaveTypes.forEach(lt => {
          console.log(`   - ${lt.type}: ${lt.available}/${lt.allocated || lt.accrued} days available`);
          if (lt.used > 0) console.log(`     (Used: ${lt.used} days)`);
          if (lt.pending > 0) console.log(`     (Pending: ${lt.pending} days)`);
        });
      } else {
        console.log('   ℹ️  Leave balance will auto-initialize on first page visit');
      }
      
      // Show what UI will display
      console.log(`\n🎨 What You'll See in the UI:`);
      console.log(`   ┌────────────────────────────────────────┐`);
      console.log(`   │ 📍 Leave Plan Badge: "${emp.leavePlan} Plan"    │`);
      console.log(`   └────────────────────────────────────────┘`);
      if (balance && balance.leaveTypes) {
        console.log(`   \n   Leave Balance Cards (${balance.leaveTypes.length} cards):`);
        balance.leaveTypes.forEach((lt, idx) => {
          const progress = lt.allocated > 0 ? Math.round((lt.available/lt.allocated) * 100) : 0;
          console.log(`   ${idx + 1}. ┌─ ${lt.type} ──────────────┐`);
          console.log(`      │ Available: ${lt.available} of ${lt.allocated || lt.accrued} days │`);
          console.log(`      │ Used: ${lt.used} | Pending: ${lt.pending}     │`);
          console.log(`      │ Progress: ${'█'.repeat(Math.floor(progress/10))}${'░'.repeat(10-Math.floor(progress/10))} ${progress}%    │`);
          console.log(`      └────────────────────────────┘`);
        });
      }
      
      console.log(`\n🚀 Access Leave Management:`);
      console.log(`   1. Login as: ${emp.email}`);
      console.log(`   2. Navigate to: Leave Management`);
      console.log(`   3. Click "Apply" on any leave card to request leave`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Verification complete');
  }
}

verifySetup();

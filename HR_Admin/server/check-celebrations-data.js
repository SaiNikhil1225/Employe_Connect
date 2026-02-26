const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/employee_connect')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Employee schema (simplified)
const employeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model('Employee', employeeSchema);

// Celebration schema (simplified)
const celebrationSchema = new mongoose.Schema({}, { strict: false });
const Celebration = mongoose.model('Celebration', celebrationSchema);

async function checkData() {
  try {
    console.log('\n📊 === DATABASE STATUS CHECK ===\n');

    // Check Employees
    const totalEmployees = await Employee.countDocuments();
    console.log(`👥 Total Employees: ${totalEmployees}`);

    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    console.log(`✅ Active Employees: ${activeEmployees}`);

    const withDOB = await Employee.countDocuments({ 
      status: 'active', 
      dateOfBirth: { $exists: true, $ne: null, $ne: '' } 
    });
    console.log(`🎂 Employees with Date of Birth: ${withDOB}`);

    const withDOJ = await Employee.countDocuments({ 
      status: 'active', 
      dateOfJoining: { $exists: true, $ne: null, $ne: '' } 
    });
    console.log(`📅 Employees with Date of Joining: ${withDOJ}`);

    // Sample employees with dates
    const sampleEmployees = await Employee.find({
      status: 'active',
      dateOfBirth: { $exists: true, $ne: null }
    }).limit(5).select('employeeId name dateOfBirth dateOfJoining department location');

    if (sampleEmployees.length > 0) {
      console.log('\n📝 Sample Employees with Dates:');
      sampleEmployees.forEach(emp => {
        console.log(`  ${emp.employeeId} - ${emp.name}`);
        console.log(`    DOB: ${emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString() : 'N/A'}`);
        console.log(`    DOJ: ${emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : 'N/A'}`);
        console.log(`    Dept: ${emp.department || 'N/A'}, Location: ${emp.location || 'N/A'}`);
      });
    }

    // Check Celebrations
    console.log('\n🎉 === CELEBRATIONS DATA ===\n');
    const totalCelebrations = await Celebration.countDocuments();
    console.log(`📊 Total Celebrations: ${totalCelebrations}`);

    if (totalCelebrations > 0) {
      const celebrationsByType = await Celebration.aggregate([
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('\n📈 By Event Type:');
      celebrationsByType.forEach(item => {
        console.log(`  ${item._id}: ${item.count}`);
      });

      const celebrationsByStatus = await Celebration.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('\n✅ By Status:');
      celebrationsByStatus.forEach(item => {
        console.log(`  ${item._id}: ${item.count}`);
      });

      // Sample celebrations
      const sampleCelebrations = await Celebration.find().limit(5)
        .select('celebrationId employeeId employeeName eventType eventTitle eventDate status');
      
      console.log('\n📋 Sample Celebrations:');
      sampleCelebrations.forEach(cel => {
        console.log(`  ${cel.celebrationId || 'N/A'} - ${cel.employeeName}`);
        console.log(`    Type: ${cel.eventType}, Status: ${cel.status}`);
        console.log(`    Event: ${cel.eventTitle}`);
        console.log(`    Date: ${cel.eventDate ? new Date(cel.eventDate).toLocaleDateString() : 'N/A'}`);
      });
    }

    // Calculate upcoming birthdays
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const employeesWithBirthdays = await Employee.find({
      status: 'active',
      dateOfBirth: { $exists: true, $ne: null }
    }).select('employeeId name dateOfBirth');

    const upcomingBirthdays = employeesWithBirthdays.filter(emp => {
      const dob = new Date(emp.dateOfBirth);
      const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      return thisYearBirthday >= today && thisYearBirthday <= next7Days;
    });

    console.log(`\n🎂 Upcoming Birthdays (Next 7 days): ${upcomingBirthdays.length}`);
    if (upcomingBirthdays.length > 0) {
      upcomingBirthdays.forEach(emp => {
        const dob = new Date(emp.dateOfBirth);
        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`  ${emp.name} - ${thisYearBirthday.toLocaleDateString()} (in ${daysUntil} days)`);
      });
    }

    // Calculate upcoming anniversaries
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const employeesWithDOJ = await Employee.find({
      status: 'active',
      dateOfJoining: { $exists: true, $ne: null }
    }).select('employeeId name dateOfJoining');

    const upcomingAnniversaries = employeesWithDOJ.filter(emp => {
      const doj = new Date(emp.dateOfJoining);
      const thisYearAnniversary = new Date(today.getFullYear(), doj.getMonth(), doj.getDate());
      return thisYearAnniversary >= today && thisYearAnniversary <= next30Days;
    });

    console.log(`\n🏆 Upcoming Anniversaries (Next 30 days): ${upcomingAnniversaries.length}`);
    if (upcomingAnniversaries.length > 0) {
      upcomingAnniversaries.forEach(emp => {
        const doj = new Date(emp.dateOfJoining);
        const thisYearAnniversary = new Date(today.getFullYear(), doj.getMonth(), doj.getDate());
        const yearsOfService = today.getFullYear() - doj.getFullYear();
        const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`  ${emp.name} - ${yearsOfService} years (in ${daysUntil} days)`);
      });
    }

    console.log('\n✅ Data check complete!\n');

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  }
}

// Run the check
checkData();

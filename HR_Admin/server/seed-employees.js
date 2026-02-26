const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rmg-portal')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Employee schema (matching the actual schema)
const employeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model('Employee', employeeSchema);

// Helper function to generate dates
function getDateInFuture(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

function getDateYearsAgo(years, daysOffset = 0) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  date.setDate(date.getDate() + daysOffset);
  return date;
}

const sampleEmployees = [
  // Employees with upcoming birthdays (next 7 days)
  {
    employeeId: 'EMP001',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@acuvate.com',
    phone: '+1-555-0101',
    department: 'Engineering',
    location: 'New York',
    designation: 'Senior Software Engineer',
    status: 'active',
    dateOfBirth: getDateInFuture(2), // Birthday in 2 days
    dateOfJoining: getDateYearsAgo(3, 0),
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP002',
    name: 'Sarah Johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@acuvate.com',
    phone: '+1-555-0102',
    department: 'Marketing',
    location: 'San Francisco',
    designation: 'Marketing Manager',
    status: 'active',
    dateOfBirth: getDateInFuture(5), // Birthday in 5 days
    dateOfJoining: getDateYearsAgo(5, 10), // 5 year anniversary in 10 days
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP003',
    name: 'Michael Chen',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@acuvate.com',
    phone: '+1-555-0103',
    department: 'Engineering',
    location: 'Seattle',
    designation: 'Lead Developer',
    status: 'active',
    dateOfBirth: getDateInFuture(7), // Birthday in 7 days
    dateOfJoining: getDateYearsAgo(10, 20), // 10 year anniversary in 20 days
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP004',
    name: 'Emily Brown',
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@acuvate.com',
    phone: '+1-555-0104',
    department: 'Sales',
    location: 'Boston',
    designation: 'Sales Executive',
    status: 'active',
    dateOfBirth: getDateInFuture(6), // Birthday in 6 days
    dateOfJoining: getDateYearsAgo(2, 0),
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP005',
    name: 'David Wilson',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@acuvate.com',
    phone: '+1-555-0105',
    department: 'Finance',
    location: 'Chicago',
    designation: 'Financial Analyst',
    status: 'active',
    dateOfBirth: getDateYearsAgo(30, 0), // Birthday was in the past
    dateOfJoining: getDateYearsAgo(10, 25), // 10 year anniversary in 25 days
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP006',
    name: 'Lisa Anderson',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@acuvate.com',
    phone: '+1-555-0106',
    department: 'HR',
    location: 'Austin',
    designation: 'HR Manager',
    status: 'active',
    dateOfBirth: getDateYearsAgo(28, 0),
    dateOfJoining: getDateYearsAgo(7, 0),
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP007',
    name: 'Robert Taylor',
    firstName: 'Robert',
    lastName: 'Taylor',
    email: 'robert.taylor@acuvate.com',
    phone: '+1-555-0107',
    department: 'Operations',
    location: 'Denver',
    designation: 'Operations Coordinator',
    status: 'active',
    dateOfBirth: getDateInFuture(4), // Birthday in 4 days
    dateOfJoining: getDateYearsAgo(1, 5), // 1 year anniversary in 5 days
    hireType: 'Contract',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP008',
    name: 'Jennifer Martinez',
    firstName: 'Jennifer',
    lastName: 'Martinez',
    email: 'jennifer.martinez@acuvate.com',
    phone: '+1-555-0108',
    department: 'Design',
    location: 'Los Angeles',
    designation: 'UI/UX Designer',
    status: 'active',
    dateOfBirth: getDateInFuture(12), // Birthday in 12 days (outside 7 day window)
    dateOfJoining: getDateYearsAgo(3, 15),
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP009',
    name: 'James Garcia',
    firstName: 'James',
    lastName: 'Garcia',
    email: 'james.garcia@acuvate.com',
    phone: '+1-555-0109',
    department: 'Engineering',
    location: 'New York',
    designation: 'Senior Engineer',
    status: 'active',
    dateOfBirth: getDateYearsAgo(32, 0),
    dateOfJoining: getDateYearsAgo(6, 0),
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP010',
    name: 'Amanda White',
    firstName: 'Amanda',
    lastName: 'White',
    email: 'amanda.white@acuvate.com',
    phone: '+1-555-0110',
    department: 'Marketing',
    location: 'San Francisco',
    designation: 'Marketing Specialist',
    status: 'active',
    dateOfBirth: getDateInFuture(3), // Birthday in 3 days
    dateOfJoining: getDateYearsAgo(4, 8), // 4 year anniversary in 8 days
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  // Additional employees for this month's birthdays
  {
    employeeId: 'EMP011',
    name: 'Chris Johnson',
    firstName: 'Chris',
    lastName: 'Johnson',
    email: 'chris.johnson@acuvate.com',
    phone: '+1-555-0111',
    department: 'IT',
    location: 'Seattle',
    designation: 'IT Support',
    status: 'active',
    dateOfBirth: new Date(1990, new Date().getMonth(), 15), // This month, day 15
    dateOfJoining: getDateYearsAgo(2, 0),
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  },
  {
    employeeId: 'EMP012',
    name: 'Patricia Davis',
    firstName: 'Patricia',
    lastName: 'Davis',
    email: 'patricia.davis@acuvate.com',
    phone: '+1-555-0112',
    department: 'Finance',
    location: 'Boston',
    designation: 'Accountant',
    status: 'active',
    dateOfBirth: new Date(1985, new Date().getMonth(), 28), // This month, day 28
    dateOfJoining: getDateYearsAgo(8, 0),
    hireType: 'Permanent',
    employmentType: 'Full-Time'
  }
];

async function seedEmployees() {
  try {
    // Clear existing employees
    await Employee.deleteMany({});
    console.log('🗑️  Cleared existing employees');

    // Insert sample employees
    const result = await Employee.insertMany(sampleEmployees);
    console.log(`✅ Successfully seeded ${result.length} employees`);
    
    // Display summary
    console.log('\n📊 Employee Summary:');
    console.log(`  Total: ${result.length}`);
    console.log(`  Active: ${result.filter(e => e.status === 'active').length}`);
    
    // Calculate upcoming birthdays
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);
    
    const upcomingBirthdays = result.filter(emp => {
      const dob = new Date(emp.dateOfBirth);
      const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      return thisYearBirthday >= today && thisYearBirthday <= next7Days;
    });
    
    console.log(`\n🎂 Upcoming Birthdays (Next 7 days): ${upcomingBirthdays.length}`);
    upcomingBirthdays.forEach(emp => {
      const dob = new Date(emp.dateOfBirth);
      const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`  ${emp.name} - in ${daysUntil} days (${thisYearBirthday.toLocaleDateString()})`);
    });
    
    // Calculate upcoming anniversaries
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);
    
    const upcomingAnniversaries = result.filter(emp => {
      const doj = new Date(emp.dateOfJoining);
      const thisYearAnniversary = new Date(today.getFullYear(), doj.getMonth(), doj.getDate());
      return thisYearAnniversary >= today && thisYearAnniversary <= next30Days;
    });
    
    console.log(`\n🏆 Upcoming Anniversaries (Next 30 days): ${upcomingAnniversaries.length}`);
    upcomingAnniversaries.forEach(emp => {
      const doj = new Date(emp.dateOfJoining);
      const thisYearAnniversary = new Date(today.getFullYear(), doj.getMonth(), doj.getDate());
      const yearsOfService = today.getFullYear() - doj.getFullYear();
      const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`  ${emp.name} - ${yearsOfService} years in ${daysUntil} days`);
    });

  } catch (error) {
    console.error('❌ Error seeding employees:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the seed function
seedEmployees();

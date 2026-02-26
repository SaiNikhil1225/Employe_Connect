const mongoose = require('mongoose');

// MongoDB connection
const MONGO_URI = 'mongodb://localhost:27017/rmg-portal';

// Celebration Schema (matching the model)
const celebrationSchema = new mongoose.Schema({
  celebrationId: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  eventType: { type: String, required: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: Date, required: true },
  description: { type: String },
  status: { type: String, default: 'upcoming' },
  milestoneYears: { type: Number },
  budgetAllocated: { type: Number },
  budgetUsed: { type: Number },
  createdBy: { type: String, required: true },
  celebratedBy: { type: String },
  celebratedDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Celebration = mongoose.model('Celebration', celebrationSchema);

async function createTestCelebrations() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get some employees from database
    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
    const employees = await Employee.find({ status: 'active' }).limit(5);

    if (employees.length === 0) {
      console.log('❌ No employees found in database');
      process.exit(1);
    }

    console.log(`\n📊 Found ${employees.length} employees to create celebrations for\n`);

    // Create test celebrations
    const celebrations = [];
    const today = new Date();

    // Birthday celebration (today)
    if (employees[0]) {
      celebrations.push({
        celebrationId: 'CEL001',
        employeeId: employees[0].employeeId,
        employeeName: employees[0].name || `${employees[0].firstName} ${employees[0].lastName}`,
        department: employees[0].department || 'Engineering',
        location: employees[0].location || 'Hyderabad',
        eventType: 'birthday',
        eventTitle: 'Birthday Celebration',
        eventDate: today,
        description: 'Happy Birthday! Wishing you a wonderful day filled with joy and happiness.',
        status: 'upcoming',
        budgetAllocated: 2000,
        budgetUsed: 0,
        createdBy: 'HR Admin'
      });
    }

    // Work Anniversary (in 5 days)
    if (employees[1]) {
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 5);
      celebrations.push({
        celebrationId: 'CEL002',
        employeeId: employees[1].employeeId,
        employeeName: employees[1].name || `${employees[1].firstName} ${employees[1].lastName}`,
        department: employees[1].department || 'Engineering',
        location: employees[1].location || 'Hyderabad',
        eventType: 'anniversary',
        eventTitle: '5 Year Work Anniversary',
        eventDate: futureDate,
        description: 'Congratulations on completing 5 successful years with the organization!',
        status: 'upcoming',
        milestoneYears: 5,
        budgetAllocated: 5000,
        budgetUsed: 0,
        createdBy: 'HR Admin'
      });
    }

    // Achievement Award (celebrated yesterday)
    if (employees[2]) {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      celebrations.push({
        celebrationId: 'CEL003',
        employeeId: employees[2].employeeId,
        employeeName: employees[2].name || `${employees[2].firstName} ${employees[2].lastName}`,
        department: employees[2].department || 'Engineering',
        location: employees[2].location || 'Hyderabad',
        eventType: 'achievement',
        eventTitle: 'Employee of the Month',
        eventDate: yesterday,
        description: 'Recognized for outstanding performance and dedication to excellence.',
        status: 'celebrated',
        budgetAllocated: 3000,
        budgetUsed: 2500,
        celebratedBy: 'HR Admin',
        celebratedDate: yesterday,
        createdBy: 'HR Admin'
      });
    }

    // Team Lunch (tomorrow)
    if (employees[3]) {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      celebrations.push({
        celebrationId: 'CEL004',
        employeeId: employees[3].employeeId,
        employeeName: employees[3].name || `${employees[3].firstName} ${employees[3].lastName}`,
        department: employees[3].department || 'Engineering',
        location: employees[3].location || 'Hyderabad',
        eventType: 'custom',
        eventTitle: 'Project Completion Celebration',
        eventDate: tomorrow,
        description: 'Team celebration for successfully completing the Q1 project ahead of schedule.',
        status: 'upcoming',
        budgetAllocated: 10000,
        budgetUsed: 0,
        createdBy: 'HR Admin'
      });
    }

    // 10 Year Anniversary (in 30 days)
    if (employees[4]) {
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 30);
      celebrations.push({
        celebrationId: 'CEL005',
        employeeId: employees[4].employeeId,
        employeeName: employees[4].name || `${employees[4].firstName} ${employees[4].lastName}`,
        department: employees[4].department || 'Engineering',
        location: employees[4].location || 'Hyderabad',
        eventType: 'anniversary',
        eventTitle: '10 Year Milestone Anniversary',
        eventDate: futureDate,
        description: 'A decade of dedication! Celebrating 10 years of exceptional contribution.',
        status: 'upcoming',
        milestoneYears: 10,
        budgetAllocated: 15000,
        budgetUsed: 0,
        createdBy: 'HR Admin'
      });
    }

    // Insert celebrations
    const results = await Celebration.insertMany(celebrations);
    
    console.log('✅ Test Celebrations Created:\n');
    results.forEach((cel, index) => {
      console.log(`${index + 1}. ${cel.celebrationId} - ${cel.employeeName}`);
      console.log(`   Event: ${cel.eventTitle}`);
      console.log(`   Date: ${cel.eventDate.toDateString()}`);
      console.log(`   Status: ${cel.status}`);
      console.log(`   Budget: ₹${cel.budgetAllocated?.toLocaleString() || 'N/A'}`);
      console.log('');
    });

    console.log(`\n📊 Total celebrations created: ${results.length}`);
    console.log('\n✅ Test data ready! Refresh the Recognition & Celebrations page to see them.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createTestCelebrations();

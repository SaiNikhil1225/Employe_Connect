const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rmg-portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple schema definition
const celebrationSchema = new mongoose.Schema({
  celebrationId: String,
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  department: String,
  location: String,
  eventType: { 
    type: String, 
    enum: ['birthday', 'anniversary', 'achievement', 'promotion', 'spot-recognition', 'team-award', 'custom'], 
    required: true 
  },
  eventTitle: { type: String, required: true },
  eventDate: { type: Date, required: true },
  description: String,
  recognitionCategory: String,
  milestoneYears: Number,
  status: { 
    type: String, 
    enum: ['draft', 'scheduled', 'upcoming', 'celebrated', 'missed'], 
    default: 'upcoming' 
  },
  visibility: String,
  notifyEmployee: Boolean,
  notifyTeam: Boolean,
  sendEmail: Boolean,
  awardDetails: String,
  budgetAllocated: Number,
  budgetUsed: Number,
  celebratedBy: String,
  celebratedDate: Date,
  createdBy: String,
  message: String,
  avatar: String,
}, { timestamps: true, strict: true });

celebrationSchema.pre('save', async function(next) {
  if (!this.celebrationId) {
    const count = await Celebration.countDocuments();
    this.celebrationId = `CEL-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const Celebration = mongoose.model('Celebration', celebrationSchema);

const sampleCelebrations = [
  {
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    department: 'Engineering',
    location: 'New York',
    eventType: 'birthday',
    eventTitle: 'Birthday Celebration',
    eventDate: new Date('2026-02-25'),
    description: 'Wishing John a very happy birthday!',
    status: 'upcoming',
    visibility: 'public',
    notifyEmployee: true,
    sendEmail: true,
    createdBy: 'HR Admin'
  },
  {
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    department: 'Marketing',
    location: 'San Francisco',
    eventType: 'anniversary',
    eventTitle: '5 Year Work Anniversary',
    eventDate: new Date('2026-03-01'),
    description: 'Celebrating 5 amazing years with the company!',
    milestoneYears: 5,
    status: 'upcoming',
    visibility: 'public',
    notifyEmployee: true,
    notifyTeam: true,
    sendEmail: true,
    budgetAllocated: 500,
    createdBy: 'HR Admin'
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Michael Chen',
    department: 'Engineering',
    location: 'Seattle',
    eventType: 'achievement',
    eventTitle: 'Excellence in Innovation Award',
    eventDate: new Date('2026-02-20'),
    description: 'Recognized for outstanding innovation in product development',
    recognitionCategory: 'innovation',
    status: 'celebrated',
    visibility: 'public',
    notifyEmployee: true,
    notifyTeam: true,
    sendEmail: true,
    awardDetails: 'Trophy and $1000 bonus',
    budgetAllocated: 1000,
    budgetUsed: 1000,
    celebratedBy: 'HR Admin',
    celebratedDate: new Date('2026-02-20'),
    createdBy: 'HR Admin'
  },
  {
    employeeId: 'EMP004',
    employeeName: 'Emily Brown',
    department: 'Sales',
    location: 'Boston',
    eventType: 'birthday',
    eventTitle: 'Birthday Celebration',
    eventDate: new Date('2026-02-28'),
    description: 'Happy birthday Emily!',
    status: 'upcoming',
    visibility: 'public',
    notifyEmployee: true,
    sendEmail: true,
    createdBy: 'HR Admin'
  },
  {
    employeeId: 'EMP005',
    employeeName: 'David Wilson',
    department: 'Finance',
    location: 'Chicago',
    eventType: 'anniversary',
    eventTitle: '10 Year Work Anniversary',
    eventDate: new Date('2026-03-15'),
    description: 'A decade of dedication and excellence!',
    milestoneYears: 10,
    status: 'upcoming',
    visibility: 'public',
    notifyEmployee: true,
    notifyTeam: true,
    sendEmail: true,
    budgetAllocated: 1000,
    createdBy: 'HR Admin'
  },
  {
    employeeId: 'EMP006',
    employeeName: 'Lisa Anderson',
    department: 'HR',
    location: 'Austin',
    eventType: 'spot-recognition',
    eventTitle: 'Outstanding Customer Service',
    eventDate: new Date('2026-02-18'),
    description: 'Going above and beyond to help team members',
    recognitionCategory: 'customer-service',
    status: 'celebrated',
    visibility: 'public',
    notifyEmployee: true,
    sendEmail: true,
    awardDetails: 'Gift card',
    budgetAllocated: 100,
    budgetUsed: 100,
    celebratedBy: 'HR Admin',
    celebratedDate: new Date('2026-02-18'),
    createdBy: 'HR Admin'
  },
  {
    employeeId: 'EMP007',
    employeeName: 'Robert Taylor',
    department: 'Operations',
    location: 'Denver',
    eventType: 'anniversary',
    eventTitle: '1 Year Work Anniversary',
    eventDate: new Date('2026-02-26'),
    description: 'Celebrating your first year with us!',
    milestoneYears: 1,
    status: 'upcoming',
    visibility: 'public',
    notifyEmployee: true,
    sendEmail: true,
    createdBy: 'HR Admin'
  },
  {
    employeeId: 'EMP008',
    employeeName: 'Jennifer Martinez',
    department: 'Design',
    location: 'Los Angeles',
    eventType: 'birthday',
    eventTitle: 'Birthday Celebration',
    eventDate: new Date('2026-03-05'),
    description: 'Wishing Jennifer a wonderful birthday!',
    status: 'upcoming',
    visibility: 'public',
    notifyEmployee: true,
    sendEmail: true,
    createdBy: 'HR Admin'
  },
  {
    employeeId: 'EMP009',
    employeeName: 'James Garcia',
    department: 'Engineering',
    location: 'New York',
    eventType: 'promotion',
    eventTitle: 'Promotion to Senior Engineer',
    eventDate: new Date('2026-02-15'),
    description: 'Congratulations on your well-deserved promotion!',
    status: 'celebrated',
    visibility: 'public',
    notifyEmployee: true,
    notifyTeam: true,
    sendEmail: true,
    celebratedBy: 'HR Admin',
    celebratedDate: new Date('2026-02-15'),
    createdBy: 'HR Admin'
  },
  {
    employeeId: 'EMP010',
    employeeName: 'Amanda White',
    department: 'Marketing',
    location: 'San Francisco',
    eventType: 'team-award',
    eventTitle: 'Best Team Collaboration',
    eventDate: new Date('2026-02-22'),
    description: 'Recognizing exceptional teamwork and collaboration',
    recognitionCategory: 'teamwork',
    status: 'upcoming',
    visibility: 'public',
    notifyEmployee: true,
    notifyTeam: true,
    sendEmail: true,
    awardDetails: 'Team lunch and certificates',
    budgetAllocated: 300,
    createdBy: 'HR Admin'
  }
];

async function seedCelebrations() {
  try {
    // Clear existing celebrations
    await Celebration.deleteMany({});
    console.log('Cleared existing celebrations');

    // Insert sample celebrations
    const result = await Celebration.insertMany(sampleCelebrations);
    console.log(`✅ Successfully seeded ${result.length} celebrations`);
    
    // Display summary
    console.log('\nCelebration Summary:');
    const byType = await Celebration.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    byType.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    const byStatus = await Celebration.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\nBy Status:');
    byStatus.forEach(item => {
      console.log(`  ${item._id}: ${item.count}`);
    });

  } catch (error) {
    console.error('Error seeding celebrations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the seed function
seedCelebrations();

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rmg-portal')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Schemas
const employeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model('Employee', employeeSchema);

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

async function syncCelebrations() {
  try {
    console.log('\n🔄 Starting celebration sync from employee data...\n');

    // Get all active employees
    const employees = await Employee.find({ status: 'active' });
    console.log(`📊 Found ${employees.length} active employees`);

    // Clear existing birthday and anniversary celebrations (keeping manual ones)
    const deleted = await Celebration.deleteMany({ 
      eventType: { $in: ['birthday', 'anniversary'] } 
    });
    console.log(`🗑️  Deleted ${deleted.deletedCount} existing birthday/anniversary celebrations`);

    const today = new Date();
    const celebrations = [];

    // Generate birthday celebrations (upcoming within 90 days)
    for (const emp of employees) {
      if (emp.dateOfBirth) {
        const dob = new Date(emp.dateOfBirth);
        const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        
        // If birthday already passed this year, check next year
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        // Days until birthday
        const daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));

        // Create celebration for upcoming birthdays (next 90 days)
        if (daysUntil <= 90) {
          celebrations.push({
            employeeId: emp.employeeId,
            employeeName: emp.name,
            department: emp.department,
            location: emp.location,
            eventType: 'birthday',
            eventTitle: 'Birthday Celebration',
            eventDate: thisYearBirthday,
            description: `Wishing ${emp.firstName || emp.name} a very happy birthday!`,
            status: daysUntil <= 0 ? 'celebrated' : 'upcoming',
            visibility: 'public',
            notifyEmployee: true,
            sendEmail: true,
            createdBy: 'System'
          });
        }
      }
    }

    // Generate anniversary celebrations (upcoming within 90 days)
    for (const emp of employees) {
      if (emp.dateOfJoining) {
        const doj = new Date(emp.dateOfJoining);
        const yearsOfService = today.getFullYear() - doj.getFullYear();
        
        // Only create anniversary celebrations for 1+ years
        if (yearsOfService > 0) {
          const thisYearAnniversary = new Date(today.getFullYear(), doj.getMonth(), doj.getDate());
          
          // If anniversary already passed this year, check next year
          if (thisYearAnniversary < today) {
            thisYearAnniversary.setFullYear(today.getFullYear() + 1);
          }

          const daysUntil = Math.ceil((thisYearAnniversary - today) / (1000 * 60 * 60 * 24));

          // Create celebration for upcoming anniversaries (next 90 days)
          if (daysUntil <= 90) {
            const actualYears = thisYearAnniversary.getFullYear() - doj.getFullYear();
            const isMilestone = [1, 5, 10, 15, 20, 25].includes(actualYears);
            
            celebrations.push({
              employeeId: emp.employeeId,
              employeeName: emp.name,
              department: emp.department,
              location: emp.location,
              eventType: 'anniversary',
              eventTitle: `${actualYears} Year Work Anniversary`,
              eventDate: thisYearAnniversary,
              description: actualYears >= 10 
                ? `Celebrating ${actualYears} amazing years with the company!` 
                : `Congratulations on ${actualYears} ${actualYears === 1 ? 'year' : 'years'} with us!`,
              milestoneYears: actualYears,
              status: daysUntil <= 0 ? 'celebrated' : 'upcoming',
              visibility: 'public',
              notifyEmployee: true,
              notifyTeam: isMilestone,
              sendEmail: true,
              budgetAllocated: isMilestone ? 500 : 0,
              createdBy: 'System'
            });
          }
        }
      }
    }

    // Insert all celebrations
    if (celebrations.length > 0) {
      const result = await Celebration.insertMany(celebrations);
      console.log(`✅ Created ${result.length} dynamic celebrations`);
      
      // Summary
      const birthdayCount = celebrations.filter(c => c.eventType === 'birthday').length;
      const anniversaryCount = celebrations.filter(c => c.eventType === 'anniversary').length;
      
      console.log('\n📊 Celebration Summary:');
      console.log(`  🎂 Birthdays: ${birthdayCount}`);
      console.log(`  🏆 Anniversaries: ${anniversaryCount}`);
      
      // Show upcoming events (next 30 days)
      const upcomingEvents = celebrations
        .filter(c => {
          const daysUntil = Math.ceil((new Date(c.eventDate) - today) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 30;
        })
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

      console.log('\n📅 Upcoming Events (Next 30 Days):');
      upcomingEvents.slice(0, 10).forEach(evt => {
        const daysUntil = Math.ceil((new Date(evt.eventDate) - today) / (1000 * 60 * 60 * 24));
        const dateStr = new Date(evt.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        console.log(`  ${evt.employeeName} - ${evt.eventTitle} (${dateStr}, in ${daysUntil} days)`);
      });

      if (upcomingEvents.length > 10) {
        console.log(`  ... and ${upcomingEvents.length - 10} more`);
      }
    } else {
      console.log('⚠️  No celebrations to create (no upcoming birthdays/anniversaries in next 90 days)');
    }

  } catch (error) {
    console.error('❌ Error syncing celebrations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the sync
syncCelebrations();

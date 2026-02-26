// Quick script to enable login access for key users
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function enableLoginAccess() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));

    // Enable login access for key users
    const emails = [
      'hr@acuvate.com',
      'sainikhil.bomma@acuvate.com',
      'mohan.reddy@acuvate.com'
    ];

    console.log('📝 Enabling login access for users...');
    
    for (const email of emails) {
      const result = await Employee.updateOne(
        { email: email.toLowerCase() },
        { 
          $set: { 
            hasLoginAccess: true,
            isActive: true
          }
        }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Enabled login for: ${email}`);
      } else {
        console.log(`⚠️  User not found: ${email}`);
      }
    }

    // Also enable for all HR, RMG roles
    const roleResult = await Employee.updateMany(
      { 
        role: { $in: ['HR', 'RMG', 'MANAGER', 'IT_ADMIN', 'SUPER_ADMIN'] }
      },
      { 
        $set: { 
          hasLoginAccess: true,
          isActive: true
        }
      }
    );
    
    console.log(`✅ Enabled login for ${roleResult.modifiedCount} role-based users`);

    console.log('✅ Login access enabled successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

enableLoginAccess();

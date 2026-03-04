/**
 * Insert Test Permission for MGR001
 * This will disable EMPLOYEE module permissions for testing
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/rmg-portal'; // Update if different

const ModulePermissionSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  module: { 
    type: String, 
    enum: ['EMPLOYEE', 'HR', 'RMG', 'HELPDESK', 'LEAVE'],
    required: true 
  },
  enabled: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  permissions: {
    view: { type: Boolean, default: false },
    add: { type: Boolean, default: false },
    modify: { type: Boolean, default: false }
  }
}, { timestamps: true });

const ModulePermission = mongoose.model('ModulePermission', ModulePermissionSchema);

async function insertTestPermission() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete existing permission for MGR001 EMPLOYEE module
    await ModulePermission.deleteMany({ 
      employeeId: 'MGR001', 
      module: 'EMPLOYEE' 
    });
    console.log('🗑️  Cleared existing EMPLOYEE permission for MGR001\n');

    // Insert new permission with all permissions disabled
    const newPermission = await ModulePermission.create({
      employeeId: 'MGR001',
      module: 'EMPLOYEE',
      enabled: true,
      isAdmin: false,
      permissions: {
        view: false,
        add: false,
        modify: false
      }
    });

    console.log('✅ Test permission created successfully!\n');
    console.log('Details:');
    console.log('  Employee ID: MGR001');
    console.log('  Module: EMPLOYEE');
    console.log('  Enabled: true');
    console.log('  Permissions: ALL DISABLED (view: false, add: false, modify: false)');
    console.log('\n📝 You can now test - API calls should return 403 Forbidden\n');

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

insertTestPermission();

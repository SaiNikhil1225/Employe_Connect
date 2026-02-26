const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./dist/models/Employee.js').default;

mongoose.connect('mongodb://localhost:27017/rmg-portal')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existing = await Employee.findOne({ email: 'sushmitha@acuvate.com' });
    if (existing) {
      console.log('❌ User already exists');
      process.exit(1);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Sushmitha@123', 10);
    
    // Create new employee
    const newEmployee = new Employee({
      employeeId: 'EMP010',
      name: 'Sushmitha Kolisetty',
      firstName: 'Sushmitha',
      lastName: 'Kolisetty',
      email: 'sushmitha@acuvate.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      department: 'IT',
      designation: 'Software Engineer',
      dateOfJoining: new Date('2024-01-15'),
      phoneNumber: '9876543210',
      phone: '9876543210',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Family',
        phoneNumber: '9876543211'
      },
      address: {
        street: '123 Main St',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500001',
        country: 'India'
      },
      employmentType: 'Full-time',
      leavePlan: 'Acuvate',
      probationEndDate: new Date('2024-04-15'),
      confirmationDate: new Date('2024-04-15'),
      status: 'active',
      hasLoginAccess: true,
      isActive: true
    });
    
    await newEmployee.save();
    
    console.log('\n✅ User created successfully!');
    console.log('Employee ID: EMP010');
    console.log('Email: sushmitha@acuvate.com');
    console.log('Password: Sushmitha@123');
    console.log('Role: EMPLOYEE');
    console.log('Department: IT');
    console.log('Leave Plan: Acuvate');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });

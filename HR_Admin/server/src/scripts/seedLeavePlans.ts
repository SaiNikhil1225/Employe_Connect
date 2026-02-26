import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LeavePlan from '../models/LeavePlan';

dotenv.config();

export const leavePlansData = [
  {
    planName: 'Probation',
    description: 'Leave plan for employees on probation period (first 6 months)',
    eligibility: 'Employees on probation period',
    leaveTypes: [
      {
        type: 'Casual Leave',
        annualAllocation: 6,
        accrualType: 'monthly',
        accrualRate: 1,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 2,
        maxConsecutiveDays: 2,
        requiresMedicalCertificate: false,
        paidLeave: true
      },
      {
        type: 'Loss of Pay',
        annualAllocation: 0,
        accrualType: 'on-demand',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 0,
        maxConsecutiveDays: 365,
        requiresMedicalCertificate: false,
        paidLeave: false
      }
    ]
  },
  {
    planName: 'Acuvate',
    description: 'Leave plan for confirmed employees in India',
    eligibility: 'Confirmed employees working in India locations',
    leaveTypes: [
      {
        type: 'Earned Leave',
        annualAllocation: 20,
        accrualType: 'quarterly',
        accrualRate: 5,
        carryForwardAllowed: true,
        maxCarryForward: 10,
        carryForwardExpiry: 'June 30',
        encashmentAllowed: true,
        maxEncashment: 15,
        noticePeriodDays: 7,
        maxConsecutiveDays: 15,
        requiresMedicalCertificate: false,
        paidLeave: true
      },
      {
        type: 'Casual Leave',
        annualAllocation: 12,
        accrualType: 'monthly',
        accrualRate: 1,
        carryForwardAllowed: true,
        maxCarryForward: 5,
        carryForwardExpiry: 'December 31',
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 2,
        maxConsecutiveDays: 3,
        requiresMedicalCertificate: false,
        paidLeave: true
      },
      {
        type: 'Sick Leave',
        annualAllocation: 10,
        accrualType: 'monthly',
        accrualRate: 0.83,
        carryForwardAllowed: true,
        maxCarryForward: 3,
        carryForwardExpiry: 'December 31',
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 0,
        maxConsecutiveDays: 10,
        requiresMedicalCertificate: true,
        paidLeave: true
      },
      {
        type: 'Compensatory Off',
        annualAllocation: 0,
        accrualType: 'on-demand',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 2,
        maxConsecutiveDays: 10,
        requiresMedicalCertificate: false,
        paidLeave: true
      },
      {
        type: 'Maternity Leave',
        annualAllocation: 180,
        accrualType: 'annual',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 30,
        maxConsecutiveDays: 180,
        requiresMedicalCertificate: true,
        paidLeave: true
      },
      {
        type: 'Paternity Leave',
        annualAllocation: 3,
        accrualType: 'annual',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 7,
        maxConsecutiveDays: 3,
        requiresMedicalCertificate: true,
        paidLeave: true
      }
    ]
  },
  {
    planName: 'UK',
    description: 'Leave plan for employees in UK locations',
    eligibility: 'Employees working in UK locations',
    leaveTypes: [
      {
        type: 'Annual Leave',
        annualAllocation: 28,
        accrualType: 'monthly',
        accrualRate: 2.33,
        carryForwardAllowed: true,
        maxCarryForward: 5,
        carryForwardExpiry: '3 months',
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 14,
        maxConsecutiveDays: 28,
        requiresMedicalCertificate: false,
        paidLeave: true
      },
      {
        type: 'Sick Leave',
        annualAllocation: 10,
        accrualType: 'annual',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 0,
        maxConsecutiveDays: 365,
        requiresMedicalCertificate: true,
        paidLeave: true
      },
      {
        type: 'Maternity Leave',
        annualAllocation: 364,
        accrualType: 'annual',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 90,
        maxConsecutiveDays: 364,
        requiresMedicalCertificate: true,
        paidLeave: true
      },
      {
        type: 'Paternity Leave',
        annualAllocation: 14,
        accrualType: 'annual',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 28,
        maxConsecutiveDays: 14,
        requiresMedicalCertificate: true,
        paidLeave: true
      },
      {
        type: 'Loss of Pay',
        annualAllocation: 0,
        accrualType: 'on-demand',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 0,
        maxConsecutiveDays: 365,
        requiresMedicalCertificate: false,
        paidLeave: false
      }
    ]
  },
  {
    planName: 'Consultant',
    description: 'Leave plan for consultant/contract employees',
    eligibility: 'Employees on consultant/contract basis',
    leaveTypes: [
      {
        type: 'Casual Leave',
        annualAllocation: 10,
        accrualType: 'annual',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 5,
        maxConsecutiveDays: 10,
        requiresMedicalCertificate: false,
        paidLeave: true
      },
      {
        type: 'Loss of Pay',
        annualAllocation: 0,
        accrualType: 'on-demand',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 0,
        maxConsecutiveDays: 365,
        requiresMedicalCertificate: false,
        paidLeave: false
      }
    ]
  },
  {
    planName: 'Confirmation',
    description: 'Transition leave plan during probation-to-permanent conversion',
    eligibility: 'Employees transitioning from probation to confirmed status',
    leaveTypes: [
      {
        type: 'Earned Leave',
        annualAllocation: 10,
        accrualType: 'monthly',
        accrualRate: 1.67,
        carryForwardAllowed: true,
        maxCarryForward: 10,
        carryForwardExpiry: 'June 30',
        encashmentAllowed: true,
        maxEncashment: 15,
        noticePeriodDays: 7,
        maxConsecutiveDays: 15,
        requiresMedicalCertificate: false,
        paidLeave: true
      },
      {
        type: 'Casual Leave',
        annualAllocation: 6,
        accrualType: 'monthly',
        accrualRate: 1,
        carryForwardAllowed: true,
        maxCarryForward: 5,
        carryForwardExpiry: 'December 31',
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 2,
        maxConsecutiveDays: 3,
        requiresMedicalCertificate: false,
        paidLeave: true
      },
      {
        type: 'Sick Leave',
        annualAllocation: 5,
        accrualType: 'monthly',
        accrualRate: 0.83,
        carryForwardAllowed: true,
        maxCarryForward: 3,
        carryForwardExpiry: 'December 31',
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 0,
        maxConsecutiveDays: 10,
        requiresMedicalCertificate: true,
        paidLeave: true
      },
      {
        type: 'Loss of Pay',
        annualAllocation: 0,
        accrualType: 'on-demand',
        accrualRate: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false,
        maxEncashment: 0,
        noticePeriodDays: 0,
        maxConsecutiveDays: 365,
        requiresMedicalCertificate: false,
        paidLeave: false
      }
    ]
  }
];

export async function seedLeavePlans() {
  try {
    console.log('Seeding leave plans...');
    
    for (const planData of leavePlansData) {
      await LeavePlan.findOneAndUpdate(
        { planName: planData.planName },
        planData,
        { upsert: true, new: true }
      );
      console.log(`✓ Seeded ${planData.planName} leave plan`);
    }
    
    console.log('Leave plans seeded successfully!');
  } catch (error) {
    console.error('Error seeding leave plans:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal')
    .then(async () => {
      console.log('Connected to MongoDB');
      await seedLeavePlans();
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database connection error:', error);
      process.exit(1);
    });
}

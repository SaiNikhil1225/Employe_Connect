import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  id: String, // Legacy field for backward compatibility
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  // Authentication fields
  password: {
    type: String,
    required: false, // Optional for employees without login access
    select: false // Don't include in queries by default
  },
  role: {
    type: String,
    required: true,
    enum: [
      'EMPLOYEE',      // Regular employee
      'MANAGER',       // Team manager
      'HR',            // HR personnel
      'RMG',           // Resource Management Group
      'IT_ADMIN',      // IT Administrator
      'IT_EMPLOYEE',   // IT Specialist/Support
      'L1_APPROVER',   // Level 1 Approver (Team Lead)
      'L2_APPROVER',   // Level 2 Approver (Manager)
      'L3_APPROVER',   // Level 3 Approver (Director)
      'SUPER_ADMIN',   // Super Admin - Full system access
    ],
    default: 'EMPLOYEE'
  },
  // Employee details
  phone: String,
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  dateOfJoining: String,
  reportingManager: mongoose.Schema.Types.Mixed,
  location: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  avatar: String,
  profilePhoto: String, // Alias for avatar - used by frontend
  skills: [String],
  experience: Number,
  education: String,
  address: mongoose.Schema.Types.Mixed,
  emergencyContact: mongoose.Schema.Types.Mixed,
  // Access control
  isActive: {
    type: Boolean,
    default: true
  },
  hasLoginAccess: {
    type: Boolean,
    default: false // Only true if password is set and role requires login
  },
  // IT Specialist specific fields
  specializations: [String], // For IT_EMPLOYEE role
  team: String, // For IT_EMPLOYEE role
  activeTicketCount: {
    type: Number,
    default: 0
  },
  maxCapacity: {
    type: Number,
    default: 10
  },
  
  // Extended Employee Onboarding Fields
  // Step 1: Basic Information (Extended)
  displayName: String,
  firstName: String,
  middleName: String,
  lastName: String,
  dialCode: String,
  mobileNumber: String,
  gender: String,
  dateOfBirth: String,
  
  // Step 2: Employment Details (Extended)
  contractEndDate: String,
  legalEntity: String,
  subDepartment: String,
  businessUnit: String,
  secondaryJobTitle: String,
  workerType: String,
  reportingManagerId: String,
  dottedLineManagerId: String,
  dottedLineManager: mongoose.Schema.Types.Mixed,
  leavePlan: {
    type: String,
    enum: ['Probation', 'Acuvate', 'Confirmation', 'Consultant', 'UK'],
    default: 'Probation'
  },
  employmentType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Contract', 'Consultant', 'Probation'],
    default: 'Probation'
  },
  probationEndDate: Date,
  confirmationDate: Date,
  
  // Step 3: Contact Information
  workPhone: String,
  residenceNumber: String,
  personalEmail: String,
  
  // Step 4: Family & Personal Details
  maritalStatus: String,
  marriageDate: String,
  fatherName: String,
  motherName: String,
  spouseName: String,
  spouseGender: String,
  physicallyHandicapped: String,
  bloodGroup: String,
  nationality: String,
  
  // Step 5: PAN Details
  panCardAvailable: String,
  panNumber: {
    type: String,
    required: [true, 'PAN Number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v);
      },
      message: 'PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)'
    }
  },
  fullNameAsPerPAN: String,
  dobInPAN: String,
  parentsNameAsPerPAN: String,
  
  // Step 6: Bank & Salary Details
  salaryPaymentMode: String,
  bankName: String,
  accountNumber: String,
  ifscCode: String,
  nameOnAccount: String,
  branch: String,
  
  // Additional Banking Information
  secondaryBankName: String,
  secondaryAccountNumber: String,
  secondaryIfscCode: String,
  
  // Medical Information
  medicalInfo: {
    bloodGroup: String,
    allergies: [String],
    chronicConditions: [String],
    medications: [String],
    insuranceProvider: String,
    insurancePolicyNumber: String,
    insuranceValidUntil: Date,
    lastCheckupDate: Date,
    vaccinationRecords: [{
      vaccineName: String,
      dateAdministered: Date,
      nextDueDate: Date
    }]
  },
  
  // Emergency Contacts (Enhanced)
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    alternatePhoneNumber: String,
    email: String,
    address: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Family Details
  familyMembers: [{
    name: String,
    relationship: String,
    dateOfBirth: Date,
    phoneNumber: String,
    occupation: String,
    isDependent: {
      type: Boolean,
      default: false
    },
    isNominee: {
      type: Boolean,
      default: false
    }
  }],
  
  // Educational Qualifications (Enhanced)
  educationHistory: [{
    degree: String,
    institution: String,
    university: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    grade: String,
    achievements: String,
    documentUrl: String
  }],
  
  // Work History
  workHistory: [{
    companyName: String,
    designation: String,
    department: String,
    startDate: Date,
    endDate: Date,
    currentlyWorking: {
      type: Boolean,
      default: false
    },
    responsibilities: String,
    reasonForLeaving: String,
    managerName: String,
    managerContact: String,
    salary: Number,
    documentUrl: String
  }],
  
  // Certifications & Licenses
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String,
    documentUrl: String
  }],
  
  // Assets Assigned
  assetsAssigned: [{
    assetType: String, // Laptop, Phone, ID Card, etc.
    assetId: String,
    serialNumber: String,
    assignedDate: Date,
    returnDate: Date,
    status: {
      type: String,
      enum: ['assigned', 'returned', 'damaged', 'lost'],
      default: 'assigned'
    },
    condition: String,
    notes: String
  }],
  
  // Onboarding Status
  onboardingStatus: {
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    startDate: Date,
    completionDate: Date,
    assignedBuddyId: String,
    assignedBuddy: mongoose.Schema.Types.Mixed,
    welcomeKitIssued: {
      type: Boolean,
      default: false
    },
    welcomeKitIssuedDate: Date,
    documentsSubmitted: {
      type: Boolean,
      default: false
    },
    trainingCompleted: {
      type: Boolean,
      default: false
    },
    systemAccessProvided: {
      type: Boolean,
      default: false
    }
  },
  
  // Offboarding Status
  offboardingStatus: {
    status: {
      type: String,
      enum: ['not-initiated', 'in-progress', 'completed'],
      default: 'not-initiated'
    },
    initiatedDate: Date,
    lastWorkingDay: Date,
    exitInterviewDate: Date,
    exitInterviewCompleted: {
      type: Boolean,
      default: false
    },
    assetsReturned: {
      type: Boolean,
      default: false
    },
    accessRevoked: {
      type: Boolean,
      default: false
    },
    finalSettlementStatus: {
      type: String,
      enum: ['pending', 'processed', 'completed'],
      default: 'pending'
    },
    finalSettlementAmount: Number,
    experienceLetterIssued: {
      type: Boolean,
      default: false
    },
    clearanceFormCompleted: {
      type: Boolean,
      default: false
    }
  },
  
  // Performance & Career
  currentGrade: String,
  currentLevel: String,
  lastPromotionDate: Date,
  lastIncrementDate: Date,
  lastIncrementPercentage: Number,
  
  // Probation Details
  probationPeriod: Number, // in months
  probationStartDate: Date,
  probationStatus: {
    type: String,
    enum: ['on-probation', 'confirmed', 'extended', 'terminated'],
    default: 'on-probation'
  },
  
  // Notice Period
  noticePeriod: {
    type: Number,
    default: 30 // in days
  },
  
  // Additional Fields
  preferredLanguage: String,
  timezone: String,
  linkedInUrl: String,
  githubUrl: String,
  portfolioUrl: String,
  
  // Experience Fields
  previousExperience: {
    years: {
      type: Number,
      default: 0,
      min: [0, 'Years cannot be negative'],
      max: [50, 'Years cannot exceed 50']
    },
    months: {
      type: Number,
      default: 0,
      min: [0, 'Months cannot be negative'],
      max: [11, 'Months must be between 0-11']
    }
  },
  
}, { timestamps: true, strict: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }); // Changed to false to allow additional fields

// Helper function to calculate months between dates
function calculateMonthsBetween(startDate: string | Date | undefined): number {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const now = new Date();
  
  // If start date is in future, return 0
  if (start > now) return 0;
  
  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  const days = now.getDate() - start.getDate();
  
  let totalMonths = years * 12 + months;
  
  // If current day is before start day, subtract 1 month
  if (days < 0) {
    totalMonths -= 1;
  }
  
  return Math.max(0, totalMonths);
}

// Virtual field for Acuvate experience in months
employeeSchema.virtual('acuvateExperienceMonths').get(function() {
  if (!this.dateOfJoining) return 0;
  return calculateMonthsBetween(this.dateOfJoining);
});

// Virtual field for Acuvate experience formatted
employeeSchema.virtual('acuvateExperience').get(function() {
  if (!this.dateOfJoining) return '0 Months';
  const months = calculateMonthsBetween(this.dateOfJoining);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0 && remainingMonths === 0) return '0 Months';
  if (years === 0) return `${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;
  if (remainingMonths === 0) return `${years} Year${years > 1 ? 's' : ''}`;
  return `${years} Year${years > 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;
});

// Virtual field for previous experience in months
employeeSchema.virtual('previousExperienceMonths').get(function() {
  if (!this.previousExperience) return 0;
  return (this.previousExperience.years || 0) * 12 + (this.previousExperience.months || 0);
});

// Virtual field for previous experience formatted
employeeSchema.virtual('previousExperienceFormatted').get(function() {
  if (!this.previousExperience) return '0 Months';
  
  const years = this.previousExperience.years || 0;
  const months = this.previousExperience.months || 0;
  
  if (years === 0 && months === 0) return '0 Months';
  if (years === 0) return `${months} Month${months > 1 ? 's' : ''}`;
  if (months === 0) return `${years} Year${years > 1 ? 's' : ''}`;
  return `${years} Year${years > 1 ? 's' : ''} ${months} Month${months > 1 ? 's' : ''}`;
});

// Virtual field for total experience in months
employeeSchema.virtual('totalExperienceMonths').get(function() {
  const acuvateMonths = this.dateOfJoining ? calculateMonthsBetween(this.dateOfJoining) : 0;
  const previousMonths = this.previousExperience 
    ? (this.previousExperience.years || 0) * 12 + (this.previousExperience.months || 0)
    : 0;
  return previousMonths + acuvateMonths;
});

// Virtual field for total experience formatted
employeeSchema.virtual('totalExperience').get(function() {
  const totalMonths = this.get('totalExperienceMonths');
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  if (years === 0 && months === 0) return '0 Months';
  if (years === 0) return `${months} Month${months > 1 ? 's' : ''}`;
  if (months === 0) return `${years} Year${years > 1 ? 's' : ''}`;
  return `${years} Year${years > 1 ? 's' : ''} ${months} Month${months > 1 ? 's' : ''}`;
});

// Indexes for faster lookups
// Note: employeeId, email, and panNumber already have unique indexes from 'unique: true' in schema
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ hasLoginAccess: 1, isActive: 1 });

// Delete the model if it already exists to allow re-compilation
if (mongoose.models.Employee) {
  delete mongoose.models.Employee;
}

export default mongoose.model('Employee', employeeSchema);

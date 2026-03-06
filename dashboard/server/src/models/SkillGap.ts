import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  designation: String,
  location: String,
  grade: String,
  employmentType: String,
  
  // Current Skills
  currentSkills: [{
    skillName: {
      type: String,
      required: true
    },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true
    },
    proficiencyScore: {
      type: Number,
      min: 0,
      max: 100
    },
    lastAssessedDate: Date,
    yearsOfExperience: Number
  }],
  
  // Required Skills for current role
  requiredSkills: [{
    skillName: {
      type: String,
      required: true
    },
    requiredProficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true
    },
    requiredProficiencyScore: {
      type: Number,
      min: 0,
      max: 100
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium'
    },
    category: String // Technical, Soft Skills, etc.
  }],
  
  // Identified Gaps
  skillGaps: [{
    skillName: {
      type: String,
      required: true
    },
    currentLevel: String,
    requiredLevel: String,
    gapScore: {
      type: Number,
      min: 0,
      max: 100
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low']
    },
    category: String,
    identifiedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Recommended Trainings
  recommendedTrainings: [{
    trainingId: String,
    trainingName: String,
    targetSkills: [String],
    priority: String,
    estimatedDuration: Number,
    estimatedCost: Number
  }],
  
  // Overall Gap Analysis
  overallGapScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalGapsIdentified: {
    type: Number,
    default: 0
  },
  criticalGapsCount: {
    type: Number,
    default: 0
  },
  
  // Development Plan
  developmentPlan: {
    planCreatedDate: Date,
    planStartDate: Date,
    targetCompletionDate: Date,
    planStatus: {
      type: String,
      enum: ['Draft', 'Active', 'In Progress', 'Completed', 'On Hold'],
      default: 'Draft'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  assessedBy: String,
  lastAssessmentDate: Date,
  nextReviewDate: Date,
  
  notes: String
}, { 
  timestamps: true 
});

// Indexes for efficient queries
skillGapSchema.index({ employeeId: 1 });
skillGapSchema.index({ department: 1 });
skillGapSchema.index({ location: 1 });
skillGapSchema.index({ 'skillGaps.priority': 1 });
skillGapSchema.index({ overallGapScore: 1 });

export const SkillGap = mongoose.model('SkillGap', skillGapSchema);

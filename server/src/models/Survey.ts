import mongoose from 'mongoose';

// Question Answer Schema
const questionAnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  questionType: { 
    type: String, 
    enum: ['mcq-single', 'mcq-multiple', 'text-short', 'text-long', 'rating-5', 'yes-no'], 
    required: true 
  },
  answer: { type: mongoose.Schema.Types.Mixed }, // Can be string, array, or number
  timeSpent: { type: Number }, // seconds spent on this question
  skipped: { type: Boolean, default: false }
}, { _id: false });

// Survey Response Schema
const surveyResponseSchema = new mongoose.Schema({
  responseId: { type: String, required: true, unique: true },
  employeeId: { type: String }, // null if anonymous
  userName: { type: String }, // null if anonymous
  department: { type: String },
  role: { type: String },
  location: { type: String },
  
  // Timestamps
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date },
  lastActiveAt: { type: Date },
  
  // Completion Status
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed', 'abandoned'], 
    default: 'in-progress' 
  },
  completionPercentage: { type: Number, default: 0 },
  totalTimeTaken: { type: Number }, // seconds
  
  // Answers
  answers: [questionAnswerSchema],
  answeredQuestions: { type: Number, default: 0 },
  skippedQuestions: { type: Number, default: 0 },
  
  // Response Quality Indicators
  isAnonymous: { type: Boolean, default: false },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
  browser: { type: String },
  ipAddress: { type: String }, // for fraud detection
  hasStraightLining: { type: Boolean, default: false }, // same answer repeatedly
  
  // Partial Save History (for in-progress responses)
  partialSaves: [{
    savedAt: Date,
    progress: Number,
    answeredCount: Number
  }],
  
  // Response Version (if survey was edited during active period)
  surveyVersion: { type: Number, default: 1 }
}, { _id: false });

// Survey Question Schema
const surveyQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  questionText: { type: String, required: true },
  questionType: { 
    type: String, 
    enum: ['mcq-single', 'mcq-multiple', 'text-short', 'text-long', 'rating-5', 'yes-no'], 
    required: true 
  },
  options: [{ type: String }], // For MCQ questions
  isRequired: { type: Boolean, default: true },
  order: { type: Number, required: true },
  
  // Question Analytics
  responsesCount: { type: Number, default: 0 },
  skipRate: { type: Number, default: 0 }, // percentage who skipped this question
  avgTimeSpent: { type: Number }, // average seconds spent on this question
  
  // Answer Distribution (for MCQ and Rating questions)
  answerDistribution: [{
    option: String,
    count: Number,
    percentage: Number
  }],
  
  // For Rating Questions
  avgRating: { type: Number },
  medianRating: { type: Number },
  
  // For Text Questions
  textResponses: [{
    responseId: String,
    text: String,
    wordCount: Number,
    sentiment: String // positive, neutral, negative
  }],
  commonKeywords: [{ 
    word: String, 
    frequency: Number 
  }]
}, { _id: false });

// View Tracking Schema
const viewSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  role: { type: String },
  timestamp: { type: Date, default: Date.now },
  hasStarted: { type: Boolean, default: false },
  hasCompleted: { type: Boolean, default: false },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] }
}, { _id: false });

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: [
      'employee-satisfaction', 'performance-feedback', 'training-needs', 
      'workplace-environment', 'benefits', 'leadership', 
      'work-life-balance', 'general'
    ], 
    required: true 
  },
  
  // Questions
  questions: [surveyQuestionSchema],
  totalQuestions: { type: Number, required: true },
  
  // Survey Settings
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  allowAnonymous: { type: Boolean, default: false },
  allowPartialSubmission: { type: Boolean, default: true },
  showProgressBar: { type: Boolean, default: true },
  randomizeQuestions: { type: Boolean, default: false },
  
  // Target Audience
  targetAudience: { 
    type: String, 
    enum: ['all', 'departments', 'custom'], 
    default: 'all' 
  },
  selectedDepartments: [{ type: String }],
  
  // Publishing Info
  author: { type: String, required: true },
  authorRole: { type: String },
  authorDepartment: { type: String },
  publishedOn: { type: Date, default: Date.now },
  
  // Responses and Analytics
  responses: [surveyResponseSchema],
  totalResponses: { type: Number, default: 0 },
  completedResponses: { type: Number, default: 0 },
  partialResponses: { type: Number, default: 0 },
  abandonedResponses: { type: Number, default: 0 },
  anonymousResponses: { type: Number, default: 0 },
  
  // Views and Engagement
  viewDetails: [viewSchema],
  viewsCount: { type: Number, default: 0 },
  
  // Participation Metrics
  responseRate: { type: Number, default: 0 }, // completed / views * 100
  completionRate: { type: Number, default: 0 }, // completed / started * 100
  avgCompletionTime: { type: Number }, // average seconds to complete
  medianCompletionTime: { type: Number },
  
  // Response Quality
  avgTextResponseLength: { type: Number }, // average words in text responses
  textResponseRate: { type: Number }, // percentage who answered text questions
  straightLiningCount: { type: Number, default: 0 },
  
  // Device Breakdown
  deviceBreakdown: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },
  
  // First/Last Response Tracking
  firstRespondedBy: { type: String },
  firstRespondedAt: { type: Date },
  latestRespondedBy: { type: String },
  latestRespondedAt: { type: Date },
  
  // Department-wise Response Rates
  departmentStats: [{
    department: String,
    invited: Number,
    responded: Number,
    responseRate: Number,
    avgSatisfaction: Number // for satisfaction surveys
  }],
  
  // Non-Responders (for reminders)
  nonResponders: [{
    employeeId: String,
    userName: String,
    department: String,
    hasViewed: Boolean,
    viewedAt: Date
  }],
  
  // Survey Status
  status: { 
    type: String, 
    enum: ['draft', 'active', 'closed', 'archived'], 
    default: 'draft' 
  },
  
  // Comparative Analytics (vs previous surveys)
  previousSurveyId: { type: String },
  comparisonMetrics: {
    responseRateChange: Number,
    satisfactionChange: Number,
    trendDirection: String // improving, declining, stable
  }
}, { timestamps: true });

export default mongoose.model('Survey', surveySchema);

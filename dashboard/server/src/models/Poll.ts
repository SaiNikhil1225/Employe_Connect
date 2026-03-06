import mongoose from 'mongoose';

// Poll Option with Detailed Vote Tracking
const pollVoteSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  role: { type: String },
  location: { type: String },
  timestamp: { type: Date, default: Date.now },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
  voteChangedFrom: { type: String }, // Previous option if vote was changed
  voteChangedAt: { type: Date }, // When vote was changed
  optionalComment: { type: String } // If poll allows comments with votes
}, { _id: false });

const pollOptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  voters: [pollVoteSchema]
}, { _id: false });

// Comment Schema
const commentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  role: { type: String },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  likedBy: [{ type: String }],
  likesCount: { type: Number, default: 0 }
}, { _id: false });

// View Tracking Schema
const viewSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  role: { type: String },
  location: { type: String },
  timestamp: { type: Date, default: Date.now },
  hasVoted: { type: Boolean, default: false },
  viewToVoteTime: { type: Number }, // seconds between viewing and voting
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] }
}, { _id: false });

const pollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: [
      'employee-feedback', 'opinion-poll', 'event-planning', 
      'team-decision', 'preference-survey', 'satisfaction-check', 
      'quick-poll', 'general'
    ], 
    default: 'general' 
  },
  author: { type: String, required: true },
  authorRole: { type: String },
  authorDepartment: { type: String },
  publishedOn: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  targetAudience: { 
    type: String, 
    enum: ['all', 'departments', 'custom'], 
    default: 'all' 
  },
  selectedDepartments: [{ type: String }],
  
  // Poll Configuration
  allowMultipleAnswers: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  allowVoteChange: { type: Boolean, default: true },
  allowComments: { type: Boolean, default: true },
  
  // Poll Options
  options: [pollOptionSchema],
  
  // Analytics
  totalVotes: { type: Number, default: 0 },
  viewDetails: [viewSchema],
  viewsCount: { type: Number, default: 0 },
  comments: [commentSchema],
  commentsCount: { type: Number, default: 0 },
  
  // Participation Metrics
  participationRate: { type: Number, default: 0 }, // votes / views * 100
  viewToVoteConversion: { type: Number, default: 0 }, // same as participation rate
  voteToCommentRate: { type: Number, default: 0 }, // comments / votes * 100
  
  // First/Last Tracking
  firstVotedBy: { type: String },
  firstVotedAt: { type: Date },
  latestVotedBy: { type: String },
  latestVotedAt: { type: Date },
  
  // Non-Voters Tracking (for reminders)
  nonVoters: [{
    employeeId: String,
    userName: String,
    department: String,
    hasViewed: Boolean,
    viewedAt: Date
  }]
}, { timestamps: true });

export default mongoose.model('Poll', pollSchema);

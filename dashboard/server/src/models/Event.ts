import mongoose from 'mongoose';

// RSVP Guest Schema
const guestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  dietaryRestrictions: { type: String }
}, { _id: false });

// RSVP Schema with Detailed Tracking
const rsvpSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  role: { type: String },
  response: { 
    type: String, 
    enum: ['attending', 'declined', 'maybe'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  
  // Attending Details (if response = attending)
  attendanceMode: { 
    type: String, 
    enum: ['in-person', 'virtual'], 
    default: 'in-person' 
  },
  guestCount: { type: Number, default: 0 },
  guests: [guestSchema],
  dietaryRestrictions: { type: String },
  specialRequirements: { type: String },
  optionalNote: { type: String },
  
  // Declined Details (if response = declined)
  declineReason: { type: String },
  
  // Changed RSVP History
  changeHistory: [{
    previousResponse: String,
    newResponse: String,
    changedAt: Date,
    reason: String
  }],
  
  // View to RSVP Tracking
  viewedAt: { type: Date },
  viewToRsvpTime: { type: Number }, // seconds between viewing and RSVPing
  
  // Actual Attendance (filled on event day)
  actualAttendance: {
    attended: { type: Boolean, default: false },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    durationAttended: { type: Number }, // minutes
    attendanceMode: { type: String, enum: ['in-person', 'virtual'] },
    isLate: { type: Boolean, default: false },
    lateByMinutes: { type: Number },
    leftEarly: { type: Boolean, default: false },
    leftEarlyByMinutes: { type: Number }
  }
}, { _id: false });

// View Tracking Schema
const viewSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  role: { type: String },
  timestamp: { type: Date, default: Date.now },
  hasResponded: { type: Boolean, default: false },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] }
}, { _id: false });

// Comment Schema
const commentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  likedBy: [{ type: String }],
  likesCount: { type: Number, default: 0 }
}, { _id: false });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  eventType: { 
    type: String, 
    enum: [
      'celebration', 'town-hall', 'training', 'team-building', 
      'awards', 'social', 'meeting', 'wellness'
    ], 
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'company-wide', 'department', 'location', 
      'team', 'optional', 'mandatory'
    ], 
    required: true 
  },
  
  // Date & Time
  startDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endDate: { type: Date },
  endTime: { type: String, required: true },
  
  // Location Details
  mode: { 
    type: String, 
    enum: ['in-person', 'virtual', 'hybrid'], 
    required: true 
  },
  venue: { type: String },
  address: { type: String },
  virtualLink: { type: String },
  
  // RSVP Settings
  enableRSVP: { type: Boolean, default: true },
  maxAttendees: { type: Number },
  maxInPersonAttendees: { type: Number },
  rsvpDeadline: { type: Date },
  
  // Organizer Info
  organizer: { type: String, required: true },
  organizerDepartment: { type: String },
  contactEmail: { type: String, required: true },
  
  // Target Audience
  targetAudience: { 
    type: String, 
    enum: ['all', 'departments', 'custom'], 
    default: 'all' 
  },
  selectedDepartments: [{ type: String }],
  
  // Publishing Info
  publishedBy: { type: String, required: true },
  publishedOn: { type: Date, default: Date.now },
  
  // RSVPs and Analytics
  rsvps: [rsvpSchema],
  rsvpsCount: { type: Number, default: 0 },
  attendingCount: { type: Number, default: 0 },
  declinedCount: { type: Number, default: 0 },
  maybeCount: { type: Number, default: 0 },
  noResponseCount: { type: Number, default: 0 },
  
  // Attendance Mode Breakdown
  inPersonCount: { type: Number, default: 0 },
  virtualCount: { type: Number, default: 0 },
  
  // Actual Attendance (Event Day)
  actualAttendeesCount: { type: Number, default: 0 },
  walkInsCount: { type: Number, default: 0 },
  noShowsCount: { type: Number, default: 0 },
  noShowRate: { type: Number, default: 0 }, // (no-shows / attending RSVPs) * 100
  
  // Views and Engagement
  viewDetails: [viewSchema],
  viewsCount: { type: Number, default: 0 },
  comments: [commentSchema],
  commentsCount: { type: Number, default: 0 },
  
  // Metrics
  rsvpRate: { type: Number, default: 0 }, // (total RSVPs / views) * 100
  attendanceProjection: { type: Number, default: 0 }, // attending + maybe
  
  // First/Last Tracking
  firstRsvpBy: { type: String },
  firstRsvpAt: { type: Date },
  latestRsvpBy: { type: String },
  latestRsvpAt: { type: Date },
  
  // Dietary Summary (for catering)
  dietarySummary: {
    vegetarian: { type: Number, default: 0 },
    vegan: { type: Number, default: 0 },
    glutenFree: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  
  // Event Status
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  
  // Post-Event Feedback
  feedbackEnabled: { type: Boolean, default: true },
  feedbackResponses: { type: Number, default: 0 },
  averageRating: { type: Number }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);

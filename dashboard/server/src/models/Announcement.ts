import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
  votedBy: [{ type: String }]
}, { _id: false });

// Enhanced Reaction Schema with Analytics
const reactionSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  role: { type: String },
  emoji: { type: String, required: true },
  label: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
  location: { type: String }
}, { _id: false });

// Enhanced Comment Schema with Analytics
const commentReplySchema = new mongoose.Schema({
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

const commentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  role: { type: String },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
  likedBy: [{ type: String }],
  likesCount: { type: Number, default: 0 },
  replies: [commentReplySchema],
  isEdited: { type: Boolean, default: false },
  editHistory: [{
    originalText: String,
    editedAt: Date
  }]
}, { _id: false });

// View Tracking Schema
const viewSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  userName: { type: String, required: true },
  department: { type: String },
  role: { type: String },
  location: { type: String },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number }, // seconds spent viewing
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
  browser: { type: String },
  viewSource: { type: String, enum: ['dashboard', 'email', 'direct-link', 'notification'] },
  hasEngaged: { type: Boolean, default: false } // did they react/comment after viewing
}, { _id: false });

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high', 'Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  category: { type: String, enum: ['General', 'HR', 'IT', 'Policy', 'Event', 'Urgent', 'general', 'hr', 'it', 'policy', 'event', 'urgent', 'celebration', 'announcement', 'feedback', 'company-news', 'policy-update', 'hr-update', 'it-update', 'team-update', 'event-activity', 'achievement', 'training-learning', 'facility-update', 'safety-security', 'general-information'], default: 'General' },
  author: { type: String },
  authorId: { type: String },
  employeeId: { type: String },
  role: { type: String },
  publishedBy: { type: String },
  publishedOn: { type: String },
  date: { type: String },
  time: { type: String },
  avatar: { type: String },
  expiresOn: String,
  expiresAt: { type: String }, // Expiry date for announcements
  targetAudience: [String],
  attachments: [String],
  imageUrl: { type: String },
  
  // Legacy fields (kept for backward compatibility)
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  
  isPinned: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  
  // Enhanced Analytics Fields
  reactions: [reactionSchema],
  reactionsCount: { type: Number, default: 0 },
  comments: [commentSchema],
  commentsCount: { type: Number, default: 0 },
  viewDetails: [viewSchema],
  viewsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 }, // (reactions + comments + shares) / views * 100
  
  // First/Last Engagement Tracking
  firstReactedBy: { type: String },
  firstReactedAt: { type: Date },
  latestReactedBy: { type: String },
  latestReactedAt: { type: Date },
  firstCommentedBy: { type: String },
  firstCommentedAt: { type: Date },
  
  // Layout specific fields
  layoutType: { type: String, enum: ['content-only', 'content-with-image', 'image-only'], default: 'content-only' },
  subLayout: { type: String, enum: ['left-image', 'top-image', 'right-image'], default: 'left-image' },
  
  // Poll specific fields
  isPoll: { type: Boolean, default: false },
  pollOptions: [pollOptionSchema],
  allowMultipleAnswers: { type: Boolean, default: false },
  isAnonymous: { type: Boolean, default: false },
  pollExpiresAt: { type: String },
  totalVotes: { type: Number, default: 0 }
}, { timestamps: true, strict: false }); // Set to false to allow frontend fields

export default mongoose.model('Announcement', announcementSchema);

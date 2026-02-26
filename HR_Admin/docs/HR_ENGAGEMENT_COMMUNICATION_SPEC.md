# Engagement & Communication Module - Complete Specification

## 📋 Overview

The **Engagement & Communication Module** is a comprehensive platform for HR to facilitate organizational communication, gather employee feedback, organize events, and measure employee engagement. It includes announcements, polls, surveys, events (RSVP), and engagement analytics.

---

## 🎯 Features

### Core Functionality
- **Announcements**: Company-wide and targeted announcements with rich media
- **Polls**: Quick opinion gathering with real-time results
- **Surveys**: Comprehensive feedback collection with advanced question types
- **Events & RSVP**: Event management with attendance tracking
- **Engagement Feed**: Social-style feed with reactions and comments
- **Targeted Communication**: Department/location/role-based targeting
- **Notification System**: Multi-channel notifications (Email, In-app, SMS)
- **Analytics Dashboard**: Engagement metrics, response rates, sentiment analysis
- **Content Scheduling**: Schedule announcements and polls for future publishing
- **Interactive Features**: Reactions, comments, likes, shares

### Advanced Features
- Sentiment analysis on feedback
- Engagement scoring per employee/department
- Communication effectiveness metrics
- Event attendance analytics
- Survey response analytics
- Anonymous feedback options
- Rich text editor with media upload
- Auto-reminders for surveys and events
- Export survey results
- Communication calendar view

---

## 🗄️ Database Collections

### 1. Announcement Collection
**Model File**: `server/src/models/Announcement.ts`

```typescript
{
  _id: ObjectId,
  title: String,                     // Announcement title
  description: String,               // Short description
  content: String,                   // Full content (supports HTML)
  
  priority: String,                  // Enum: Low, Medium, High, Critical (default: Medium)
  category: String,                  // Enum: General, HR, IT, Policy, Event, Urgent,
                                     // Celebration, Company News, Policy Update,
                                     // HR Update, IT Update, Team Update, 
                                     // Event Activity, Achievement, Training Learning,
                                     // Facility Update, Safety Security
  
  author: String,                    // Author name
  authorId: String,                  // Author employee ID
  employeeId: String,                // Creator employee ID
  role: String,                      // Creator role
  publishedBy: String,               // Who published
  publishedOn: String,               // Publish date (ISO string)
  date: String,                      // Display date
  time: String,                      // Display time
  avatar: String,                    // Author avatar URL
  
  targetAudience: [String],          // Departments, locations, roles
  
  imageUrl: String,                  // Featured image
  attachments: [String],             // File URLs
  
  expiresOn: String,                 // Expiry date (ISO string)
  expiresAt: String,                 // Expiry timestamp
  
  isPinned: Boolean,                 // Pin to top (default: false)
  
  // Engagement Metrics
  views: Number,                     // View count (default: 0)
  reactionsCount: Number,            // Total reactions (default: 0)
  commentsCount: Number,             // Total comments (default: 0)
  sharesCount: Number,               // Share count (default: 0)
  
  // Detailed Analytics
  reactions: [{                      // Individual reactions
    employeeId: String,
    userName: String,
    department: String,
    role: String,
    emoji: String,                   // 👍, ❤️, 😊, 🎉, 💡
    label: String,                   // Like, Love, Happy, Celebrate, Insightful
    timestamp: Date,
    device: String,                  // desktop, mobile, tablet
    location: String
  }],
  
  comments: [{                       // Comments thread
    id: String,
    employeeId: String,
    userName: String,
    department: String,
    role: String,
    text: String,
    timestamp: Date,
    device: String,
    likedBy: [String],
    likesCount: Number,
    replies: [{                      // Nested replies
      id: String,
      employeeId: String,
      userName: String,
      text: String,
      timestamp: Date,
      likedBy: [String],
      likesCount: Number
    }],
    isEdited: Boolean,
    editHistory: [{
      originalText: String,
      editedAt: Date
    }]
  }],
  
  views: [{                          // View tracking
    employeeId: String,
    userName: String,
    department: String,
    role: String,
    location: String,
    timestamp: Date,
    duration: Number,                // Seconds
    device: String,
    browser: String,
    viewSource: String,              // dashboard, email, direct-link, notification
    hasEngaged: Boolean
  }],
  
  // Poll Fields (if announcement is a poll)
  isPoll: Boolean,                   // Is this a poll (default: false)
  pollOptions: [{
    id: String,
    text: String,
    votes: Number,
    votedBy: [String]                // Employee IDs
  }],
  allowMultipleVotes: Boolean,       // Allow multiple option selection
  pollExpiresAt: String,             // Poll expiry date
  
  // Moderation
  isApproved: Boolean,               // Admin approval (default: true)
  approvedBy: String,
  approvedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
```typescript
category: 1
publishedOn: -1
isPinned: -1
targetAudience: 1
```

### 2. Survey Collection
**Model File**: `server/src/models/Survey.ts`

```typescript
{
  _id: ObjectId,
  surveyId: String,                  // Auto-generated: SRV-00001
  title: String,                     // Survey title
  description: String,               // Survey description
  
  surveyType: String,                // Enum: Engagement, Feedback, Pulse, Exit,
                                     // Onboarding, Training, Custom
  
  category: String,                  // Enum: Employee Engagement, Culture, Benefits,
                                     // Work Environment, Leadership, Communication,
                                     // Training, Career Development, Other
  
  purpose: String,                   // Survey purpose/objective
  
questions: [{
    id: String,                      // Question ID
    questionText: String,            // Question
    questionType: String,            // Enum: mcq-single, mcq-multiple, text-short,
                                     // text-long, rating-5, yes-no, nps, slider
    options: [String],               // For MCQ questions
    isRequired: Boolean,             // Mandatory question (default: true)
    order: Number,                   // Display order
    
    // Conditional Logic
    showIf: {                        // Show based on previous answer
      questionId: String,
      condition: String,             // equals, not-equals, contains
      value: String
    },
    
    // Analytics (populated after responses)
    responsesCount: Number,
    skipRate: Number,
    avgTimeSpent: Number,
    answerDistribution: [{
      option: String,
      count: Number,
      percentage: Number
    }],
    avgRating: Number,
    medianRating: Number,
    textResponses: [{
      responseId: String,
      text: String,
      wordCount: Number,
      sentiment: String              // positive, neutral, negative
    }],
    commonKeywords: [{
      word: String,
      count: Number
    }]
  }],
  
  // Targeting
  targetAudience: {
    departments: [String],
    locations: [String],
    designations: [String],
    employeeIds: [String],           // Specific employees
    grades: [String],
    employmentTypes: [String]
  },
  
  // Settings
  isAnonymous: Boolean,              // Allow anonymous responses
  allowPartialSubmit: Boolean,       // Save in-progress responses
  randomizeQuestions: Boolean,
  showProgressBar: Boolean,
  oneResponsePerUser: Boolean,
  
  // Timeline
  status: String,                    // Enum: Draft, Scheduled, Active, Paused, 
                                     // Closed, Archived (default: Draft)
  startDate: Date,                   // Survey opens
  endDate: Date,                     // Survey closes
  publishedAt: Date,
  closedAt: Date,
  
  // Goals
  targetResponses: Number,           // Expected response count
  currentResponses: Number,          // Actual responses (default: 0)
  responseRate: Number,              // Percentage (default: 0)
  
  // Notifications
  sendInviteEmail: Boolean,
  sendReminderEmail: Boolean,
  reminderSchedule: [Date],          // Reminder dates
  sendThankYouEmail: Boolean,
  
  // Response Tracking
  responses: [{                      // Array reference (can be separate collection)
    responseId: String,
    employeeId: String,              // null if anonymous
    userName: String,
    department: String,
    role: String,
    location: String,
    startedAt: Date,
    submittedAt: Date,
    lastActiveAt: Date,
    status: String,                  // in-progress, completed, abandoned
    completionPercentage: Number,
    totalTimeTaken: Number,          // seconds
    answers: [{
      questionId: String,
      questionText: String,
      questionType: String,
      answer: Mixed,                 // String, Array, Number
      timeSpent: Number,
      skipped: Boolean
    }],
    device: String,
    browser: String,
    ipAddress: String
  }],
  
  // Analytics Summary
  analytics: {
    totalViews: Number,
    totalStarted: Number,
    totalCompleted: Number,
    totalAbandoned: Number,
    avgCompletionTime: Number,
    completionRate: Number,
    abandonmentRate: Number,
    avgRating: Number,
    npsScore: Number,                // Net Promoter Score
    sentimentScore: Number,          // -1 to 1
    topKeywords: [String],
    departmentBreakdown: [{
      department: String,
      responses: Number,
      avgRating: Number
    }]
  },
  
  createdBy: String,
  updatedBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
```typescript
surveyId: unique
status: 1
startDate: 1
endDate: 1
surveyType: 1
```

### 3. Event Collection
**Model File**: `server/src/models/Event.ts`

```typescript
{
  _id: ObjectId,
  eventId: String,                   // Auto-generated: EVT-00001
  title: String,                     // Event title
  description: String,               // Event details
  
  eventType: String,                 // Enum: Celebration, Town Hall, Training,
                                     // Team Building, Awards, Social, Meeting,
                                     // Wellness, Conference, Workshop
  
  category: String,                  // Enum: Company-wide, Departmental, Team,
                                     // Social, Professional, Training, Other
  
  organizer: {
    employeeId: String,
    name: String,
    email: String,
    department: String
  },
  
  coOrganizers: [{
    employeeId: String,
    name: String,
    email: String
  }],
  
  // Schedule
  startDate: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  duration: Number,                  // Minutes
  timezone: String,
  
  isAllDay: Boolean,
  isRecurring: Boolean,
  recurrence: {
    frequency: String,               // Daily, Weekly, Monthly
    interval: Number,
    endDate: Date,
    occurrences: Number
  },
  
// Location
  eventMode: String,                 // Enum: In-person, Virtual, Hybrid
  location: String,                  // Physical location
  venue: String,                     // Room/Building
  virtualMeetingLink: String,        // Zoom/Teams link
  virtualPlatform: String,           // Zoom, Teams, Google Meet
  
  // Capacity
  maxParticipants: Number,
  minParticipants: Number,
  currentRSVPs: Number,              // default: 0
  allowWaitlist: Boolean,
  waitlistCount: Number,
  
  // Targeting
  targetAudience: {
    departments: [String],
    locations: [String],
    designations: [String],
    grades: [String],
    specificEmployees: [String]
  },
  isPublic: Boolean,                 // Visible to all
  isInviteOnly: Boolean,
  
  // RSVP Options
  rsvpRequired: Boolean,
  rsvpDeadline: Date,
  allowGuestRSVP: Boolean,           // +1s allowed
  maxGuestsPerEmployee: Number,
  dietaryRestrictionsAllowed: Boolean,
  
  // RSVPs
  rsvps: [{
    employeeId: String,
    userName: String,
    department: String,
    role: String,
    response: String,                // attending, declined, maybe
    timestamp: Date,
    attendanceMode: String,          // in-person, virtual
    guestCount: Number,
    guests: [{
      name: String,
      email: String,
      dietaryRestrictions: String
    }],
    dietaryRestrictions: String,
    specialRequirements: String,
    optionalNote: String,
    declineReason: String,
    changeHistory: [{
      previousResponse: String,
      newResponse: String,
      changedAt: Date,
      reason: String
    }],
    viewedAt: Date,
    viewToRsvpTime: Number,          // seconds
    
    // Actual Attendance (on event day)
    actualAttendance: {
      attended: Boolean,
      checkInTime: Date,
      checkOutTime: Date,
      durationAttended: Number,      // minutes
      attendanceMode: String,
      isLate: Boolean,
      lateByMinutes: Number,
      leftEarly: Boolean,
      leftEarlyByMinutes: Number
    }
  }],
  
  // View Tracking
  views: [{
    employeeId: String,
    userName: String,
    department: String,
    timestamp: Date,
    hasResponded: Boolean,
    device: String
  }],
  
  // Engagement
  comments: [{
    id: String,
    employeeId: String,
    userName: String,
    text: String,
    timestamp: Date,
    likedBy: [String],
    likesCount: Number
  }],
  
  // Resources
  agenda: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedBy: String,
    uploadedAt: Date
  }],
  
  // Budget
  budgetAllocated: Number,
  budgetSpent: Number,
  costPerParticipant: Number,
  
  // Status
  status: String,                    // Enum: Draft, Published, Ongoing, Completed,
                                     // Cancelled, Postponed (default: Draft)
  
  // Post-Event
  feedbackFormLink: String,
  feedbackReceived: Number,
  averageFeedbackRating: Number,
  
  // Notifications
  reminderSent: Boolean,
  reminderSchedule: [Date],
  
  createdBy: String,
  updatedBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
```typescript
eventId: unique
startDate: 1
status: 1
eventType: 1
targetAudience: 1
```

### 4. Poll Collection (Standalone)
**Model File**: `server/src/models/Poll.ts`

```typescript
{
  _id: ObjectId,
  pollId: String,                    // Auto-generated: POL-00001
  question: String,                  // Poll question
  description: String,               // Additional context
  
  options: [{
    id: String,
    text: String,
    votes: Number,
    votedBy: [String],
    percentage: Number
  }],
  
  pollType: String,                  // Enum: Multiple Choice, Yes/No, Rating
  allowMultipleVotes: Boolean,
  
  targetAudience: [String],
  
  status: String,                    // Active, Closed, Archived
  startDate: Date,
  endDate: Date,
  
  totalVotes: Number,
  uniqueVoters: Number,
  
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Endpoints

### Announcements - Base URL: `/api/announcements`

#### 1. Get All Announcements
```http
GET /api/announcements
```

**Query Parameters**:
- `category`: Filter by category
- `priority`: Filter by priority
- `isPinned`: Show only pinned
- `targetAudience`: Filter by audience
- `search`: Search in title/content

#### 2. Get Announcement by ID
```http
GET /api/announcements/:id
```

#### 3. Create Announcement
```http
POST /api/announcements
```

**Request Body**:
```json
{
  "title": "New Office Policy",
  "description": "Updated remote work policy",
  "content": "<p>Detailed policy content...</p>",
  "priority": "High",
  "category": "Policy Update",
  "targetAudience": ["Engineering", "Product"],
  "imageUrl": "https://...",
  "isPinned": true,
  "expiresOn": "2026-06-30",
  "authorId": "HR001"
}
```

#### 4. Update Announcement
```http
PUT /api/announcements/:id
```

#### 5. Delete Announcement
```http
DELETE /api/announcements/:id
```

#### 6. Add Reaction
```http
POST /api/announcements/:id/react
```

**Request Body**:
```json
{
  "employeeId": "EMP001",
  "userName": "John Doe",
  "emoji": "👍",
  "label": "Like"
}
```

#### 7. Add Comment
```http
POST /api/announcements/:id/comment
```

**Request Body**:
```json
{
  "employeeId": "EMP001",
  "userName": "John Doe",
  "text": "Great announcement!",
  "device": "desktop"
}
```

#### 8. Track View
```http
POST /api/announcements/:id/view
```

#### 9. Vote on Poll
```http
POST /api/announcements/:id/vote
```

**Request Body**:
```json
{
  "employeeId": "EMP001",
  "optionIds": ["opt1"]
}
```

### Surveys - Base URL: `/api/surveys`

#### 1. Get All Surveys
```http
GET /api/surveys
```

#### 2. Get Survey by ID
```http
GET /api/surveys/:id
```

#### 3. Create Survey
```http
POST /api/surveys
```

#### 4. Submit Response
```http
POST /api/surveys/:surveyId/responses
```

**Request Body**:
```json
{
  "employeeId": "EMP001",
  "answers": [
    {
      "questionId": "q1",
      "answer": "Very Satisfied"
    }
  ],
  "totalTimeTaken": 180
}
```

#### 5. Get Survey Results
```http
GET /api/surveys/:surveyId/results
```

#### 6. Export Survey Results
```http
GET /api/surveys/:surveyId/export?format=excel
```

### Events - Base URL: `/api/events`

#### 1. Get All Events
```http
GET /api/events
```

#### 2. Create Event
```http
POST /api/events
```

#### 3. Submit RSVP
```http
POST /api/events/:eventId/rsvp
```

**Request Body**:
```json
{
  "employeeId": "EMP001",
  "response": "attending",
  "attendanceMode": "in-person",
  "guestCount": 1,
  "dietaryRestrictions": "Vegetarian"
}
```

#### 4. Mark Attendance
```http
POST /api/events/:eventId/attendance
```

#### 5. Get Event Analytics
```http
GET /api/events/:eventId/analytics
```

---

## 📦 Component Structure

### Page Components

#### 1. EngagementDashboard
**File**: `src/pages/hr/EngagementDashboard.tsx`

**Features**:
- Unified view of all engagement activities
- Announcements feed
- Active polls
- Upcoming events
- Pending surveys
- Engagement metrics

#### 2. AnnouncementsPage
**File**: `src/pages/hr/AdminAnnouncements.tsx`

**Features**:
- Create/edit announcements
- Publish announcements
- View engagement metrics
- Manage polls

#### 3. SurveysPage
**File**: `src/pages/hr/Surveys.tsx`

**Features**:
- Create surveys
- Manage questions
- View responses
- Analytics dashboard

#### 4. EventsPage
**File**: `src/pages/hr/Events.tsx`

**Features**:
- Create events
- Manage RSVPs
- Track attendance
- Event analytics

---

## 🔧 Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "lucide-react": "^0.263.1",
    "sonner": "^1.0.0",
    "axios": "^1.5.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.8.0",
    "react-quill": "^2.0.0",
    "emoji-picker-react": "^4.5.0"
  }
}
```

### UI Components (ShadCN)
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
```

### Icons (Lucide React)
```typescript
import {
  MessageSquare, Bell, Calendar, BarChart, TrendingUp,
  ThumbsUp, Heart, Smile, Send, Pin, Eye, Users, Clock
} from 'lucide-react';
```

---

## 🚀 Implementation Checklist

### Backend
- [x] Create Announcement model
- [x] Create Survey model
- [x] Create Event model
- [x] Implement announcement routes
- [x] Implement survey routes
- [x] Implement event routes
- [ ] Add sentiment analysis for surveys
- [ ] Add notification service
- [ ] Add analytics aggregation
- [ ] Set up scheduled tasks (reminders)

### Frontend
- [x] Create Announcements page
- [x] Create Events page
- [ ] Create Surveys page
- [ ] Create Engagement Dashboard
- [ ] Build rich text editor for announcements
- [ ] Implement poll component
- [ ] Build survey builder
- [ ] Add RSVP component
- [ ] Create analytics dashboards

---

## 📝 Usage Example

```typescript
import EngagementDashboard from '@/pages/hr/EngagementDashboard';

function HRApp() {
  return <EngagementDashboard />;
}
```

---

## 🔐 Access Control

**Permissions**:
- **HR/SUPER_ADMIN**: Create, edit, delete all content
- **RMG**: Create announcements and events
- **MANAGER**: View team engagement metrics
- **EMPLOYEES**: View, react, comment, respond

---

## 📞 Support

For integration support, refer to:
- API Documentation: `docs/BACKEND_API_SPEC.md`
- Models: `server/src/models/Announcement.ts`, `Survey.ts`, `Event.ts`

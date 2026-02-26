# HR Process Mode - Complete Integration Guide

## 📚 Overview

This guide provides comprehensive documentation for four key HR process modules in the Employee Connect platform. Each module is designed to be fully integrated, shareable, and ready for implementation by other developers.

---

## 🎯 Module Overview

### 1. **Recognition & Celebrations** 
Manage employee recognition, birthdays, work anniversaries, achievements, and celebrations.

**Documentation**: [HR_RECOGNITION_CELEBRATIONS_SPEC.md](./HR_RECOGNITION_CELEBRATIONS_SPEC.md)

**Key Features**:
- Birthday and anniversary tracking
- Achievement recognition
- Multi-year milestone celebrations
- Budget management
- Automated notifications
- Status tracking (Draft, Scheduled, Upcoming, Celebrated, Missed)

**Database Collections**:
- `celebrations` - Main celebration records

**API Base**: `/api/celebrations`

**Page Component**: `src/pages/hr/RecognitionCelebrations.tsx`

**Access Roles**: `HR`, `SUPER_ADMIN`, `RMG`

---

### 2. **Training & Development**
Comprehensive learning management system for planning, tracking, and analyzing employee training programs.

**Documentation**: [HR_TRAINING_DEVELOPMENT_SPEC.md](./HR_TRAINING_DEVELOPMENT_SPEC.md)

**Key Features**:
- Training program management
- Employee enrollment system
- Skill gap analysis
- Certification tracking
- Attendance management
- Training effectiveness analytics
- Budget and ROI tracking
- Multi-mode support (Online, Offline, Hybrid)

**Database Collections**:
- `trainings` - Training programs
- `trainingenrollments` - Employee enrollments
- `skillgaps` - Skill gap analysis data

**API Base**: `/api/training`

**Page Component**: `src/pages/hr/TrainingDashboard.tsx`

**Access Roles**: `HR`, `SUPER_ADMIN`, `RMG`, `MANAGER`

---

### 3. **Teams & Members**
Dynamic team and group management system for organizing teams, departments, committees, and project groups.

**Documentation**: [HR_TEAMS_MEMBERS_SPEC.md](./HR_TEAMS_MEMBERS_SPEC.md)

**Key Features**:
- Create and manage various group types
- Member management with role assignment
- Multi-group membership support
- Group hierarchy visualization
- Member contribution tracking
- Group analytics and reporting
- Resource allocation tracking
- Communication tool integration

**Database Collections**:
- `groups` - Team/group records
- `groupmembers` - Member assignments

**API Base**: `/api/teams`

**Page Component**: `src/pages/hr/TeamsMembers.tsx`

**Access Roles**: `HR`, `SUPER_ADMIN`, `RMG`, `MANAGER`, `GROUP_LEAD`

---

### 4. **Engagement & Communication**
Unified platform for organizational communication, feedback collection, event management, and engagement tracking.

**Documentation**: [HR_ENGAGEMENT_COMMUNICATION_SPEC.md](./HR_ENGAGEMENT_COMMUNICATION_SPEC.md)

**Key Features**:
- Company-wide announcements
- Interactive polls
- Comprehensive surveys
- Event management with RSVP
- Social engagement (reactions, comments)
- Targeted communication
- Sentiment analysis
- Engagement analytics dashboard

**Database Collections**:
- `announcements` - Announcements and polls
- `surveys` - Survey definitions and responses
- `events` - Event details and RSVPs
- `polls` - Standalone polls (optional)

**API Bases**: 
- `/api/announcements`
- `/api/surveys`
- `/api/events`

**Page Components**: 
- `src/pages/hr/AdminAnnouncements.tsx`
- `src/pages/hr/Surveys.tsx` (to be created)
- `src/pages/hr/Events.tsx` (to be created)

**Access Roles**: `HR`, `SUPER_ADMIN`, `RMG`, `MANAGER` (limited), All employees (view/participate)

---

## 🏗️ Architecture Overview

### Technology Stack

**Backend**:
- Node.js + Express.js
- MongoDB + Mongoose
- TypeScript
- File upload: Multer
- Authentication: JWT

**Frontend**:
- React 18+
- TypeScript
- ShadCN UI Components
- TailwindCSS
- Lucide React Icons
- Date handling: date-fns
- Charts: Recharts
- Toast notifications: Sonner

---

## 📁 File Structure

```
Employe_Connect-main/
│
├── server/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Celebration.ts         ✅ Exists
│   │   │   ├── Training.ts            ✅ Exists
│   │   │   ├── TrainingEnrollment.ts  ✅ Exists
│   │   │   ├── SkillGap.ts            ✅ Exists
│   │   │   ├── Group.ts               ✅ Exists
│   │   │   ├── GroupMember.ts         ✅ Exists
│   │   │   ├── Announcement.ts        ✅ Exists
│   │   │   ├── Survey.ts              ✅ Exists
│   │   │   ├── Event.ts               ✅ Exists
│   │   │   └── Poll.ts                ✅ Exists
│   │   │
│   │   ├── routes/
│   │   │   ├── celebrations.ts        ✅ Exists
│   │   │   ├── training.ts            ✅ Exists
│   │   │   ├── teams.ts               ✅ Exists
│   │   │   ├── announcements.ts       ✅ Exists
│   │   │   ├── surveys.ts             ✅ Exists
│   │   │   ├── events.ts              ✅ Exists
│   │   │   └── polls.ts               ✅ Exists
│   │   │
│   │   └── server.ts
│   │
│   └── package.json
│
├── src/
│   ├── pages/
│   │   └── hr/
│   │       ├── RecognitionCelebrations.tsx    ✅ Exists
│   │       ├── TrainingDashboard.tsx          ✅ Exists
│   │       ├── AddTrainingForm.tsx            ✅ Exists
│   │       ├── TeamsMembers.tsx               ✅ Exists
│   │       ├── AdminAnnouncements.tsx         ✅ Exists
│   │       ├── NewAnnouncement.tsx            ✅ Exists
│   │       ├── Surveys.tsx                    ⚠️ To be created
│   │       └── Events.tsx                     ⚠️ To be created
│   │
│   ├── components/
│   │   └── ui/
│   │       ├── card.tsx                       ✅ ShadCN
│   │       ├── button.tsx                     ✅ ShadCN
│   │       ├── input.tsx                      ✅ ShadCN
│   │       ├── badge.tsx                      ✅ ShadCN
│   │       ├── select.tsx                     ✅ ShadCN
│   │       ├── sheet.tsx                      ✅ ShadCN
│   │       ├── dialog.tsx                     ✅ ShadCN
│   │       ├── data-table.tsx                 ✅ ShadCN
│   │       ├── employee-avatar.tsx            ✅ Custom
│   │       └── ...                            (other ShadCN components)
│   │
│   └── contexts/
│       └── ProfileContext.tsx                 ✅ Exists
│
└── docs/
    ├── HR_RECOGNITION_CELEBRATIONS_SPEC.md    ✅ Complete
    ├── HR_TRAINING_DEVELOPMENT_SPEC.md        ✅ Complete
    ├── HR_TEAMS_MEMBERS_SPEC.md               ✅ Complete
    ├── HR_ENGAGEMENT_COMMUNICATION_SPEC.md    ✅ Complete
    └── HR_PROCESS_MODE_INTEGRATION_GUIDE.md   ✅ This file
```

---

## 🗄️ Database Collections Summary

| Collection | Purpose | Model File | Route File | Status |
|------------|---------|------------|------------|--------|
| `celebrations` | Recognition & celebrations | `Celebration.ts` | `celebrations.ts` | ✅ Exists |
| `trainings` | Training programs | `Training.ts` | `training.ts` | ✅ Exists |
| `trainingenrollments` | Training enrollments | `TrainingEnrollment.ts` | `training.ts` | ✅ Exists |
| `skillgaps` | Skill gap analysis | `SkillGap.ts` | `training.ts` | ✅ Exists |
| `groups` | Teams and groups | `Group.ts` | `teams.ts` | ✅ Exists |
| `groupmembers` | Group memberships | `GroupMember.ts` | `teams.ts` | ✅ Exists |
| `announcements` | Announcements & polls | `Announcement.ts` | `announcements.ts` | ✅ Exists |
| `surveys` | Employee surveys | `Survey.ts` | `surveys.ts` | ✅ Exists |
| `events` | Events with RSVP | `Event.ts` | `events.ts` | ✅ Exists |
| `polls` | Standalone polls | `Poll.ts` | `polls.ts` | ✅ Exists |

---

## 🔌 API Endpoints Quick Reference

### Recognition & Celebrations
```
GET    /api/celebrations
GET    /api/celebrations/:id
POST   /api/celebrations
PUT    /api/celebrations/:id
DELETE /api/celebrations/:id
PATCH  /api/celebrations/:id/celebrate
PATCH  /api/celebrations/:id/missed
POST   /api/celebrations/bulk-celebrate
GET    /api/celebrations/upcoming/birthdays
GET    /api/celebrations/upcoming/anniversaries
GET    /api/celebrations/stats/overview
```

### Training & Development
```
GET    /api/training
GET    /api/training/:id
POST   /api/training
PUT    /api/training/:id
DELETE /api/training/:id
GET    /api/training/:trainingId/enrollments
POST   /api/training/enroll
PATCH  /api/training/enrollments/:enrollmentId/cancel
PATCH  /api/training/enrollments/:enrollmentId/attendance
PATCH  /api/training/enrollments/:enrollmentId/feedback
POST   /api/training/enrollments/:enrollmentId/certificate
GET    /api/training/stats/overview
GET    /api/training/employee/:employeeId/history
GET    /api/training/skillgap/:employeeId
GET    /api/training/recommendations/:employeeId
```

### Teams & Members
```
GET    /api/teams/groups
GET    /api/teams/groups/:groupId
POST   /api/teams/groups
PUT    /api/teams/groups/:groupId
DELETE /api/teams/groups/:groupId
PATCH  /api/teams/groups/:groupId/status
GET    /api/teams/groups/:groupId/members
POST   /api/teams/members
POST   /api/teams/members/bulk
PATCH  /api/teams/members/:memberId/role
DELETE /api/teams/members/:memberId
GET    /api/teams/members/employee/:employeeId
GET    /api/teams/stats/overview
GET    /api/teams/analytics/department
```

### Engagement & Communication
```
# Announcements
GET    /api/announcements
GET    /api/announcements/:id
POST   /api/announcements
PUT    /api/announcements/:id
DELETE /api/announcements/:id
POST   /api/announcements/:id/react
POST   /api/announcements/:id/comment
POST   /api/announcements/:id/view
POST   /api/announcements/:id/vote

# Surveys
GET    /api/surveys
GET    /api/surveys/:id
POST   /api/surveys
POST   /api/surveys/:surveyId/responses
GET    /api/surveys/:surveyId/results
GET    /api/surveys/:surveyId/export

# Events
GET    /api/events
GET    /api/events/:id
POST   /api/events
POST   /api/events/:eventId/rsvp
POST   /api/events/:eventId/attendance
GET    /api/events/:eventId/analytics
```

---

## 🚀 Getting Started for Developers

### Prerequisites
1. Node.js 16+ installed
2. MongoDB running (local or cloud)
3. VS Code or preferred IDE
4. Basic knowledge of React, TypeScript, and MongoDB

### Setup Steps

#### 1. Clone and Install Dependencies

```bash
# Navigate to project root
cd Employe_Connect-main

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

#### 2. Configure Environment Variables

Create `.env` file in `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_connect
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Email configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@company.com
SMTP_PASSWORD=your_password

# File upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

#### 3. Start Development Servers

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd ..
npm run dev
```

#### 4. Access the Application

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 📝 Integration Checklist

### Backend Integration
- [ ] Verify all models exist in `server/src/models/`
- [ ] Verify all routes exist in `server/src/routes/`
- [ ] Import and register routes in `server/src/server.ts`
- [ ] Test API endpoints with Postman/Thunder Client
- [ ] Verify database collections are created
- [ ] Test CRUD operations for each module
- [ ] Implement error handling
- [ ] Add input validation
- [ ] Set up file upload (if needed)
- [ ] Configure email notifications

### Frontend Integration
- [ ] Verify all page components exist
- [ ] Verify all UI components are installed (ShadCN)
- [ ] Add routes to router configuration
- [ ] Test navigation between pages
- [ ] Implement API service functions
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Test responsive design
- [ ] Add accessibility features
- [ ] Implement role-based access control

### Testing
- [ ] Unit tests for backend models
- [ ] Integration tests for API endpoints
- [ ] Component tests for React components
- [ ] E2E tests for critical workflows
- [ ] Performance testing
- [ ] Security testing
- [ ] Cross-browser testing

---

## 🔒 Security Considerations

### Authentication & Authorization
- All API endpoints require valid JWT token
- Role-based access control (RBAC) implemented
- Sensitive operations require elevated permissions

### Data Validation
- Input validation on both frontend and backend
- Mongoose schema validation
- File upload validation (type, size)

### Data Privacy
- Anonymous survey responses (when enabled)
- Personal data encryption
- GDPR compliance for employee data

---

## 🎨 UI/UX Guidelines

### Consistency
- Use ShadCN UI components throughout
- Follow existing color palettes and typography
- Maintain consistent spacing (TailwindCSS utilities)

### Responsiveness
- Mobile-first approach
- Test on multiple screen sizes
- Use responsive grid layouts

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation support
- Color contrast compliance (WCAG 2.1)

---

## 📊 Sample Data for Testing

### Create Test Celebrations
```javascript
// POST /api/celebrations
{
  "employeeId": "EMP001",
  "employeeName": "John Doe",
  "department": "Engineering",
  "eventType": "birthday",
  "eventTitle": "John's Birthday",
  "eventDate": "2026-03-15",
  "status": "upcoming",
  "budgetAllocated": 2000,
  "createdBy": "HR001"
}
```

### Create Test Training
```javascript
// POST /api/training
{
  "trainingName": "React Advanced Workshop",
  "trainingCategory": "Technical",
  "trainerName": "Jane Smith",
  "trainingMode": "Online",
  "startDate": "2026-04-01",
  "endDate": "2026-04-03",
  "durationHours": 24,
  "maxParticipants": 30,
  "costPerEmployee": 5000,
  "isPublished": true,
  "createdBy": "HR001"
}
```

### Create Test Group
```javascript
// POST /api/teams/groups
{
  "groupName": "Frontend Team",
  "description": "React and UI development team",
  "groupType": "Project Team",
  "department": "Engineering",
  "groupLead": {
    "employeeId": "EMP001",
    "name": "John Doe",
    "email": "john@company.com"
  },
  "maxMembers": 15,
  "status": "Active",
  "createdBy": "HR001"
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Database connection fails
**Solution**: Check MongoDB is running and connection string is correct in `.env`

**Issue**: API returns 401 Unauthorized
**Solution**: Ensure JWT token is included in Authorization header

**Issue**: File upload fails
**Solution**: Check upload directory exists and has write permissions

**Issue**: Frontend cannot connect to backend
**Solution**: Verify CORS is configured in `server.ts` and backend is running

---

## 📚 Additional Resources

### Documentation
- [Backend API Specification](./BACKEND_API_SPEC.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Development Mode Guide](./DEVELOPMENT_MODE.md)
- [MongoDB Setup Guide](./MONGODB_SETUP.md)

### External References
- [ShadCN UI Documentation](https://ui.shadcn.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Mongoose Guide](https://mongoosejs.com/)

---

## 📞 Support & Contact

### For Integration Questions
- Review individual module specifications
- Check existing implementations in similar modules
- Refer to code comments and TypeScript types
- Test with sample data provided

### Code Quality Standards
- Follow existing code structure and patterns
- Write meaningful comments
- Use TypeScript types throughout
- Follow ESLint rules
- Write tests for new features

---

## 📅 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-02-26 | Initial documentation for all 4 modules | System |

---

## ✅ Quick Start Summary

1. **Read** the individual module specifications
2. **Verify** all backend models and routes exist
3. **Test** API endpoints with sample data
4. **Review** frontend page components
5. **Integrate** with existing authentication
6. **Test** role-based access
7. **Deploy** and monitor

---

**Happy Coding! 🚀**

This comprehensive guide should enable any developer to understand, integrate, and extend the HR Process Mode modules in the Employee Connect platform.

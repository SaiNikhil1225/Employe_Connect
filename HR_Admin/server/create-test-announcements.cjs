const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: String,
  authorId: String,
  date: String,
  priority: String,
  status: String,
  isPoll: Boolean,
  isPinned: Boolean,
  category: String,
  departments: [String],
  locations: [String],
  imageUrl: String,
  likes: Number,
  likedBy: [String],
  comments: [{
    id: String,
    author: String,
    content: String,
    timestamp: Date,
    avatar: String
  }],
  reactions: [{
    emoji: String,
    userId: String,
    userName: String
  }],
  pollOptions: [{
    id: String,
    text: String,
    votes: Number,
    voters: [String]
  }],
  views: Number,
  viewDetails: [{
    employeeId: String,
    userName: String,
    timestamp: Date,
    department: String,
    role: String,
    device: String,
    browser: String,
    viewSource: String
  }]
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);

const testAnnouncements = [
  {
    title: 'Welcome to Q1 2026! 🎉',
    description: 'Happy New Year everyone! We\'re excited to kick off 2026 with renewed energy and vision. This quarter, we\'ll be focusing on innovation, collaboration, and delivering exceptional results for our clients. Let\'s make this our best year yet!',
    author: 'Sarah Johnson',
    authorId: 'EMP001',
    date: new Date('2026-01-02').toISOString(),
    priority: 'high',
    status: 'published',
    isPoll: false,
    isPinned: true,
    category: 'General Announcement',
    departments: [],
    locations: [],
    likes: 45,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 156
  },
  {
    title: 'New Employee Benefits Program Launched 🎁',
    description: 'We\'re thrilled to announce our enhanced employee benefits program! Starting this month, all employees will have access to expanded healthcare coverage, mental health support, gym memberships, and learning & development budgets. Check your email for detailed information or visit the HR portal.',
    author: 'HR Team',
    authorId: 'HR001',
    date: new Date('2026-01-15').toISOString(),
    priority: 'high',
    status: 'published',
    isPoll: false,
    isPinned: true,
    category: 'HR Update',
    departments: [],
    locations: [],
    likes: 89,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 234
  },
  {
    title: 'Office Renovation Complete - New Meeting Spaces Available 🏢',
    description: 'Great news! Our office renovation is complete. We now have 5 new state-of-the-art meeting rooms with video conferencing capabilities, 3 collaboration pods, and a renovated cafeteria. Book rooms through the facilities portal.',
    author: 'Facilities Team',
    authorId: 'FAC001',
    date: new Date('2026-01-20').toISOString(),
    priority: 'medium',
    status: 'published',
    isPoll: false,
    isPinned: false,
    category: 'Office Update',
    departments: [],
    locations: [],
    likes: 67,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 198
  },
  {
    title: 'Q1 Town Hall Meeting - February 10th 📅',
    description: 'Join us for our quarterly town hall meeting on February 10th at 2:00 PM (EST). Our CEO will share company updates, Q1 goals, and answer your questions. The meeting will be hybrid - attend in person at the main conference room or join via Teams. Calendar invite sent to all employees.',
    author: 'Executive Team',
    authorId: 'EXEC001',
    date: new Date('2026-02-01').toISOString(),
    priority: 'high',
    status: 'published',
    isPoll: false,
    isPinned: true,
    category: 'Event',
    departments: [],
    locations: [],
    likes: 102,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 287
  },
  {
    title: 'Security Update: Two-Factor Authentication Now Mandatory 🔒',
    description: 'To enhance security, two-factor authentication (2FA) is now mandatory for all systems. Please enable 2FA on your account by February 28th. IT support is available to assist. Visit the IT Help Center or contact support@company.com for guidance.',
    author: 'IT Security Team',
    authorId: 'IT001',
    date: new Date('2026-02-05').toISOString(),
    priority: 'high',
    status: 'published',
    isPoll: false,
    isPinned: true,
    category: 'IT Announcement',
    departments: [],
    locations: [],
    likes: 34,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 312
  },
  {
    title: 'Team Building Event - Save the Date! 🎯',
    description: 'Mark your calendars! Our annual team building event is scheduled for March 15th. We\'ll have team challenges, networking activities, and a celebration dinner. More details to follow soon. Get ready for a fun day of bonding and collaboration!',
    author: 'Culture Committee',
    authorId: 'CUL001',
    date: new Date('2026-02-12').toISOString(),
    priority: 'medium',
    status: 'published',
    isPoll: false,
    isPinned: false,
    category: 'Event',
    departments: [],
    locations: [],
    likes: 78,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 189
  },
  {
    title: 'New Training Programs Available 📚',
    description: 'We\'re excited to launch new training programs covering AI/ML, Cloud Computing, Leadership Skills, and Project Management. Enroll through the Learning Portal. Early bird discount available for registrations before March 1st!',
    author: 'Learning & Development',
    authorId: 'L&D001',
    date: new Date('2026-02-18').toISOString(),
    priority: 'medium',
    status: 'published',
    isPoll: false,
    isPinned: false,
    category: 'Training',
    departments: [],
    locations: [],
    likes: 56,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 167
  },
  {
    title: 'Celebrating Our Award Win! 🏆',
    description: 'Fantastic news! We\'ve been named "Best Workplace 2026" by TechWork Magazine! This achievement is thanks to each one of you and your dedication. Thank you for making our company an amazing place to work. Let\'s continue building on this success!',
    author: 'CEO',
    authorId: 'CEO001',
    date: new Date('2026-02-20').toISOString(),
    priority: 'high',
    status: 'published',
    isPoll: false,
    isPinned: true,
    category: 'Achievement',
    departments: [],
    locations: [],
    likes: 145,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 401
  },
  {
    title: 'Office Hours Change - Flexible Start Times ⏰',
    description: 'Based on employee feedback, we\'re introducing flexible start times! Core hours are 10 AM to 4 PM. You can choose your start time between 7 AM and 10 AM. Discuss with your manager to set your preferred schedule. Effective March 1st.',
    author: 'HR Team',
    authorId: 'HR001',
    date: new Date('2026-02-22').toISOString(),
    priority: 'high',
    status: 'published',
    isPoll: false,
    isPinned: false,
    category: 'Policy Update',
    departments: [],
    locations: [],
    likes: 123,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 298
  },
  {
    title: 'Wellness Week Coming Up! 🧘',
    description: 'Join us for Wellness Week (March 4-8)! Daily activities include yoga sessions, mental health workshops, nutrition seminars, and meditation classes. All activities are during lunch hours. Register on the wellness portal. Let\'s prioritize our health together!',
    author: 'Wellness Committee',
    authorId: 'WEL001',
    date: new Date('2026-02-23').toISOString(),
    priority: 'medium',
    status: 'published',
    isPoll: false,
    isPinned: false,
    category: 'Wellness',
    departments: [],
    locations: [],
    likes: 91,
    likedBy: [],
    comments: [],
    reactions: [],
    views: 213
  }
];

async function createTestAnnouncements() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('Connected to MongoDB');

    // Clear existing announcements
    await Announcement.deleteMany({});
    console.log('Cleared existing announcements');

    // Insert test announcements
    const result = await Announcement.insertMany(testAnnouncements);
    console.log(`✅ Created ${result.length} test announcements`);

    // Display summary
    console.log('\n=== Created Announcements ===');
    result.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title}`);
      console.log(`   Status: ${a.status}`);
      console.log(`   Priority: ${a.priority}`);
      console.log(`   Date: ${a.date}`);
      console.log(`   Pinned: ${a.isPinned ? 'Yes' : 'No'}`);
      console.log(`   Likes: ${a.likes}, Views: ${a.views}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done! You can now view these announcements in the app.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestAnnouncements();

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: String,
  status: String,
  date: String,
  createdAt: Date,
  author: String
});

const Announcement = mongoose.model('Announcement', announcementSchema);

async function checkAnnouncements() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('Connected to MongoDB');

    const announcements = await Announcement.find({}, {
      title: 1,
      status: 1,
      date: 1,
      createdAt: 1,
      author: 1
    }).sort({ createdAt: -1 });

    console.log('\n=== All Announcements ===');
    console.log('Total:', announcements.length);
    announcements.forEach((a, i) => {
      console.log(`\n${i + 1}. ${a.title}`);
      console.log(`   Status: ${a.status || 'NOT SET (defaults to published)'}`);
      console.log(`   Date: ${a.date}`);
      console.log(`   Created: ${a.createdAt}`);
      console.log(`   Author: ${a.author}`);
    });

    // Count by status
    const statusCounts = await Announcement.aggregate([
      {
        $addFields: {
          effectiveStatus: {
            $ifNull: ['$status', 'published']
          }
        }
      },
      {
        $group: {
          _id: '$effectiveStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n=== Status Breakdown ===');
    statusCounts.forEach(s => {
      console.log(`${s._id}: ${s.count}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAnnouncements();

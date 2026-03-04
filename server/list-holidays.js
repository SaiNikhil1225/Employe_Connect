/**
 * List Holidays Script
 * Fetches and displays all active holidays from the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/emsdb';

// Holiday Schema
const HolidaySchema = new mongoose.Schema({
  name: String,
  date: Date,
  status: String,
  isActive: Boolean,
  typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'HolidayType' },
  groupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HolidayGroup' }],
  observanceTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ObservanceType' },
  notes: String,
  imageUrl: String
}, { timestamps: true });

const Holiday = mongoose.model('Holiday', HolidaySchema);

async function listHolidays() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const holidays = await Holiday.find({ isActive: true })
      .sort({ date: 1 })
      .lean();

    console.log(`📅 Found ${holidays.length} active holidays:\n`);
    console.log('='.repeat(80));

    holidays.forEach((holiday, index) => {
      const date = new Date(holiday.date);
      const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
      const status = holiday.status || 'DRAFT';
      
      console.log(`${index + 1}. ${holiday.name}`);
      console.log(`   Date: ${dateStr}`);
      console.log(`   Status: ${status}`);
      if (holiday.notes) {
        console.log(`   Notes: ${holiday.notes}`);
      }
      console.log('');
    });

    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error fetching holidays:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

listHolidays();

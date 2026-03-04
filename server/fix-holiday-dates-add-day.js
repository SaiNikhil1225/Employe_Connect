/**
 * Fix Holiday Dates - Add One Day
 * 
 * This script adds one day to all holiday dates that were saved with timezone offset.
 * This fixes dates that are showing one day earlier due to timezone issues.
 * 
 * Usage: node fix-holiday-dates-add-day.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/emsdb';

// Holiday Schema (subset)
const HolidaySchema = new mongoose.Schema({
  name: String,
  date: Date,
  status: String,
  isActive: Boolean
}, { timestamps: true });

const Holiday = mongoose.model('Holiday', HolidaySchema);

async function fixHolidayDates() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all holidays
    const holidays = await Holiday.find({ isActive: true });
    console.log(`📅 Found ${holidays.length} holidays to fix\n`);

    let fixedCount = 0;

    for (const holiday of holidays) {
      const originalDate = new Date(holiday.date);
      
      // Add one day to the date (24 hours = 86400000 milliseconds)
      const correctedDate = new Date(originalDate.getTime() + 86400000);
      
      console.log(`🔧 Fixing: ${holiday.name}`);
      console.log(`   Old: ${originalDate.toISOString()} (${formatDate(originalDate)})`);
      console.log(`   New: ${correctedDate.toISOString()} (${formatDate(correctedDate)})`);
      
      holiday.date = correctedDate;
      await holiday.save();
      fixedCount++;
      console.log('');
    }

    console.log('='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   Total holidays: ${holidays.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log('='.repeat(50));
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing holiday dates:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Run the migration
fixHolidayDates();

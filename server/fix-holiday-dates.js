/**
 * Fix Holiday Dates - Migration Script
 * 
 * This script fixes holidays that were saved with incorrect timezone.
 * Converts all holiday dates to UTC midnight to ensure they display correctly.
 * 
 * Usage: node fix-holiday-dates.js
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
    console.log(`📅 Found ${holidays.length} holidays to check\n`);

    let fixedCount = 0;
    let unchangedCount = 0;

    for (const holiday of holidays) {
      const originalDate = new Date(holiday.date);
      
      // Extract UTC date components
      const year = originalDate.getUTCFullYear();
      const month = originalDate.getUTCMonth();
      const day = originalDate.getUTCDate();
      
      // Create a new date at UTC midnight
      const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      
      // Check if date needs fixing (not already at UTC midnight)
      if (originalDate.getTime() !== utcMidnight.getTime()) {
        console.log(`🔧 Fixing: ${holiday.name}`);
        console.log(`   Old: ${originalDate.toISOString()}`);
        console.log(`   New: ${utcMidnight.toISOString()}`);
        
        holiday.date = utcMidnight;
        await holiday.save();
        fixedCount++;
      } else {
        console.log(`✓ OK: ${holiday.name} - ${originalDate.toISOString()}`);
        unchangedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   Total holidays: ${holidays.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Already correct: ${unchangedCount}`);
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

// Run the migration
fixHolidayDates();

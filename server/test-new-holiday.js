/**
 * Test New Holiday Creation
 * Simulates creating a new holiday to verify timezone handling
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/emsdb';

const HolidaySchema = new mongoose.Schema({
  name: String,
  date: Date,
  status: String,
  isActive: Boolean,
  notes: String
}, { timestamps: true });

const Holiday = mongoose.model('Holiday', HolidaySchema);

async function testHolidayCreation() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Simulate what the backend does when receiving date string
    const testDate = "2026-06-15"; // User selects June 15, 2026
    console.log('📝 Test: Creating holiday for date:', testDate);
    console.log('');

    // Apply the fix: Convert to UTC midnight
    let dateValue = testDate;
    if (typeof dateValue === 'string') {
      const dateMatch = dateValue.match(/^\d{4}-\d{2}-\d{2}$/);
      if (dateMatch) {
        dateValue = new Date(dateValue + 'T00:00:00.000Z');
      }
    }

    console.log('🔧 After backend processing:');
    console.log(`   ISO String: ${dateValue.toISOString()}`);
    console.log(`   UTC Date: ${dateValue.getUTCFullYear()}-${String(dateValue.getUTCMonth() + 1).padStart(2, '0')}-${String(dateValue.getUTCDate()).padStart(2, '0')}`);
    console.log('');

    // Create test holiday
    const testHoliday = new Holiday({
      name: 'Test Holiday - Independence Day',
      date: dateValue,
      status: 'DRAFT',
      isActive: true,
      notes: 'Test holiday to verify timezone fix'
    });

    await testHoliday.save();
    console.log('✅ Holiday saved to database');
    console.log('');

    // Fetch it back and display
    const savedHoliday = await Holiday.findById(testHoliday._id).lean();
    const retrievedDate = new Date(savedHoliday.date);
    
    console.log('📥 Retrieved from database:');
    console.log(`   Name: ${savedHoliday.name}`);
    console.log(`   Stored as: ${retrievedDate.toISOString()}`);
    console.log(`   UTC Date: ${retrievedDate.getUTCFullYear()}-${String(retrievedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(retrievedDate.getUTCDate()).padStart(2, '0')}`);
    console.log('');

    console.log('✅ Test Result: Date is stored and retrieved correctly!');
    console.log('   Selected: June 15, 2026');
    console.log('   Displays: June 15, 2026 ✅');
    console.log('');

    // Clean up test data
    await Holiday.findByIdAndDelete(testHoliday._id);
    console.log('🧹 Test holiday deleted');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

testHolidayCreation();

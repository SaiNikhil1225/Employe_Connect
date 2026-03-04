import dotenv from 'dotenv';
import HelpdeskTicket from './models/HelpdeskTicket';
import connectDB from './config/database';

dotenv.config();

async function fixTicketAssignments() {
  try {
    await connectDB();

    console.log('🔧 Fixing ticket assignments with old IT employee MongoDB ObjectIds...');

    // Find all assigned tickets
    const assignedTickets = await HelpdeskTicket.find({ 
      'assignment.assignedToId': { $exists: true } 
    });

    console.log(`\nFound ${assignedTickets.length} assigned ticket(s)`);

    let updatedCount = 0;

    for (const ticket of assignedTickets) {
      if (!ticket.assignment) continue;
      const oldId = ticket.assignment.assignedToId;
      const name = ticket.assignment.assignedToName;
      
      // Only update if the ID is a MongoDB ObjectId (not already a string like IT007)
      if (oldId && oldId.length === 24 && /^[0-9a-fA-F]{24}$/.test(oldId)) {
        console.log(`\n📋 Ticket ${ticket.ticketNumber}:`);
        console.log(`   Currently assigned to: ${name} (${oldId})`);
        
        // Map name to correct employee ID
        const nameToIdMap: Record<string, string> = {
          'David Smith': 'IT002',
          'Emily Chen': 'IT003',
          'Michael Johnson': 'IT004',
          'Sarah Williams': 'IT005',
          'James Anderson': 'IT006',
          'Lisa Martinez': 'IT007',
          'Robert Taylor': 'IT008',
          'Jennifer Brown': 'IT009',
          'William Davis': 'IT010',
          'Amanda Wilson': 'IT011',
        };

        const newId = name ? nameToIdMap[name] : undefined;
        
        if (newId) {
          // Update using findByIdAndUpdate to ensure it saves
          await HelpdeskTicket.findByIdAndUpdate(
            ticket._id,
            { $set: { 'assignment.assignedToId': newId } },
            { new: true }
          );
          console.log(`   ✅ Updated to: ${newId}`);
          updatedCount++;
        } else {
          console.log(`   ⚠️ Could not find new ID for ${name}`);
        }
      }
    }

    if (updatedCount === 0) {
      console.log('\nℹ️ No tickets needed updating');
    } else {
      console.log(`\n✅ Total: Updated ${updatedCount} ticket assignment(s)`);
    }

    console.log('\n✅ Ticket assignment fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing ticket assignments:', error);
    process.exit(1);
  }
}

fixTicketAssignments();

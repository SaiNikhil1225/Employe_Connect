"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const HelpdeskTicket_1 = __importDefault(require("./models/HelpdeskTicket"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
async function checkAllTickets() {
    try {
        await (0, database_1.default)();
        console.log('🔍 Checking all IT tickets...\n');
        const tickets = await HelpdeskTicket_1.default.find({ highLevelCategory: 'IT' });
        console.log(`Found ${tickets.length} IT ticket(s):\n`);
        tickets.forEach(ticket => {
            console.log(`📋 ${ticket.ticketNumber}: ${ticket.subject}`);
            console.log(`   Status: ${ticket.status}`);
            console.log(`   SubCategory: ${ticket.subCategory}`);
            console.log(`   ApprovalLevel: ${ticket.approvalLevel || 'NONE'}`);
            console.log(`   ApprovalStatus: ${ticket.approvalStatus || 'N/A'}`);
            if (ticket.assignment) {
                console.log(`   Assigned to: ${ticket.assignment.assignedToName} (${ticket.assignment.assignedToId})`);
            }
            else {
                console.log(`   Assigned to: Not assigned`);
            }
            console.log('');
        });
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error checking tickets:', error);
        process.exit(1);
    }
}
checkAllTickets();
//# sourceMappingURL=checkAllTickets.js.map
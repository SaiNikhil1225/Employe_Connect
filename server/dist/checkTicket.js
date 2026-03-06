"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const HelpdeskTicket_1 = __importDefault(require("./models/HelpdeskTicket"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
async function checkTicket() {
    try {
        await (0, database_1.default)();
        console.log('🔍 Checking ticket assignments...');
        const tickets = await HelpdeskTicket_1.default.find({ status: 'Assigned' });
        console.log(`\nFound ${tickets.length} assigned ticket(s):`);
        tickets.forEach(ticket => {
            console.log(`\n📋 Ticket: ${ticket.ticketNumber}`);
            console.log(`   Subject: ${ticket.subject}`);
            console.log(`   Status: ${ticket.status}`);
            console.log(`   Assignment:`, ticket.assignment);
        });
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error checking tickets:', error);
        process.exit(1);
    }
}
checkTicket();
//# sourceMappingURL=checkTicket.js.map
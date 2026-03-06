"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const HelpdeskTicket_1 = __importDefault(require("./models/HelpdeskTicket"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';
async function deleteTicket(ticketId) {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        const result = await HelpdeskTicket_1.default.findByIdAndDelete(ticketId);
        if (result) {
            console.log('✅ Ticket deleted successfully:', result.ticketNumber);
        }
        else {
            console.log('❌ Ticket not found with ID:', ticketId);
        }
        await mongoose_1.default.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
// Get ticket ID from command line argument
const ticketId = process.argv[2];
if (!ticketId) {
    console.error('❌ Please provide a ticket ID');
    console.log('Usage: npx ts-node src/deleteTicket.ts <TICKET_ID>');
    process.exit(1);
}
deleteTicket(ticketId);
//# sourceMappingURL=deleteTicket.js.map
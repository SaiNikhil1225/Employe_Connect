"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Project_1 = __importDefault(require("../models/Project"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';
async function setDealOwner() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        // Update P001 with dealOwner
        await Project_1.default.findOneAndUpdate({ projectId: 'P001' }, {
            $set: {
                dealOwner: {
                    employeeId: 'E001',
                    name: 'Michael Chen'
                }
            }
        });
        console.log('✅ Set dealOwner for P001 to: Michael Chen');
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
    }
}
setDealOwner();
//# sourceMappingURL=set-deal-owner.js.map
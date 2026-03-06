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
async function checkProject() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        const project = await Project_1.default.findOne({ projectId: 'P001' });
        console.log('\n📋 Project P001 Data:\n');
        console.log(JSON.stringify(project, null, 2));
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
    }
}
checkProject();
//# sourceMappingURL=check-project.js.map
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
async function migrateProjects() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        // Find all projects that don't have the new fields
        const projectsToUpdate = await Project_1.default.find({
            $or: [
                { dealOwner: { $exists: false } },
                { regionHead: { $exists: false } },
                { leadSource: { $exists: false } },
                { projectWonThroughRFP: { $exists: false } }
            ]
        });
        console.log(`\n📊 Found ${projectsToUpdate.length} projects to update\n`);
        for (const project of projectsToUpdate) {
            const updates = {};
            // Add dealOwner if missing (use projectManager as default)
            if (!project.dealOwner && project.projectManager) {
                updates.dealOwner = {
                    employeeId: project.projectManager.employeeId,
                    name: project.projectManager.name
                };
            }
            // Add regionHead if missing (derive from region)
            if (!project.regionHead && project.region) {
                const regionHeadMap = {
                    'UK': 'Abhishek Singh',
                    'India': 'Sarvesh Agrawal',
                    'USA': 'Sasi Kanth',
                    'ME': 'Sajawal Hassan',
                    'Other': 'Not Specified'
                };
                updates.regionHead = regionHeadMap[project.region] || 'Not Specified';
            }
            // Add leadSource if missing (default value)
            if (!project.leadSource) {
                updates.leadSource = 'Referral'; // Default value
            }
            // Add projectWonThroughRFP if missing
            if (project.projectWonThroughRFP === undefined) {
                updates.projectWonThroughRFP = false;
            }
            if (Object.keys(updates).length > 0) {
                await Project_1.default.findByIdAndUpdate(project._id, { $set: updates });
                console.log(`✅ Updated project ${project.projectId} - ${project.projectName}`);
                console.log(`   - Deal Owner: ${updates.dealOwner?.name || 'unchanged'}`);
                console.log(`   - Region Head: ${updates.regionHead || 'unchanged'}`);
                console.log(`   - Lead Source: ${updates.leadSource || 'unchanged'}`);
                console.log(`   - RFP: ${updates.projectWonThroughRFP !== undefined ? updates.projectWonThroughRFP : 'unchanged'}`);
                console.log('');
            }
        }
        console.log(`\n✅ Migration complete! Updated ${projectsToUpdate.length} projects\n`);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}
// Run migration
migrateProjects();
//# sourceMappingURL=add-missing-project-fields.js.map
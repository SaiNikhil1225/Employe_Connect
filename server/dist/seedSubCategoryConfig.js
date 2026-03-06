"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SubCategoryConfig_1 = __importDefault(require("./models/SubCategoryConfig"));
const database_1 = __importDefault(require("./config/database"));
// Import the existing JSON data with display order
const subCategoryMapping = {
    "IT": {
        "Hardware": {
            "requiresApproval": true,
            "processingQueue": "IT",
            "specialistQueue": "Hardware Team",
            "order": 1
        },
        "Software": {
            "requiresApproval": true,
            "processingQueue": "IT",
            "specialistQueue": "Software Team",
            "order": 2
        },
        "Network / Connectivity": {
            "requiresApproval": false,
            "processingQueue": "IT",
            "specialistQueue": "Network Team",
            "order": 3
        },
        "Account / Login Problem": {
            "requiresApproval": false,
            "processingQueue": "IT",
            "specialistQueue": "Identity Team",
            "order": 4
        },
        "Access Request": {
            "requiresApproval": true,
            "processingQueue": "IT",
            "specialistQueue": "Security Team",
            "order": 5
        },
        "New Equipment Request": {
            "requiresApproval": true,
            "processingQueue": "IT",
            "specialistQueue": "Hardware Team",
            "order": 6
        },
        "Other": {
            "requiresApproval": false,
            "processingQueue": "IT",
            "specialistQueue": "General IT Support",
            "order": 7
        }
    },
    "Facilities": {
        "Maintenance Request": {
            "requiresApproval": false,
            "processingQueue": "Facilities",
            "specialistQueue": "Building Maintenance",
            "order": 1
        },
        "Repair Request": {
            "requiresApproval": false,
            "processingQueue": "Facilities",
            "specialistQueue": "Building Maintenance",
            "order": 2
        },
        "Cleaning": {
            "requiresApproval": false,
            "processingQueue": "Facilities",
            "specialistQueue": "Housekeeping",
            "order": 3
        },
        "Electrical Issue": {
            "requiresApproval": false,
            "processingQueue": "Facilities",
            "specialistQueue": "Electrical Team",
            "order": 4
        },
        "AC Temperature Issue": {
            "requiresApproval": false,
            "processingQueue": "Facilities",
            "specialistQueue": "HVAC Team",
            "order": 5
        },
        "Plumbing": {
            "requiresApproval": false,
            "processingQueue": "Facilities",
            "specialistQueue": "Plumbing Team",
            "order": 6
        },
        "Furniture": {
            "requiresApproval": false,
            "processingQueue": "Facilities",
            "specialistQueue": "Furniture & Layout",
            "order": 7
        }
    },
    "Finance": {
        "Payroll Question": {
            "requiresApproval": false,
            "processingQueue": "Finance",
            "specialistQueue": "Payroll Team",
            "order": 1
        },
        "Expense Reimbursement Issue": {
            "requiresApproval": false,
            "processingQueue": "Finance",
            "specialistQueue": "Expense Claims",
            "order": 2
        },
        "Invoice / Payment Issue": {
            "requiresApproval": false,
            "processingQueue": "Finance",
            "specialistQueue": "Invoice Processing",
            "order": 3
        },
        "Purchase Order Request": {
            "requiresApproval": false,
            "processingQueue": "Finance",
            "specialistQueue": "Procurement Team",
            "order": 4
        },
        "Vendor Setup or Update": {
            "requiresApproval": false,
            "processingQueue": "Finance",
            "specialistQueue": "Vendor Management",
            "order": 5
        },
        "Budget or Account Inquiry": {
            "requiresApproval": false,
            "processingQueue": "Finance",
            "specialistQueue": "Accounts Team",
            "order": 6
        }
    }
};
async function seedSubCategoryConfig() {
    try {
        // Connect to database
        await (0, database_1.default)();
        // Clear existing data
        await SubCategoryConfig_1.default.deleteMany({});
        console.log('✅ Cleared existing subcategory configurations');
        // Prepare seed data
        const seedData = [];
        // Transform nested object into flat array of documents
        Object.entries(subCategoryMapping).forEach(([highLevelCategory, subCategories]) => {
            Object.entries(subCategories).forEach(([subCategory, config]) => {
                seedData.push({
                    highLevelCategory,
                    subCategory,
                    requiresApproval: config.requiresApproval,
                    processingQueue: config.processingQueue,
                    specialistQueue: config.specialistQueue,
                    order: config.order || 999,
                    isActive: true
                });
            });
        });
        // Insert seed data
        await SubCategoryConfig_1.default.insertMany(seedData);
        console.log(`✅ Seeded ${seedData.length} subcategory configurations`);
        // Verify the data
        const count = await SubCategoryConfig_1.default.countDocuments();
        console.log(`📊 Total configurations in database: ${count}`);
        // Show breakdown by category
        const itCount = await SubCategoryConfig_1.default.countDocuments({ highLevelCategory: 'IT' });
        const facilitiesCount = await SubCategoryConfig_1.default.countDocuments({ highLevelCategory: 'Facilities' });
        const financeCount = await SubCategoryConfig_1.default.countDocuments({ highLevelCategory: 'Finance' });
        console.log(`  - IT: ${itCount} configurations`);
        console.log(`  - Facilities: ${facilitiesCount} configurations`);
        console.log(`  - Finance: ${financeCount} configurations`);
        // Close connection
        await mongoose_1.default.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding subcategory config:', error);
        process.exit(1);
    }
}
// Run the seed script
seedSubCategoryConfig();
//# sourceMappingURL=seedSubCategoryConfig.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const ConfigMaster_1 = __importDefault(require("./models/ConfigMaster"));
dotenv_1.default.config();
const configData = [
    // Billing Types
    {
        type: 'billing-type',
        name: 'T&M',
        description: 'Time and Materials - Bill based on actual hours worked',
        status: 'Active',
    },
    {
        type: 'billing-type',
        name: 'Fixed Bid',
        description: 'Fixed price for the entire project scope',
        status: 'Active',
    },
    {
        type: 'billing-type',
        name: 'Fixed Monthly',
        description: 'Fixed monthly retainer fee',
        status: 'Active',
    },
    {
        type: 'billing-type',
        name: 'License',
        description: 'Software license or subscription based',
        status: 'Active',
    },
    // Project Currencies
    {
        type: 'project-currency',
        name: 'USD',
        description: 'US Dollar',
        status: 'Active',
    },
    {
        type: 'project-currency',
        name: 'GBP',
        description: 'British Pound',
        status: 'Active',
    },
    {
        type: 'project-currency',
        name: 'INR',
        description: 'Indian Rupee',
        status: 'Active',
    },
    {
        type: 'project-currency',
        name: 'EUR',
        description: 'Euro',
        status: 'Active',
    },
    {
        type: 'project-currency',
        name: 'AED',
        description: 'UAE Dirham',
        status: 'Active',
    },
    // Lead Sources
    {
        type: 'lead-source',
        name: 'Direct',
        description: 'Direct inquiry from client',
        status: 'Active',
    },
    {
        type: 'lead-source',
        name: 'Partner Referral',
        description: 'Referred by business partner',
        status: 'Active',
    },
    {
        type: 'lead-source',
        name: 'Website',
        description: 'Lead from company website',
        status: 'Active',
    },
    {
        type: 'lead-source',
        name: 'Event',
        description: 'Met at conference or event',
        status: 'Active',
    },
    {
        type: 'lead-source',
        name: 'Cold Outreach',
        description: 'Proactive sales outreach',
        status: 'Active',
    },
    {
        type: 'lead-source',
        name: 'Existing Customer',
        description: 'New project from existing client',
        status: 'Active',
    },
    {
        type: 'lead-source',
        name: 'Marketing Campaign',
        description: 'Generated from marketing efforts',
        status: 'Active',
    },
    {
        type: 'lead-source',
        name: 'Other',
        description: 'Other sources',
        status: 'Active',
    },
    // Revenue Types
    {
        type: 'revenue-type',
        name: 'New Business',
        description: 'Revenue from new customer acquisition',
        status: 'Active',
    },
    {
        type: 'revenue-type',
        name: 'Expansion',
        description: 'Additional services to existing customers',
        status: 'Active',
    },
    {
        type: 'revenue-type',
        name: 'Renewal',
        description: 'Contract or subscription renewal',
        status: 'Active',
    },
    {
        type: 'revenue-type',
        name: 'Upsell',
        description: 'Higher tier or premium services',
        status: 'Active',
    },
    {
        type: 'revenue-type',
        name: 'Cross-sell',
        description: 'Different product or service line',
        status: 'Active',
    },
    // Client Types
    {
        type: 'client-type',
        name: 'Enterprise',
        description: 'Large enterprise organizations (1000+ employees)',
        status: 'Active',
    },
    {
        type: 'client-type',
        name: 'Mid-Market',
        description: 'Mid-sized companies (100-1000 employees)',
        status: 'Active',
    },
    {
        type: 'client-type',
        name: 'SMB',
        description: 'Small and Medium Business (under 100 employees)',
        status: 'Active',
    },
    {
        type: 'client-type',
        name: 'Startup',
        description: 'Early-stage startup companies',
        status: 'Active',
    },
    {
        type: 'client-type',
        name: 'Government',
        description: 'Government agencies and public sector',
        status: 'Active',
    },
];
async function seedConfigMaster() {
    try {
        await (0, database_1.default)();
        console.log('🌱 Seeding Configuration Master Data...');
        // Remove existing configuration data
        await ConfigMaster_1.default.deleteMany({});
        console.log('✅ Cleared existing configuration data');
        // Insert configuration data
        const createdConfigs = await ConfigMaster_1.default.insertMany(configData);
        console.log(`✅ Created ${createdConfigs.length} configuration entries`);
        // Group by type for summary display
        const configsByType = configData.reduce((acc, config) => {
            if (!acc[config.type]) {
                acc[config.type] = [];
            }
            acc[config.type].push(config);
            return acc;
        }, {});
        console.log('\n📊 Configuration Master Data Summary:');
        console.log('─'.repeat(80));
        Object.entries(configsByType).forEach(([type, configs]) => {
            const typeLabel = type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            console.log(`\n  ${typeLabel} (${configs.length} items):`);
            configs.forEach((config) => {
                console.log(`    • ${config.name}${config.description ? ` - ${config.description}` : ''}`);
            });
        });
        console.log('\n' + '─'.repeat(80));
        console.log('\n✅ Seeding completed successfully!');
        console.log('\n📝 Configuration Summary:');
        console.log(`  • Billing Types: ${configsByType['billing-type']?.length || 0} entries`);
        console.log(`  • Currencies: ${configsByType['project-currency']?.length || 0} entries`);
        console.log(`  • Lead Sources: ${configsByType['lead-source']?.length || 0} entries`);
        console.log(`  • Revenue Types: ${configsByType['revenue-type']?.length || 0} entries`);
        console.log(`  • Client Types: ${configsByType['client-type']?.length || 0} entries`);
        console.log('\n🎯 You can now use these values in the Project form dropdowns!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding configuration data:', error);
        process.exit(1);
    }
}
seedConfigMaster();
//# sourceMappingURL=seedConfigMaster.js.map
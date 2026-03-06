import dotenv from 'dotenv';
import connectDB from './config/database';
import ConfigMaster from './models/ConfigMaster';

dotenv.config();

const configData = [
  // Billing Types
  {
    type: 'billing-type' as const,
    name: 'T&M',
    description: 'Time and Materials - Bill based on actual hours worked',
    status: 'Active' as const,
  },
  {
    type: 'billing-type' as const,
    name: 'Fixed Bid',
    description: 'Fixed price for the entire project scope',
    status: 'Active' as const,
  },
  {
    type: 'billing-type' as const,
    name: 'Fixed Monthly',
    description: 'Fixed monthly retainer fee',
    status: 'Active' as const,
  },
  {
    type: 'billing-type' as const,
    name: 'License',
    description: 'Software license or subscription based',
    status: 'Active' as const,
  },

  // Project Currencies
  {
    type: 'project-currency' as const,
    name: 'USD',
    description: 'US Dollar',
    status: 'Active' as const,
  },
  {
    type: 'project-currency' as const,
    name: 'GBP',
    description: 'British Pound',
    status: 'Active' as const,
  },
  {
    type: 'project-currency' as const,
    name: 'INR',
    description: 'Indian Rupee',
    status: 'Active' as const,
  },
  {
    type: 'project-currency' as const,
    name: 'EUR',
    description: 'Euro',
    status: 'Active' as const,
  },
  {
    type: 'project-currency' as const,
    name: 'AED',
    description: 'UAE Dirham',
    status: 'Active' as const,
  },

  // Lead Sources
  {
    type: 'lead-source' as const,
    name: 'Direct',
    description: 'Direct inquiry from client',
    status: 'Active' as const,
  },
  {
    type: 'lead-source' as const,
    name: 'Partner Referral',
    description: 'Referred by business partner',
    status: 'Active' as const,
  },
  {
    type: 'lead-source' as const,
    name: 'Website',
    description: 'Lead from company website',
    status: 'Active' as const,
  },
  {
    type: 'lead-source' as const,
    name: 'Event',
    description: 'Met at conference or event',
    status: 'Active' as const,
  },
  {
    type: 'lead-source' as const,
    name: 'Cold Outreach',
    description: 'Proactive sales outreach',
    status: 'Active' as const,
  },
  {
    type: 'lead-source' as const,
    name: 'Existing Customer',
    description: 'New project from existing client',
    status: 'Active' as const,
  },
  {
    type: 'lead-source' as const,
    name: 'Marketing Campaign',
    description: 'Generated from marketing efforts',
    status: 'Active' as const,
  },
  {
    type: 'lead-source' as const,
    name: 'Other',
    description: 'Other sources',
    status: 'Active' as const,
  },

  // Revenue Types
  {
    type: 'revenue-type' as const,
    name: 'New Business',
    description: 'Revenue from new customer acquisition',
    status: 'Active' as const,
  },
  {
    type: 'revenue-type' as const,
    name: 'Expansion',
    description: 'Additional services to existing customers',
    status: 'Active' as const,
  },
  {
    type: 'revenue-type' as const,
    name: 'Renewal',
    description: 'Contract or subscription renewal',
    status: 'Active' as const,
  },
  {
    type: 'revenue-type' as const,
    name: 'Upsell',
    description: 'Higher tier or premium services',
    status: 'Active' as const,
  },
  {
    type: 'revenue-type' as const,
    name: 'Cross-sell',
    description: 'Different product or service line',
    status: 'Active' as const,
  },

  // Client Types
  {
    type: 'client-type' as const,
    name: 'Enterprise',
    description: 'Large enterprise organizations (1000+ employees)',
    status: 'Active' as const,
  },
  {
    type: 'client-type' as const,
    name: 'Mid-Market',
    description: 'Mid-sized companies (100-1000 employees)',
    status: 'Active' as const,
  },
  {
    type: 'client-type' as const,
    name: 'SMB',
    description: 'Small and Medium Business (under 100 employees)',
    status: 'Active' as const,
  },
  {
    type: 'client-type' as const,
    name: 'Startup',
    description: 'Early-stage startup companies',
    status: 'Active' as const,
  },
  {
    type: 'client-type' as const,
    name: 'Government',
    description: 'Government agencies and public sector',
    status: 'Active' as const,
  },
];

async function seedConfigMaster() {
  try {
    await connectDB();

    console.log('🌱 Seeding Configuration Master Data...');

    // Remove existing configuration data
    await ConfigMaster.deleteMany({});
    console.log('✅ Cleared existing configuration data');

    // Insert configuration data
    const createdConfigs = await ConfigMaster.insertMany(configData);
    console.log(`✅ Created ${createdConfigs.length} configuration entries`);

    // Group by type for summary display
    const configsByType = configData.reduce((acc, config) => {
      if (!acc[config.type]) {
        acc[config.type] = [];
      }
      acc[config.type].push(config);
      return acc;
    }, {} as Record<string, typeof configData>);

    console.log('\n📊 Configuration Master Data Summary:');
    console.log('─'.repeat(80));
    
    Object.entries(configsByType).forEach(([type, configs]) => {
      const typeLabel = type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
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
  } catch (error) {
    console.error('❌ Error seeding configuration data:', error);
    process.exit(1);
  }
}

seedConfigMaster();

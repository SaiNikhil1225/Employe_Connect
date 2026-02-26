#!/usr/bin/env node

/**
 * Training Data Seeder Script
 * 
 * This script seeds the Training & Development module with sample data
 * based on actual employees in the database.
 * 
 * Usage: node seed-training.cjs
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🌱 Starting Training Data Seeder...\n');

const seederPath = path.join(__dirname, 'server', 'src', 'seeders', 'trainingSeeder.ts');

// Run the seeder using ts-node
const seeder = spawn('npx', ['ts-node', seederPath], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

seeder.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Training data seeding completed successfully!');
  } else {
    console.error(`\n❌ Training data seeding failed with code ${code}`);
  }
  process.exit(code);
});

seeder.on('error', (error) => {
  console.error('❌ Failed to start seeder:', error);
  process.exit(1);
});

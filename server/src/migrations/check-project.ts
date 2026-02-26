import mongoose from 'mongoose';
import Project from '../models/Project';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function checkProject() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const project = await Project.findOne({ projectId: 'P001' });
    
    console.log('\n📋 Project P001 Data:\n');
    console.log(JSON.stringify(project, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkProject();

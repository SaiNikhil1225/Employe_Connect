import mongoose from 'mongoose';
import Project from '../models/Project';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function setDealOwner() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Update P001 with dealOwner
    await Project.findOneAndUpdate(
      { projectId: 'P001' },
      { 
        $set: { 
          dealOwner: {
            employeeId: 'E001',
            name: 'Michael Chen'
          }
        } 
      }
    );
    
    console.log('✅ Set dealOwner for P001 to: Michael Chen');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

setDealOwner();

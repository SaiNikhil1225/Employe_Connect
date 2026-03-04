import mongoose from 'mongoose';
import logger from './logger';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

// Track last connection error for diagnostics
export let lastDbError: string = '';
export let dbConnectionAttempts = 0;

const connectDB = async (retryCount = 0): Promise<void> => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';
    
    dbConnectionAttempts++;
    logger.info(`🔗 Attempting MongoDB connection (attempt ${dbConnectionAttempts})...`);
    logger.info(`🔗 URI host: ${MONGODB_URI.split('@')[1]?.split('/')[0] || 'unknown'}`);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    });
    
    lastDbError = '';
    logger.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    logger.info(`📊 Database: ${mongoose.connection.name}`);
  } catch (error: any) {
    lastDbError = error?.message || String(error);
    logger.error('❌ MongoDB connection error:', lastDbError);
    if (retryCount < MAX_RETRIES) {
      logger.info(`🔄 Retrying MongoDB connection (${retryCount + 1}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }
    logger.error('❌ All MongoDB connection retries failed. Server will continue but DB operations will fail.');
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('❌ MongoDB error:', err);
});

export default connectDB;

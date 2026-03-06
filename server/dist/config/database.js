"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnectionAttempts = exports.lastDbError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("./logger"));
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;
// Track last connection error for diagnostics
exports.lastDbError = '';
exports.dbConnectionAttempts = 0;
const connectDB = async (retryCount = 0) => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';
        exports.dbConnectionAttempts++;
        logger_1.default.info(`🔗 Attempting MongoDB connection (attempt ${exports.dbConnectionAttempts})...`);
        logger_1.default.info(`🔗 URI host: ${MONGODB_URI.split('@')[1]?.split('/')[0] || 'unknown'}`);
        await mongoose_1.default.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 30000,
            family: 4, // Force IPv4 — avoids IPv6 DNS delays on corporate networks
        });
        exports.lastDbError = '';
        logger_1.default.info(`✅ MongoDB Connected: ${mongoose_1.default.connection.host}`);
        logger_1.default.info(`📊 Database: ${mongoose_1.default.connection.name}`);
    }
    catch (error) {
        exports.lastDbError = error?.message || String(error);
        logger_1.default.error('❌ MongoDB connection error:', exports.lastDbError);
        if (retryCount < MAX_RETRIES) {
            logger_1.default.info(`🔄 Retrying MongoDB connection (${retryCount + 1}/${MAX_RETRIES}) in ${RETRY_DELAY_MS / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            return connectDB(retryCount + 1);
        }
        logger_1.default.error('❌ All MongoDB connection retries failed. Server will continue but DB operations will fail.');
    }
};
// Handle connection events
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.default.warn('⚠️  MongoDB disconnected');
});
mongoose_1.default.connection.on('error', (err) => {
    logger_1.default.error('❌ MongoDB error:', err);
});
exports.default = connectDB;
//# sourceMappingURL=database.js.map
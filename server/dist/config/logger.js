"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganStream = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
// Tell winston about the colors
winston_1.default.addColors(colors);
// Determine the environment
const isDevelopment = process.env.NODE_ENV !== 'production';
// Define log format
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Define console format for development
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}${info.stack ? '\n' + info.stack : ''}`));
// Define which transports to use
const transports = [
    // Console transport for development
    new winston_1.default.transports.Console({
        format: isDevelopment ? consoleFormat : format,
    }),
];
// Add file transports for production
if (!isDevelopment) {
    try {
        const logDir = path_1.default.join(process.cwd(), 'logs');
        if (!fs_1.default.existsSync(logDir)) {
            fs_1.default.mkdirSync(logDir, { recursive: true });
        }
        // Error log file
        transports.push(new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }));
        // Combined log file
        transports.push(new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }));
    }
    catch (err) {
        // If file logging fails, continue with console only
        console.warn('Could not set up file logging:', err);
    }
}
// Create the logger
const logger = winston_1.default.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    levels,
    format,
    transports,
    exitOnError: false,
});
// Create a stream for Morgan HTTP logging
exports.morganStream = {
    write: (message) => {
        logger.http(message.trim());
    },
};
exports.default = logger;
//# sourceMappingURL=logger.js.map
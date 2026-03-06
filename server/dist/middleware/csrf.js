"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCSRFToken = generateCSRFToken;
exports.validateCSRFToken = validateCSRFToken;
exports.csrfProtection = csrfProtection;
exports.getCSRFToken = getCSRFToken;
const crypto_1 = __importDefault(require("crypto"));
// Simple CSRF token implementation
// Store tokens in memory (for production, consider Redis or database)
const csrfTokens = new Map();
// Token expiration time (15 minutes)
const TOKEN_EXPIRY = 15 * 60 * 1000;
/**
 * Generate a CSRF token
 */
function generateCSRFToken(sessionId) {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    if (!csrfTokens.has(sessionId)) {
        csrfTokens.set(sessionId, new Set());
    }
    csrfTokens.get(sessionId).add(token);
    // Clean up expired tokens after 15 minutes
    setTimeout(() => {
        const tokens = csrfTokens.get(sessionId);
        if (tokens) {
            tokens.delete(token);
            if (tokens.size === 0) {
                csrfTokens.delete(sessionId);
            }
        }
    }, TOKEN_EXPIRY);
    return token;
}
/**
 * Validate CSRF token
 */
function validateCSRFToken(sessionId, token) {
    const tokens = csrfTokens.get(sessionId);
    if (!tokens)
        return false;
    const isValid = tokens.has(token);
    // Token is single-use, delete after validation
    if (isValid) {
        tokens.delete(token);
    }
    return isValid;
}
/**
 * Middleware to generate CSRF token
 */
function csrfProtection(req, res, next) {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        next();
        return;
    }
    // Get session ID from authorization header (JWT token) or create one
    const authHeader = req.headers.authorization;
    const sessionId = authHeader ? authHeader.split(' ')[1] : req.ip || 'anonymous';
    // Validate CSRF token
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!token) {
        res.status(403).json({
            success: false,
            message: 'CSRF token missing'
        });
        return;
    }
    if (!validateCSRFToken(sessionId, token)) {
        res.status(403).json({
            success: false,
            message: 'Invalid CSRF token'
        });
        return;
    }
    next();
}
/**
 * Endpoint to get CSRF token
 */
function getCSRFToken(req, res) {
    const authHeader = req.headers.authorization;
    const sessionId = authHeader ? authHeader.split(' ')[1] : req.ip || 'anonymous';
    const token = generateCSRFToken(sessionId);
    res.json({
        success: true,
        csrfToken: token
    });
}
//# sourceMappingURL=csrf.js.map
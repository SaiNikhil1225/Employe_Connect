/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting the number of requests from a single IP
 * Uses express-rate-limit's default IP detection which properly handles IPv4 and IPv6
 */
/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 * Note: Uses default IP-based limiting (handles IPv6 correctly)
 */
export declare const generalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes to prevent brute force attacks
 * Uses IP-based limiting (IPv4 and IPv6 compatible)
 */
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for ticket creation
 * 10 tickets per hour per IP to prevent spam
 */
export declare const ticketCreationRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for message/comment posting
 * 30 messages per 10 minutes to prevent spam
 */
export declare const messageRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for file uploads
 * 20 uploads per hour per IP
 */
export declare const uploadRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limiter for search/query endpoints
 * 100 searches per 10 minutes per IP
 */
export declare const searchRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for admin operations
 * 50 requests per 10 minutes per IP
 */
export declare const adminRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map
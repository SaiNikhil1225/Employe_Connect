import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  employeeId?: string; // Optional: Employee ID like "EMP001"
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    console.log('🔐 Auth Middleware Debug:');
    console.log('  Path:', req.method, req.path);
    console.log('  Auth Header:', authHeader ? 'Present' : 'Missing');
    console.log('  Token:', token ? `${token.substring(0, 20)}...` : 'None');

    if (!token) {
      console.log('  ❌ No token provided');
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log('  ✅ Token decoded successfully');
    console.log('  User:', JSON.stringify(decoded, null, 2));
    req.user = decoded;
    next();
  } catch (error: any) {
    console.log('  ❌ Token verification failed:', error.message);
    console.log('  Error type:', error.name);
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
      return;
    }

    next();
  };
};

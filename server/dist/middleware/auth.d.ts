import { Request, Response, NextFunction } from 'express';
interface JwtPayload {
    id: string;
    email: string;
    role: string;
    employeeId?: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorizeRoles: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=auth.d.ts.map
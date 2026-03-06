import { Request, Response } from 'express';
export declare const startPIP: (req: Request, res: Response) => Promise<void>;
export declare const getEmployeePIPs: (req: Request, res: Response) => Promise<void>;
export declare const getActivePIPCount: (_req: Request, res: Response) => Promise<void>;
export declare const getAllPIPs: (req: Request, res: Response) => Promise<void>;
export declare const acknowledgePIP: (req: Request, res: Response) => Promise<void>;
export declare const updatePIPStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=pipController.d.ts.map
import type { Request, Response } from 'express';
export declare const getFinancialLines: (req: Request, res: Response) => Promise<void>;
export declare const getActiveFinancialLines: (req: Request, res: Response) => Promise<void>;
export declare const getFinancialLineById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createFinancialLine: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateFinancialLine: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteFinancialLine: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFinancialLineStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=financialLineController.d.ts.map
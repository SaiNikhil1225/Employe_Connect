import type { Request, Response } from 'express';
export declare const getCustomerPOs: (req: Request, res: Response) => Promise<void>;
export declare const getActiveCustomerPOs: (req: Request, res: Response) => Promise<void>;
export declare const getCustomerPOById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCustomerPO: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCustomerPO: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCustomerPO: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCustomerPOStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=customerPOController.d.ts.map
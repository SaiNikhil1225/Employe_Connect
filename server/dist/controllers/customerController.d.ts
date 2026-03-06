import { Request, Response } from 'express';
export declare const getCustomers: (req: Request, res: Response) => Promise<void>;
export declare const getCustomerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCustomerStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=customerController.d.ts.map
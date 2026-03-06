import { Response } from 'express';
export interface EmployeeRow {
    legalEntity: string;
    location: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    password?: string;
    gender: string;
    dateOfBirth: Date;
    panNumber?: string;
    fullNameAsPerPAN?: string;
    designation: string;
    department: string;
    subDepartment?: string;
    businessUnit: string;
    hireType: string;
    workerType: string;
    dateOfJoining: Date;
    contractDuration?: string;
    contractEndDate?: Date;
    leavePlan: string;
    holidayPlan: string;
    workPhone?: string;
    residenceNumber?: string;
    personalEmail?: string;
    maritalStatus?: string;
    marriageDate?: Date;
    fatherName?: string;
    motherName?: string;
    spouseName?: string;
    spouseGender?: string;
    physicallyHandicapped?: string;
    bloodGroup?: string;
    nationality?: string;
    salaryPaymentMode?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    nameOnAccount?: string;
    branch?: string;
}
export declare class ExcelService {
    generateTemplate(res: Response): Promise<void>;
    parseExcelFile(buffer: Buffer): Promise<EmployeeRow[]>;
}
export declare const excelService: ExcelService;
//# sourceMappingURL=excelService.d.ts.map
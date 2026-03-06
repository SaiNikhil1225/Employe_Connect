/**
 * Utility functions to transform between week-based and date-based timesheet formats
 */
interface TimesheetRow {
    projectId: string;
    projectCode: string;
    projectName: string;
    udaId: string;
    udaName: string;
    type: string;
    financialLineItem: string;
    billable: string;
    hours: (string | null)[];
    comments: (string | null)[];
}
/**
 * Convert week-based rows to date-based entries
 * @param employeeId Employee identifier
 * @param employeeName Employee name
 * @param weekStart Monday of the week (Date object)
 * @param rows Array of timesheet rows (week format)
 * @returns Array of date-based entries
 */
export declare function weekRowsToDateEntries(employeeId: string, employeeName: string, weekStart: Date, rows: TimesheetRow[]): any[];
/**
 * Convert date-based entries to week-based rows
 * @param weekStart Monday of the week (Date object)
 * @param entries Array of date-based entries
 * @returns Array of timesheet rows (week format)
 */
export declare function dateEntriesToWeekRows(weekStart: Date, entries: any[]): TimesheetRow[];
/**
 * Calculate total hours from entries
 * @param entries Array of date-based entries
 * @returns Total hours as number
 */
export declare function calculateTotalHours(entries: any[]): number;
/**
 * Determine overall status from entries
 * @param entries Array of date-based entries
 * @returns Overall status string
 */
export declare function determineOverallStatus(entries: any[]): string;
export {};
//# sourceMappingURL=timesheetTransformers.d.ts.map
import { ITimesheetEntry } from '../models/TimesheetEntry';

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
export function weekRowsToDateEntries(
    employeeId: string,
    employeeName: string,
    weekStart: Date,
    rows: TimesheetRow[]
): any[] {
    const entries: any[] = [];

    rows.forEach(row => {
        row.hours.forEach((hours, dayIndex) => {
            // Skip empty or zero hours
            if (!hours || hours === '0:00' || hours === '00:00' || hours.trim() === '') {
                return;
            }

            // Calculate date for this day
            const date = new Date(weekStart);
            date.setDate(date.getDate() + dayIndex);
            date.setHours(0, 0, 0, 0);

            // Get comment for this day
            const comment = row.comments?.[dayIndex] || null;

            entries.push({
                employeeId,
                employeeName,
                date,
                projectId: row.projectId,
                projectCode: row.projectCode,
                projectName: row.projectName,
                udaId: row.udaId,
                udaName: row.udaName,
                type: row.type,
                financialLineItem: row.financialLineItem,
                billable: row.billable,
                hours,
                comment,
                status: 'submitted',
                submittedAt: new Date(),
                approvalStatus: 'pending'
            });
        });
    });

    return entries;
}

/**
 * Convert date-based entries to week-based rows
 * @param weekStart Monday of the week (Date object)
 * @param entries Array of date-based entries
 * @returns Array of timesheet rows (week format)
 */
export function dateEntriesToWeekRows(
    weekStart: Date,
    entries: any[]
): TimesheetRow[] {
    // Group entries by project + UDA combination
    const rowMap = new Map<string, TimesheetRow>();

    entries.forEach(entry => {
        const key = `${entry.projectId}|${entry.udaId}`;

        if (!rowMap.has(key)) {
            // Initialize new row with 7 days of empty hours and comments
            rowMap.set(key, {
                projectId: entry.projectId,
                projectCode: entry.projectCode,
                projectName: entry.projectName,
                udaId: entry.udaId,
                udaName: entry.udaName,
                type: entry.type,
                financialLineItem: entry.financialLineItem,
                billable: entry.billable,
                hours: new Array(7).fill('0:00'),
                comments: new Array(7).fill(null)
            });
        }

        const row = rowMap.get(key)!;

        // Calculate which day of the week this entry is for
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        const weekStartCopy = new Date(weekStart);
        weekStartCopy.setHours(0, 0, 0, 0);

        const dayIndex = Math.floor(
            (entryDate.getTime() - weekStartCopy.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayIndex >= 0 && dayIndex < 7) {
            row.hours[dayIndex] = entry.hours;
            row.comments[dayIndex] = entry.comment;
        }
    });

    return Array.from(rowMap.values());
}

/**
 * Calculate total hours from entries
 * @param entries Array of date-based entries
 * @returns Total hours as number
 */
export function calculateTotalHours(entries: any[]): number {
    let total = 0;

    entries.forEach(entry => {
        if (!entry.hours || entry.hours === '0:00' || entry.hours === '00:00') {
            return;
        }

        const [hours, minutes] = entry.hours.split(':').map(Number);
        total += hours + (minutes / 60);
    });

    return Math.round(total * 100) / 100; // Round to 2 decimal places
}

/**
 * Determine overall status from entries
 * @param entries Array of date-based entries
 * @returns Overall status string
 */
export function determineOverallStatus(entries: any[]): string {
    if (entries.length === 0) {
        return 'draft';
    }

    // Check if all are approved
    const allApproved = entries.every(e => e.approvalStatus === 'approved');
    if (allApproved) {
        return 'approved';
    }

    // Check if any are rejected
    const anyRejected = entries.some(e => e.approvalStatus === 'rejected');
    if (anyRejected) {
        return 'rejected';
    }

    // Check if any need revision
    const anyRevision = entries.some(e => e.approvalStatus === 'revision_requested');
    if (anyRevision) {
        return 'revision_requested';
    }

    // Otherwise, it's submitted and pending
    return 'submitted';
}

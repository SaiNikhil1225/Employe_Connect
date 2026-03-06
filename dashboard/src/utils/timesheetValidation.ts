/**
 * Validates and formats a time string in HH:mm format.
 * Returns the formatted string if valid, or null if invalid.
 */
export const validateAndFormatTime = (value: string): string | null => {
    if (!value) return "00:00";

    if (value.includes(":")) {
        const parts = value.split(":");
        if (parts.length === 2) {
            let hours = parts[0].replace(/^0+/, "") || "0";
            let minutes = parts[1].padEnd(2, "0").substring(0, 2);

            let hoursNum = parseInt(hours, 10);
            let minutesNum = parseInt(minutes, 10);

            if (isNaN(hoursNum) || isNaN(minutesNum) || minutesNum >= 60) {
                return null; // Invalid time
            }

            return `${hoursNum.toString().padStart(2, '0')}:${minutesNum.toString().padStart(2, '0')}`;
        }
    } else if (/^\d+$/.test(value)) {
        const hoursNum = parseInt(value, 10);
        if (!isNaN(hoursNum)) {
            return `${hoursNum.toString().padStart(2, '0')}:00`;
        }
    }

    return null;
};

/**
 * Calculates the total decimal hours for a day from row's hours.
 */
export const calculateTotalDayHours = (rows: any[], dayIdx: number): number => {
    return rows.reduce((sum, row) => {
        const val = row.hours[dayIdx] || "00:00";
        const [h, m] = val.split(":").map((v: string) => parseInt(v) || 0);
        return sum + h + m / 60;
    }, 0);
};

/**
 * Validates that total hours for a specific day do not exceed the maximum allowed hours.
 * @param rows - Array of timesheet rows
 * @param dayIdx - Index of the day (0-6 for Mon-Sun)
 * @param maxHours - Maximum hours allowed per day (default: 8)
 * @returns Object with isValid flag and total hours
 */
export const validateDailyHours = (
    rows: any[], 
    dayIdx: number, 
    maxHours: number = 8
): { isValid: boolean; totalHours: number; message?: string } => {
    const totalHours = calculateTotalDayHours(rows, dayIdx);
    
    if (totalHours > maxHours) {
        return {
            isValid: false,
            totalHours,
            message: `Total hours for this day (${totalHours.toFixed(2)}h) exceed the maximum allowed (${maxHours}h)`
        };
    }
    
    return {
        isValid: true,
        totalHours
    };
};

/**
 * Validates hours for all days in a week.
 * @param rows - Array of timesheet rows
 * @param maxHoursPerDay - Maximum hours allowed per day (default: 8)
 * @returns Array of validation results for each day
 */
export const validateWeeklyHours = (
    rows: any[], 
    maxHoursPerDay: number = 8
): Array<{ dayIdx: number; isValid: boolean; totalHours: number; message?: string }> => {
    const validationResults = [];
    
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const result = validateDailyHours(rows, dayIdx, maxHoursPerDay);
        validationResults.push({
            dayIdx,
            ...result
        });
    }
    
    return validationResults;
};

/**
 * Checks if projects have expired.
 */
export const isProjectExpired = (projectEndDate: string | Date | undefined): boolean => {
    if (!projectEndDate) return false;
    const endDate = new Date(projectEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate < today;
};

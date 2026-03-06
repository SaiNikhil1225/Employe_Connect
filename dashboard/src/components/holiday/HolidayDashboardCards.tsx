import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, BarChart3, Clock } from 'lucide-react';
import type { Holiday } from '@/types/holiday';
import { format, getDay } from 'date-fns';

interface HolidayDashboardCardsProps {
    holidays: Holiday[];
    selectedYear: number | 'all';
    selectedGroup: string;
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function HolidayDashboardCards({
    holidays,
    selectedYear,
    selectedGroup,
}: HolidayDashboardCardsProps) {
    // Calculate statistics based on filtered holidays
    const stats = useMemo(() => {
        // Total holidays
        const total = holidays.length;

        // Holiday type distribution
        const typeDistribution: Record<string, number> = {};
        holidays.forEach(holiday => {
            const typeName = typeof holiday.typeId === 'object' ? holiday.typeId.name : 'Unknown';
            typeDistribution[typeName] = (typeDistribution[typeName] || 0) + 1;
        });

        // Monthly pattern (only months with holidays)
        const monthlyPattern: Record<string, number> = {};
        holidays.forEach(holiday => {
            const date = new Date(holiday.date);
            const monthIndex = date.getMonth();
            const monthName = MONTH_NAMES[monthIndex];
            monthlyPattern[monthName] = (monthlyPattern[monthName] || 0) + 1;
        });

        // Weekly pattern
        const weeklyPattern: Record<string, number> = {};
        holidays.forEach(holiday => {
            const date = new Date(holiday.date);
            const dayIndex = getDay(date);
            const dayName = WEEKDAY_NAMES[dayIndex];
            weeklyPattern[dayName] = (weeklyPattern[dayName] || 0) + 1;
        });

        return {
            total,
            typeDistribution,
            monthlyPattern,
            weeklyPattern,
        };
    }, [holidays]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Card 1: Total Holidays */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Holidays</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {selectedYear === 'all' ? 'All years' : `Year ${selectedYear}`}
                        {selectedGroup !== 'all' && ' • Filtered by group'}
                    </p>
                </CardContent>
            </Card>

            {/* Card 2: Holiday Type Distribution */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Holiday Type</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                        {Object.entries(stats.typeDistribution).length === 0 ? (
                            <p className="text-sm text-muted-foreground col-span-4">No data</p>
                        ) : (
                            Object.entries(stats.typeDistribution)
                                .sort((a, b) => b[1] - a[1])
                                .map(([type, count]) => (
                                    <div key={type} className="text-center">
                                        <div className="text-xs font-medium text-muted-foreground truncate" title={type}>
                                            {type.length > 10 ? type.substring(0, 10) + '...' : type}
                                        </div>
                                        <div className="text-lg font-bold">{count}</div>
                                    </div>
                                ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Monthly Pattern */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Pattern</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                        {Object.entries(stats.monthlyPattern).length === 0 ? (
                            <p className="text-sm text-muted-foreground col-span-4">No data</p>
                        ) : (
                            Object.entries(stats.monthlyPattern)
                                .sort((a, b) => {
                                    // Sort by month order, not alphabetically
                                    return MONTH_NAMES.indexOf(a[0]) - MONTH_NAMES.indexOf(b[0]);
                                })
                                .map(([month, count]) => (
                                    <div key={month} className="text-center">
                                        <div className="text-xs font-medium text-muted-foreground">{month}</div>
                                        <div className="text-lg font-bold">{count}</div>
                                    </div>
                                ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Card 4: Weekly Pattern */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weekly Pattern</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                        {Object.entries(stats.weeklyPattern).length === 0 ? (
                            <p className="text-sm text-muted-foreground col-span-4">No data</p>
                        ) : (
                            Object.entries(stats.weeklyPattern)
                                .sort((a, b) => {
                                    // Sort by weekday order
                                    return WEEKDAY_NAMES.indexOf(a[0]) - WEEKDAY_NAMES.indexOf(b[0]);
                                })
                                .map(([day, count]) => (
                                    <div key={day} className="text-center">
                                        <div className="text-xs font-medium text-muted-foreground">{day.substring(0, 3)}</div>
                                        <div className="text-lg font-bold">{count}</div>
                                    </div>
                                ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

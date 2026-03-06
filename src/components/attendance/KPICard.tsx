import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    iconColor?: string;
    iconBgColor?: string;
    valueColor?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    loading?: boolean;
}

export function KPICard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = 'text-blue-600',
    iconBgColor = 'bg-blue-100 dark:bg-blue-900/30',
    valueColor = 'text-gray-900 dark:text-white',
    trend,
    className = '',
    loading = false
}: KPICardProps) {
    return (
        <Card className={cn('hover:shadow-md transition-shadow rounded-xl shadow-sm', className)}>
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {Icon && (
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', iconBgColor)}>
                        <Icon className={cn('h-4 w-4', iconColor)} />
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {loading ? (
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                ) : (
                    <>
                        <div className={cn('text-2xl font-bold', valueColor)}>
                            {value}
                        </div>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                        )}
                        {trend && (
                            <div className={cn(
                                'text-xs mt-1 flex items-center gap-1',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}>
                                <span>{trend.isPositive ? '↑' : '↓'}</span>
                                <span>{Math.abs(trend.value)}%</span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RightDrawerProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
    width?: 'sm' | 'md' | 'lg' | 'xl';
}

const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
};

export function RightDrawer({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    className = '',
    width = 'md'
}: RightDrawerProps) {
    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity" style={{ marginTop: '0px' }}
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={cn(
                    'fixed inset-y-0 right-0 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col',
                    widthClasses[width],
                    open ? 'translate-x-0' : 'translate-x-full',
                    className
                )}
                style={{ width: '100%', marginTop: '0px' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b">
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 -mr-2"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 p-6">
                    {children}
                </ScrollArea>

                {/* Footer */}
                {footer && (
                    <div className="border-t p-6 bg-gray-50 dark:bg-gray-800">
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
}

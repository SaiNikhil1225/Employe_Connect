import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { RightDrawer } from '@/components/ui/right-drawer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Upload, Info, Send, X as XIcon, Search, Bell, CheckCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';

interface WFHRequestDrawerProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: WFHRequestData) => Promise<void>;
}

export interface WFHRequestData {
    fromDate: string;
    toDate: string;
    reason: string;
    attachment?: File;
    notifyEmployees?: string[];
}

export function WFHRequestDrawer({ open, onClose, onSubmit }: WFHRequestDrawerProps) {
    const { user } = useAuthStore();
    const { activeEmployees, fetchActiveEmployees } = useEmployeeStore();
    const [fromDate, setFromDate] = useState<Date>();
    const [toDate, setToDate] = useState<Date>();
    const [reason, setReason] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [notifyEmployees, setNotifyEmployees] = useState<Array<{ id: string; name: string; email: string }>>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPeoplePicker, setShowPeoplePicker] = useState(false);
    const peoplePickerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [daysCount, setDaysCount] = useState(0);

    // Fetch employees on mount
    useEffect(() => {
        fetchActiveEmployees();
    }, [fetchActiveEmployees]);

    // Close people picker on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (peoplePickerRef.current && !peoplePickerRef.current.contains(event.target as Node)) {
                setShowPeoplePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter employees based on search
    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) {
            // Show first 10 active employees
            return activeEmployees
                .filter(emp => emp.employeeId !== user?.employeeId && emp.status === 'active')
                .slice(0, 10);
        }
        const query = searchQuery.toLowerCase();
        return activeEmployees.filter(emp =>
            emp.employeeId !== user?.employeeId &&
            emp.status === 'active' &&
            (emp.name.toLowerCase().includes(query) ||
                emp.department.toLowerCase().includes(query) ||
                emp.employeeId.toLowerCase().includes(query))
        ).slice(0, 10);
    }, [activeEmployees, searchQuery, user]);

    // Auto-select current employee by default
    useEffect(() => {
        if (user && notifyEmployees.length === 0 && open) {
            setNotifyEmployees([{ id: user.employeeId, name: user.name, email: user.email }]);
        }
    }, [user, open]);

    // Calculate days count
    useEffect(() => {
        if (fromDate && toDate) {
            const days = differenceInDays(toDate, fromDate) + 1; // Include both start and end dates
            setDaysCount(days > 0 ? days : 0);
        } else if (fromDate) {
            setDaysCount(1);
        } else {
            setDaysCount(0);
        }
    }, [fromDate, toDate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setAttachment(file);
        }
    };

    const removeAttachment = useCallback(() => {
        setAttachment(null);
    }, []);

    const resetForm = useCallback(() => {
        setFromDate(undefined);
        setToDate(undefined);
        setReason('');
        setAttachment(null);
        setNotifyEmployees(user ? [{ id: user.employeeId, name: user.name, email: user.email }] : []);
        setSearchQuery('');
        setDaysCount(0);
    }, [user]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!fromDate) {
            toast.error('Please select start date');
            return;
        }

        if (!reason.trim()) {
            toast.error('Please provide a reason');
            return;
        }

        if (reason.trim().length < 10) {
            toast.error('Reason must be at least 10 characters');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                fromDate: format(fromDate, 'yyyy-MM-dd'),
                toDate: toDate ? format(toDate, 'yyyy-MM-dd') : format(fromDate, 'yyyy-MM-dd'),
                reason: reason.trim(),
                attachment: attachment || undefined,
                notifyEmployees: notifyEmployees.map(p => p.id)
            });

            resetForm();
            onClose();
            toast.success('WFH request submitted successfully');
        } catch (error) {
            toast.error('Failed to submit WFH request');
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, reason, attachment, notifyEmployees, onSubmit, onClose, resetForm]);

    const handleCancel = useCallback(() => {
        resetForm();
        onClose();
    }, [onClose, resetForm]);

    // Helper to add/remove people from notify list
    const toggleNotifyPerson = (employee: { employeeId: string; name: string; email: string }) => {
        const exists = notifyEmployees.find(p => p.id === employee.employeeId);
        if (exists) {
            setNotifyEmployees(prev => prev.filter(p => p.id !== employee.employeeId));
        } else {
            setNotifyEmployees(prev => [...prev, { id: employee.employeeId, name: employee.name, email: employee.email }]);
        }
    };

    const footer = useMemo(() => (
        <div className="flex gap-3">
            <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
            >
                Cancel
            </Button>
            <Button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !fromDate || !reason.trim()}
                className="flex-1"
            >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
        </div>
    ), [loading, fromDate, reason, handleCancel, handleSubmit]);

    return (
        <RightDrawer
            open={open}
            onClose={handleCancel}
            title="Work From Home Request"
            description="Submit your WFH request for manager approval"
            footer={footer}
            width="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Policy Info Banner */}
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>WFH Policy:</strong> Requests must be submitted at least 24 hours in advance.
                        Maximum 2 WFH days per week. Requires manager approval.
                    </AlertDescription>
                </Alert>

                {/* From Date */}
                <div className="space-y-2">
                    <Label htmlFor="fromDate" className="text-sm font-medium">
                        From Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal h-10',
                                    !fromDate && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {fromDate ? format(fromDate, 'PPP') : <span>Select start date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                selected={fromDate}
                                onSelect={setFromDate}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* To Date */}
                <div className="space-y-2">
                    <Label htmlFor="toDate" className="text-sm font-medium">
                        To Date <span className="text-xs text-muted-foreground">(Optional - for multiple days)</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal h-10',
                                    !toDate && 'text-muted-foreground'
                                )}
                                disabled={!fromDate}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {toDate ? format(toDate, 'PPP') : <span>Select end date (optional)</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                selected={toDate}
                                onSelect={setToDate}
                                disabled={(date) => !fromDate || date < fromDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Days Count Display */}
                {daysCount > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Total Days:
                            </span>
                            <span className="text-lg font-bold text-primary">
                                {daysCount} {daysCount === 1 ? 'day' : 'days'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-medium">
                        Reason <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="reason"
                        placeholder="Please provide a detailed reason for your WFH request (minimum 10 characters)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="resize-none"
                        maxLength={500}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{reason.length < 10 ? `Minimum 10 characters (${10 - reason.length} more)` : 'Valid'}</span>
                        <span>{reason.length}/500</span>
                    </div>
                </div>

                {/* File Attachment */}
                <div className="space-y-2">
                    <Label htmlFor="attachment" className="text-sm font-medium">
                        Attachment <span className="text-xs text-muted-foreground">(Optional - Max 5MB)</span>
                    </Label>
                    {!attachment ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <span className="text-sm text-primary hover:underline">Click to upload</span>
                                <span className="text-xs text-muted-foreground block mt-1">
                                    PDF, DOC, DOCX, PNG, JPG (Max 5MB)
                                </span>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-1">
                                <p className="text-sm font-medium">{attachment.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(attachment.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={removeAttachment}
                                className="h-8 w-8"
                            >
                                <XIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Notify Employees */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notify <span className="text-xs font-normal">(Optional)</span>
                    </Label>

                    <div ref={peoplePickerRef} className="relative">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search people to notify..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowPeoplePicker(true)}
                                className="pl-9"
                            />
                        </div>

                        {/* Dropdown */}
                        {showPeoplePicker && filteredEmployees.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredEmployees.map((emp) => {
                                    const isSelected = notifyEmployees.some(p => p.id === emp.employeeId);
                                    return (
                                        <div
                                            key={emp.employeeId}
                                            onClick={() => toggleNotifyPerson(emp)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted transition-colors",
                                                isSelected && "bg-primary/5"
                                            )}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                                                {emp.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{emp.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{emp.department}</p>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Selected People Chips */}
                        {notifyEmployees.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {notifyEmployees.map((person) => (
                                    <Badge
                                        key={person.id}
                                        variant="secondary"
                                        className="pl-2 pr-1 py-1 flex items-center gap-1.5"
                                    >
                                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-semibold">
                                            {person.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <span className="text-xs">{person.name.split(' ')[0]}</span>
                                        <button
                                            type="button"
                                            onClick={() => setNotifyEmployees(prev => prev.filter(p => p.id !== person.id))}
                                            className="h-4 w-4 rounded-full hover:bg-muted-foreground/20 flex items-center justify-center"
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </RightDrawer>
    );
}

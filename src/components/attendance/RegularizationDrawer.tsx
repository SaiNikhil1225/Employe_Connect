import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RightDrawer } from '@/components/ui/right-drawer';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface RegularizationDrawerProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: RegularizationData) => Promise<void>;
    prefilledDate?: Date;
}

export interface RegularizationData {
    date: string;
    reason: string;
}

export function RegularizationDrawer({ open, onClose, onSubmit, prefilledDate }: RegularizationDrawerProps) {
    const [date, setDate] = useState<Date | undefined>(prefilledDate);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    // Update date when prefilledDate changes
    useEffect(() => {
        if (prefilledDate) {
            setDate(prefilledDate);
        }
    }, [prefilledDate]);

    const resetForm = useCallback(() => {
        setDate(undefined);
        setNote('');
    }, []);

    const handleSubmit = useCallback(async () => {
        // Validation
        if (!date) {
            toast.error('Date is required');
            return;
        }

        if (!note.trim()) {
            toast.error('Please provide a note');
            return;
        }

        if (note.trim().length < 10) {
            toast.error('Note must be at least 10 characters');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                date: format(date, 'yyyy-MM-dd'),
                reason: note.trim(),
            });

            toast.success('Regularization request submitted successfully');
            resetForm();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit regularization request');
        } finally {
            setLoading(false);
        }
    }, [date, note, onSubmit, onClose, resetForm]);

    const handleCancel = useCallback(() => {
        resetForm();
        onClose();
    }, [onClose, resetForm]);

    const footer = useMemo(() => (
        <div className="flex gap-3 justify-end">
            <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
            >
                Cancel
            </Button>
            <Button
                onClick={handleSubmit}
                disabled={loading || !date || !note}
            >
                {loading ? 'Requesting...' : 'Request'}
            </Button>
        </div>
    ), [loading, date, note, handleCancel, handleSubmit]);

    return (
        <RightDrawer
            open={open}
            onClose={handleCancel}
            title="Request Attendance Regularization"
            footer={footer}
            width="md"
        >
            <div className="space-y-6">
                {/* Date Field (Disabled) */}
                <div className="space-y-2">
                    <Label htmlFor="date">Selected Date</Label>
                    <Input
                        id="date"
                        value={date ? format(date, 'dd MMM yyyy') : ''}
                        disabled
                        className="bg-gray-50 cursor-not-allowed text-base"
                    />
                </div>

                {/* Radio Option - Display Only */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center h-5">
                        <div className="w-4 h-4 rounded-full border-4 border-blue-600 bg-white"></div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Raise regularization request to exempt this day from penalization policy.
                    </p>
                </div>

                {/* Note Field */}
                <div className="space-y-2">
                    <Label htmlFor="note">Note</Label>
                    <Textarea
                        id="note"
                        placeholder="Enter note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={6}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        Minimum 10 characters required
                    </p>
                </div>
            </div>
        </RightDrawer>
    );
}

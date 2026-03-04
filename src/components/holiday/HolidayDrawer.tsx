import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetBody,
    SheetCloseButton,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';
import { DatePicker } from '@/components/ui/date-picker';
import { Calendar, Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { createHoliday, updateHoliday } from '@/services/holidayService';
import type { Holiday, HolidayType, ObservanceType, HolidayGroup } from '@/types/holiday';

interface HolidayDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    holiday?: Holiday | null;
    holidayTypes: HolidayType[];
    observanceTypes: ObservanceType[]; // Still needed in props for type compatibility
    holidayGroups: HolidayGroup[];
    onSuccess?: () => void;
}

export function HolidayDrawer({
    open,
    onOpenChange,
    holiday,
    holidayTypes,
    observanceTypes,
    holidayGroups,
    onSuccess,
}: HolidayDrawerProps) {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        typeId: '',
        observanceTypeId: '',
        groupIds: [] as string[],
        notes: '',
        imageUrl: '',
        status: 'DRAFT' as 'DRAFT' | 'ACTIVE',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [saving, setSaving] = useState(false);

    // Helper to extract UTC date without timezone conversion
    const getUTCDateString = (dateValue: string | Date): string => {
        if (typeof dateValue === 'string') {
            // If already a string, extract date portion
            return dateValue.split('T')[0];
        }
        // If it's a Date object, get UTC date components
        const date = new Date(dateValue);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Reset form when drawer opens/closes or holiday changes
    useEffect(() => {
        if (open && holiday) {
            // Edit mode
            setFormData({
                name: holiday.name,
                date: getUTCDateString(holiday.date),
                typeId: typeof holiday.typeId === 'object' ? holiday.typeId._id : holiday.typeId,
                observanceTypeId: typeof holiday.observanceTypeId === 'object' ? holiday.observanceTypeId._id : holiday.observanceTypeId,
                groupIds: holiday.groupIds ? holiday.groupIds.map(g => typeof g === 'object' ? g._id : g) : [],
                notes: holiday.notes || '',
                imageUrl: holiday.imageUrl || '',
                status: (holiday.status === 'PUBLISHED' ? 'ACTIVE' : 'DRAFT') as 'DRAFT' | 'ACTIVE',
            });
            setImagePreview(holiday.imageUrl || '');
            setImageFile(null);
        } else if (open) {
            // Add mode - Set default observanceTypeId from first available option
            const defaultObservanceTypeId = observanceTypes.find(t => t.isActive)?._id || '';
            setFormData({
                name: '',
                date: '',
                typeId: '',
                observanceTypeId: defaultObservanceTypeId,
                groupIds: [],
                notes: '',
                imageUrl: '',
                status: 'DRAFT',
            });
            setImagePreview('');
            setImageFile(null);
        }
    }, [open, holiday, observanceTypes]);

    const handleSave = async (publishNow: boolean) => {
        // Validation
        if (!formData.name.trim()) {
            toast.error('Holiday name is required');
            return;
        }
        if (!formData.date) {
            toast.error('Date is required');
            return;
        }
        if (!formData.typeId) {
            toast.error('Holiday type is required');
            return;
        }

        setSaving(true);
        try {
            // Convert image file to base64 if present
            let imageUrlToSave = formData.imageUrl;
            if (imageFile) {
                const reader = new FileReader();
                imageUrlToSave = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(imageFile);
                });
            }

            const payload: any = {
                name: formData.name,
                date: formData.date,
                typeId: formData.typeId,
                observanceTypeId: formData.observanceTypeId,
                notes: formData.notes,
                imageUrl: imageUrlToSave || undefined,
                status: publishNow ? 'ACTIVE' : 'DRAFT',
                // Group-based assignment
                isGlobal: formData.groupIds.length === 0,
            };

            // If groups are selected, use the first one (backend expects single groupId)
            // In future, enhance backend to support multiple groups
            if (formData.groupIds.length > 0) {
                payload.groupId = formData.groupIds[0];
            }

            if (holiday?._id) {
                await updateHoliday(holiday._id, payload);
                toast.success(`Holiday ${publishNow ? 'published' : 'saved as draft'} successfully`);
            } else {
                await createHoliday(payload);
                toast.success(`Holiday ${publishNow ? 'published' : 'saved as draft'} successfully`);
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to save holiday:', error);
            toast.error(error.response?.data?.message || 'Failed to save holiday');
        } finally {
            setSaving(false);
        }
    };

    // Convert holiday groups to multi-select options
    const groupOptions: MultiSelectOption[] = holidayGroups
        .filter(g => g.isActive)
        .map(group => ({
            label: group.name,
            value: group._id,
        }));

    // Handle image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col h-full overflow-hidden w-full sm:max-w-xl p-0">
                {/* Fixed Header */}
                <SheetHeader>
                    <div className="flex-1">
                        <SheetTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {holiday ? 'Edit Holiday' : 'Add New Holiday'}
                        </SheetTitle>
                        <SheetDescription>
                            {holiday ? 'Update holiday details' : 'Create a new holiday entry'}
                        </SheetDescription>
                    </div>
                    <SheetCloseButton />
                </SheetHeader>

                {/* Scrollable Body */}
                <SheetBody>
                    <div className="space-y-6">
                    {/* Holiday Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Holiday Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Christmas Day"
                            disabled={saving}
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">
                            Date <span className="text-destructive">*</span>
                        </Label>
                        <DatePicker
                            value={formData.date}
                            onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                            placeholder="Select holiday date"
                            disabled={saving}
                        />
                    </div>

                    {/* Holiday Type */}
                    <div className="space-y-2">
                        <Label htmlFor="type">
                            Holiday Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={formData.typeId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, typeId: value }))}
                            disabled={saving}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select holiday type" />
                            </SelectTrigger>
                            <SelectContent>
                                {holidayTypes.filter(t => t.isActive).map(type => (
                                    <SelectItem key={type._id} value={type._id}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Groups (Multi-select) */}
                    <div className="space-y-2">
                        <Label htmlFor="groups">
                            Holiday Groups
                        </Label>
                        <MultiSelect
                            options={groupOptions}
                            selected={formData.groupIds}
                            onChange={(values) => setFormData(prev => ({ ...prev, groupIds: values }))}
                            placeholder="Select groups (leave empty for global)"

                        />
                        <p className="text-sm text-muted-foreground">
                            Leave empty to make this holiday available to all employees
                        </p>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="imageFile">
                            Holiday Image
                        </Label>
                        <div className="flex flex-col gap-2">
                            {!imagePreview ? (
                                <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors">
                                    <input
                                        id="imageFile"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={saving}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="imageFile"
                                        className="flex flex-col items-center gap-2 cursor-pointer"
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <div className="text-sm text-center">
                                            <span className="text-primary font-medium">Click to upload</span>
                                            <span className="text-muted-foreground"> or drag and drop</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG, GIF up to 2MB
                                        </p>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative border rounded-lg p-4">
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                        disabled={saving}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <img
                                        src={imagePreview}
                                        alt="Holiday preview"
                                        className="max-h-40 object-contain mx-auto"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes or instructions"
                            rows={3}
                            disabled={saving}
                        />
                    </div>
                    </div>
                </SheetBody>

                {/* Fixed Footer */}
                <SheetFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

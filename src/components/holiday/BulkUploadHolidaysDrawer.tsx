import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetBody,
    SheetFooter,
    SheetCloseButton,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Upload,
    Download,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle2,
    Loader2,
    X,
    FileUp
} from 'lucide-react';
import { toast } from 'sonner';
import { createHoliday } from '@/services/holidayService';
import type { HolidayType, ObservanceType, HolidayGroup } from '@/types/holiday';
import { cn } from '@/lib/utils';

// Helper function to convert Excel serial date to YYYY-MM-DD format
const excelSerialToDate = (serial: number): string => {
    // Excel dates: serial 1 = January 1, 1900
    // Excel incorrectly treats 1900 as a leap year
    // Days between Excel epoch (Dec 30, 1899) and Unix epoch (Jan 1, 1970) = 25569
    const excelEpochOffset = 25569;
    
    // For dates after Feb 28, 1900 (serial > 59), Excel has an extra day due to the leap year bug
    // We need to subtract 1 to correct for this
    const adjustedSerial = serial > 59 ? serial - 1 : serial;
    
    // Convert to days since Unix epoch
    const daysSinceUnixEpoch = adjustedSerial - excelEpochOffset;
    
    // Convert to milliseconds and create Date
    const timestamp = daysSinceUnixEpoch * 24 * 60 * 60 * 1000;
    const date = new Date(timestamp);
    
    // Add 1 day to fix the off-by-one error
    date.setUTCDate(date.getUTCDate() + 1);
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

// Helper function to parse date from various formats
const parseDate = (dateValue: unknown): string | null => {
    console.log('🔍 parseDate Input:', {
        value: dateValue,
        type: typeof dateValue,
        isDate: dateValue instanceof Date
    });

    if (!dateValue) return null;

    // If it's a number (Excel serial date)
    if (typeof dateValue === 'number') {
        const result = excelSerialToDate(dateValue);
        console.log('📊 Excel Serial:', dateValue, '→', result);
        return result;
    }

    // If it's a Date object (XLSX auto-converted it in local timezone)
    // Use LOCAL methods since XLSX created it with local date components
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        console.log('📅 Date Object:', {
            original: dateValue.toString(),
            iso: dateValue.toISOString(),
            localYear: dateValue.getFullYear(),
            localMonth: dateValue.getMonth() + 1,
            localDay: dateValue.getDate(),
            utcYear: dateValue.getUTCFullYear(),
            utcMonth: dateValue.getUTCMonth() + 1,
            utcDay: dateValue.getUTCDate()
        });
        
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        const result = `${year}-${month}-${day}`;
        
        console.log('✅ Using LOCAL methods:', result);
        return result;
    }

    // If it's a string
    if (typeof dateValue === 'string') {
        const trimmed = dateValue.trim();

        // Check if it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            console.log('✅ Already YYYY-MM-DD:', trimmed);
            return trimmed;
        }

        // Try to parse as a number (string representation of Excel serial)
        const asNumber = parseFloat(trimmed);
        if (!isNaN(asNumber)) {
            const result = excelSerialToDate(asNumber);
            console.log('📊 String as serial:', trimmed, '→', result);
            return result;
        }

        // Try to parse common date string formats manually to avoid timezone issues
        // Patterns: M/D/YYYY, MM/DD/YYYY, M-D-YYYY, MM-DD-YYYY, etc.
        const datePattern = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
        const match = trimmed.match(datePattern);
        if (match) {
            const month = match[1].padStart(2, '0');
            const day = match[2].padStart(2, '0');
            const year = match[3];
            const result = `${year}-${month}-${day}`;
            console.log('✅ Manual parse:', trimmed, '→', result);
            return result;
        }

        // Try ISO format parsing with explicit UTC
        // This handles formats like "2026-01-01" or ISO strings
        if (trimmed.includes('-') || trimmed.includes('T')) {
            const parsedDate = new Date(trimmed + (trimmed.includes('T') ? '' : 'T00:00:00.000Z'));
            if (!isNaN(parsedDate.getTime())) {
                const year = parsedDate.getUTCFullYear();
                const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
                const day = String(parsedDate.getUTCDate()).padStart(2, '0');
                const result = `${year}-${month}-${day}`;
                console.log('✅ ISO parse:', trimmed, '→', result);
                return result;
            }
        }
    }

    console.log('❌ Could not parse date:', dateValue);
    return null;
};

interface BulkUploadHolidaysDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    holidayTypes: HolidayType[];
    observanceTypes: ObservanceType[];
    holidayGroups: HolidayGroup[];
    onSuccess?: () => void;
}

interface ParsedHoliday {
    name: string;
    date: string;
    type: string;
    group?: string;
    description?: string;
    notes?: string;
}

export function BulkUploadHolidaysDrawer({
    open,
    onOpenChange,
    holidayTypes,
    observanceTypes,
    holidayGroups,
    onSuccess,
}: BulkUploadHolidaysDrawerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [parsedData, setParsedData] = useState<ParsedHoliday[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const downloadTemplate = () => {
        const templateData = [
            {
                Name: 'Christmas Day',
                Date: '2026-12-25',
                Type: 'Public',
                Group: 'Global',
                Description: 'Christmas celebration',
                Notes: 'Office closed',
            },
            {
                Name: 'New Year',
                Date: '2026-01-01',
                Type: 'Public',
                Group: '',
                Description: 'New Year celebration',
                Notes: 'Office closed',
            },
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Holidays');

        // Set column widths
        ws['!cols'] = [
            { wch: 25 }, // Name
            { wch: 12 }, // Date
            { wch: 15 }, // Type
            { wch: 20 }, // Group
            { wch: 30 }, // Description
            { wch: 30 }, // Notes
        ];

        XLSX.writeFile(wb, 'Holiday_Upload_Template.xlsx');
        toast.success('Template downloaded successfully');
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            validateAndParseFile(file);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            validateAndParseFile(file);
        }
    };

    const validateAndParseFile = (file: File) => {
        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];

        const isValidExtension = file.name.endsWith('.xlsx') ||
            file.name.endsWith('.xls') ||
            file.name.endsWith('.csv');

        if (!validTypes.includes(file.type) && !isValidExtension) {
            toast.error('Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file');
            return;
        }

        setSelectedFile(file);
        parseFile(file);
    };

    const parseFile = async (file: File) => {
        setIsProcessing(true);
        setValidationErrors([]);
        setParsedData([]);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (jsonData.length === 0) {
                toast.error('File is empty');
                setIsProcessing(false);
                return;
            }

            const errors: string[] = [];
            const holidays: ParsedHoliday[] = [];

            (jsonData as Record<string, unknown>[]).forEach((row, index: number) => {
                const rowNum = index + 2;

                const name = String(row.Name || row.name || '').trim();
                const dateValue = row.Date || row.date;
                const type = String(row.Type || row.type || '').trim();
                const group = String(row.Group || row.group || '').trim();

                console.log(`📝 Row ${rowNum} - Raw data:`, {
                    name,
                    dateValue,
                    dateType: typeof dateValue,
                    type,
                    group
                });

                // Validate required fields
                if (!name) {
                    errors.push(`Row ${rowNum}: Holiday name is required`);
                    return;
                }
                if (!dateValue) {
                    errors.push(`Row ${rowNum}: Date is required`);
                    return;
                }
                if (!type) {
                    errors.push(`Row ${rowNum}: Holiday type is required`);
                    return;
                }

                // Parse and validate date
                const date = parseDate(dateValue);
                console.log(`✨ Row ${rowNum} - Parsed date:`, date);
                
                if (!date) {
                    errors.push(`Row ${rowNum}: Invalid date format "${dateValue}". Use YYYY-MM-DD or Excel date format`);
                    return;
                }

                // Validate type exists
                const typeMatch = holidayTypes.find(
                    t => t.name.toLowerCase() === type.toLowerCase()
                );
                if (!typeMatch) {
                    errors.push(`Row ${rowNum}: Holiday type "${type}" not found`);
                    return;
                }

                // Validate group if provided
                if (group && group.toLowerCase() !== 'global') {
                    const groupMatch = holidayGroups.find(
                        g => g.name.toLowerCase() === group.toLowerCase()
                    );
                    if (!groupMatch) {
                        errors.push(`Row ${rowNum}: Group "${group}" not found`);
                        return;
                    }
                }

                holidays.push({
                    name,
                    date,
                    type,
                    group: group || '',
                    description: String(row.Description || row.description || '').trim(),
                    notes: String(row.Notes || row.notes || '').trim(),
                });
            });

            if (errors.length > 0) {
                setValidationErrors(errors);
                toast.error(`Found ${errors.length} validation error(s)`);
            } else {
                setParsedData(holidays);
                toast.success(`Successfully validated ${holidays.length} holiday(s)`);
            }
        } catch (error) {
            console.error('Failed to parse file:', error);
            toast.error('Failed to parse file. Please check the format.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) {
            toast.error('No valid data to upload');
            return;
        }

        if (observanceTypes.length === 0) {
            toast.error('No observance types found. Please configure observance types first.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < parsedData.length; i++) {
            const holiday = parsedData[i];
            const progress = Math.round(((i + 1) / parsedData.length) * 100);
            setUploadProgress(progress);

            try {
                // Find type ID
                const typeMatch = holidayTypes.find(
                    t => t.name.toLowerCase() === holiday.type.toLowerCase()
                );

                // Find group ID if specified
                let groupIds: string[] = [];
                if (holiday.group && holiday.group.toLowerCase() !== 'global') {
                    const groupMatch = holidayGroups.find(
                        g => g.name.toLowerCase() === holiday.group!.toLowerCase()
                    );
                    if (groupMatch) {
                        groupIds = [groupMatch._id];
                    }
                }

                const payload: any = {
                    name: holiday.name,
                    date: holiday.date,
                    typeId: typeMatch!._id,
                    observanceTypeId: observanceTypes[0]._id,
                    description: holiday.description || '',
                    notes: holiday.notes || '',
                    status: 'ACTIVE',
                    isGlobal: groupIds.length === 0,
                };

                if (groupIds.length > 0) {
                    payload.groupIds = groupIds;
                }

                console.log(`🚀 Uploading holiday #${i + 1}:`, {
                    name: payload.name,
                    date: payload.date,
                    dateType: typeof payload.date
                });

                await createHoliday(payload);
                successCount++;
            } catch (error: any) {
                errorCount++;
                const errorMsg = error.response?.data?.message || error.message || 'Failed to create';
                errors.push(`${holiday.name}: ${errorMsg}`);
                console.error(`Failed to create holiday ${holiday.name}:`, error);
            }
        }

        setIsUploading(false);
        setUploadProgress(100);

        if (successCount > 0) {
            toast.success(`Successfully uploaded ${successCount} holiday(s)`);
            setTimeout(() => {
                onOpenChange(false);
                onSuccess?.();
            }, 1000);
        }

        if (errorCount > 0) {
            toast.error(`Failed to upload ${errorCount} holiday(s)`);
            setValidationErrors(errors);
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            setParsedData([]);
            setValidationErrors([]);
            setSelectedFile(null);
            setUploadProgress(0);
            onOpenChange(false);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setParsedData([]);
        setValidationErrors([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="flex flex-col h-full w-full sm:max-w-2xl p-0">
                <SheetHeader>
                    <div className="flex-1">
                        <SheetTitle className="flex items-center gap-2">
                            <FileUp className="h-5 w-5" />
                            Bulk Upload Holidays
                        </SheetTitle>
                        <SheetDescription>
                            Upload multiple holidays at once using Excel or CSV file
                        </SheetDescription>
                    </div>
                    <SheetCloseButton />
                </SheetHeader>

                <SheetBody>
                    <div className="space-y-6">
                    {/* Download Template */}
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-8 w-8 text-primary" />
                            <div>
                                <p className="font-medium">Download Template</p>
                                <p className="text-sm text-muted-foreground">
                                    Get the Excel template to fill in your holiday data
                                </p>
                            </div>
                        </div>
                        <Button onClick={downloadTemplate} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>

                    {/* File Upload Area */}
                    {!selectedFile ? (
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                                "hover:border-primary hover:bg-primary/5 cursor-pointer"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium mb-2">
                                Drag and drop your file here
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                                or click to browse files
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supported formats: .xlsx, .xls, .csv
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                                    <div>
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </div>
                                {!isUploading && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeFile}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-3 text-sm text-muted-foreground">
                                Processing file...
                            </span>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Uploading holidays...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )}

                    {/* Success Summary */}
                    {parsedData.length > 0 && !isProcessing && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                Found {parsedData.length} valid holiday(s) ready to upload
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-medium mb-2">
                                    {validationErrors.length} error(s) found:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-sm max-h-48 overflow-y-auto">
                                    {validationErrors.slice(0, 10).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                    {validationErrors.length > 10 && (
                                        <li className="text-muted-foreground">
                                            ...and {validationErrors.length - 10} more
                                        </li>
                                    )}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    </div>
                </SheetBody>

                <SheetFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isUploading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={isProcessing || isUploading || parsedData.length === 0 || validationErrors.length > 0}
                        className="flex-1"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload {parsedData.length} Holiday{parsedData.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetBody,
    SheetFooter,
    SheetCloseButton,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Plus,
    Save,
    Trash2,
    Edit2,
    Type,
    Hash,
    Calendar,
    List,
    FileText,
    Copy,
    CheckCircle2,
    AlertCircle,
    X,
    Globe
} from 'lucide-react';
import type { Region, FieldConfig, FieldType } from '@/types/superAdmin';
import { PageHeader } from '@/components/ui/page-header';

const REGIONS: Region[] = ['INDIA', 'US', 'UK', 'MIDDLE_EAST', 'OTHER'];
const FIELD_TYPES: FieldType[] = ['text', 'number', 'date', 'select', 'file'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FIELD_TYPE_CONFIG: Record<FieldType, { icon: React.ComponentType<any>; color: string; bgColor: string }> = {
    text: { icon: Type, color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
    number: { icon: Hash, color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
    date: { icon: Calendar, color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
    select: { icon: List, color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
    file: { icon: FileText, color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
};

const REGEX_TEMPLATES = [
    { label: 'Email', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', description: 'Standard email format' },
    { label: 'Phone (US)', value: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$', description: '(123) 456-7890' },
    { label: 'Phone (IN)', value: '^[6-9]\\d{9}$', description: '10-digit Indian mobile' },
    { label: 'PAN Card', value: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$', description: 'Indian PAN format' },
    { label: 'SSN', value: '^\\d{3}-\\d{2}-\\d{4}$', description: 'US Social Security' },
    { label: 'ZIP Code', value: '^\\d{5}(-\\d{4})?$', description: 'US ZIP or ZIP+4' },
    { label: 'Alphanumeric', value: '^[a-zA-Z0-9]+$', description: 'Letters and numbers only' },
];

export default function RegionRegexConfig() {
    const [filterRegion, setFilterRegion] = useState<Region>('INDIA');
    const [allConfigs, setAllConfigs] = useState<Record<Region, FieldConfig[]>>({
        INDIA: [],
        US: [],
        UK: [],
        MIDDLE_EAST: [],
        OTHER: []
    });
    const [loading, setLoading] = useState(false);
    const [isFieldSheetOpen, setIsFieldSheetOpen] = useState(false);
    const [editingField, setEditingField] = useState<FieldConfig | null>(null);
    const [editingRegion, setEditingRegion] = useState<Region>('INDIA');

    // Load all region configs
    const loadAllConfigs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token');
            const configs: Record<Region, FieldConfig[]> = {
                INDIA: [],
                US: [],
                UK: [],
                MIDDLE_EAST: [],
                OTHER: []
            };

            await Promise.all(
                REGIONS.map(async (region) => {
                    const response = await fetch(
                        `${API_URL}/superadmin/hr-region/${region}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            configs[region] = data.data.fields || [];
                        }
                    }
                })
            );

            setAllConfigs(configs);
        } catch (error) {
            console.error('Error loading configs:', error);
            toast.error('Failed to load region configs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllConfigs();
    }, []);

    // Get fields for current filter region
    const fields = allConfigs[filterRegion] || [];

    // Save field to specific region
    const saveField = async (field: FieldConfig, region: Region) => {
        try {
            const token = localStorage.getItem('auth-token');

            // Get current config to preserve departments and designations
            const currentResponse = await fetch(
                `${API_URL}/superadmin/hr-region/${region}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            let departments: string[] = [];
            let designations: string[] = [];
            let existingFields: FieldConfig[] = [];

            if (currentResponse.ok) {
                const currentData = await currentResponse.json();
                if (currentData.success) {
                    departments = currentData.data.departments || [];
                    designations = currentData.data.designations || [];
                    existingFields = currentData.data.fields || [];
                }
            }

            // Update or add field
            const existingIndex = existingFields.findIndex((f) => f.name === field.name);
            let updatedFields: FieldConfig[];
            if (existingIndex >= 0) {
                updatedFields = existingFields.map((f, i) => (i === existingIndex ? field : f));
            } else {
                updatedFields = [...existingFields, field];
            }

            const response = await fetch(`${API_URL}/superadmin/hr-region`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    region,
                    fields: updatedFields,
                    departments,
                    designations,
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Field saved successfully');
                loadAllConfigs();
                setIsFieldSheetOpen(false);
                setEditingField(null);
            } else {
                toast.error(data.message || 'Failed to save field');
            }
        } catch (error) {
            console.error('Error saving field:', error);
            toast.error('Failed to save field');
        }
    };

    const deleteField = async (fieldName: string, region: Region) => {
        try {
            const token = localStorage.getItem('auth-token');

            // Get current config
            const currentResponse = await fetch(
                `${API_URL}/superadmin/hr-region/${region}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (currentResponse.ok) {
                const currentData = await currentResponse.json();
                if (currentData.success) {
                    const departments = currentData.data.departments || [];
                    const designations = currentData.data.designations || [];
                    const updatedFields = (currentData.data.fields || []).filter((f: FieldConfig) => f.name !== fieldName);

                    const response = await fetch(`${API_URL}/superadmin/hr-region`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            region,
                            fields: updatedFields,
                            departments,
                            designations,
                        }),
                    });

                    const data = await response.json();
                    if (data.success) {
                        toast.success('Field deleted successfully');
                        loadAllConfigs();
                    } else {
                        toast.error(data.message || 'Failed to delete field');
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting field:', error);
            toast.error('Failed to delete field');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="page-container">
            {/* Header with Region Filter */}
            <PageHeader
                icon={Globe}
                title="Regex Validation"
                description="Configure region-specific custom fields and validation rules"
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">Filter Region:</Label>
                            <Select value={filterRegion} onValueChange={(value) => setFilterRegion(value as Region)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {REGIONS.map((region) => (
                                        <SelectItem key={region} value={region}>
                                            {region.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Badge variant="secondary">
                            {fields.length} field{fields.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                }
            />

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    {/* Custom Fields */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-slate-200">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                            <div className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        Custom Fields
                                        <Badge variant="secondary" className="ml-2">
                                            {fields.length}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Define and manage region-specific employee fields
                                    </CardDescription>
                                </div>
                                <Sheet open={isFieldSheetOpen} onOpenChange={setIsFieldSheetOpen}>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setEditingField(null);
                                            setEditingRegion(filterRegion);
                                            setIsFieldSheetOpen(true);
                                        }}
                                        className="shadow-sm"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Field
                                    </Button>
                                    <SheetContent className="w-full sm:max-w-[600px] flex flex-col p-0">
                                        <FieldDialog
                                            field={editingField}
                                            region={editingRegion}
                                            onSave={(field) => saveField(field, editingRegion)}
                                            onClose={() => {
                                                setIsFieldSheetOpen(false);
                                                setEditingField(null);
                                            }}
                                        />
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {fields.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="rounded-full bg-slate-100 p-4 mb-4">
                                        <FileText className="h-12 w-12 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">No custom fields configured</h3>
                                    <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                                        Start by adding custom fields for {filterRegion.replace('_', ' ')} region employees
                                    </p>
                                    <Button size="sm" variant="outline" onClick={() => {
                                        setEditingField(null);
                                        setEditingRegion(filterRegion);
                                        setIsFieldSheetOpen(true);
                                    }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Your First Field
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {fields.map((field) => {
                                        const typeConfig = FIELD_TYPE_CONFIG[field.fieldType as FieldType] || FIELD_TYPE_CONFIG.text;
                                        const TypeIcon = typeConfig.icon;
                                        return (
                                            <Card
                                                key={field.name}
                                                className={`transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 ${typeConfig.bgColor} cursor-pointer`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="space-y-3">
                                                        {/* Header */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-2 flex-1">
                                                                <div className={`rounded-md p-2 ${typeConfig.bgColor} border`}>
                                                                    <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-base truncate">{field.label}</div>
                                                                    <code className="text-xs text-muted-foreground">{field.name}</code>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* Metadata */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {field.fieldType}
                                                                </Badge>
                                                                {field.required ? (
                                                                    <Badge className="text-xs bg-red-100 text-red-700 hover:bg-red-100">
                                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                                        Required
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Optional
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {field.regex && (
                                                                <TooltipProvider>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs text-muted-foreground">Validation Pattern</Label>
                                                                        <div className="flex items-center gap-1">
                                                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded border flex-1 overflow-x-auto truncate">
                                                                                {field.regex}
                                                                            </code>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="ghost"
                                                                                        className="h-7 w-7 p-0"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            copyToClipboard(field.regex || '');
                                                                                        }}
                                                                                    >
                                                                                        <Copy className="h-3 w-3" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Copy regex</TooltipContent>
                                                                            </Tooltip>
                                                                        </div>
                                                                    </div>
                                                                </TooltipProvider>
                                                            )}

                                                            {field.message && (
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-muted-foreground">Error Message</Label>
                                                                    <p className="text-xs text-slate-600 italic">{field.message}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator />

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="flex-1"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingField(field);
                                                                    setEditingRegion(filterRegion);
                                                                    setIsFieldSheetOpen(true);
                                                                }}
                                                            >
                                                                <Edit2 className="h-3 w-3 mr-1" />
                                                                Edit
                                                            </Button>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                if (confirm(`Delete field "${field.label}"?`)) {
                                                                                    deleteField(field.name, filterRegion);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Delete field</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

// Field Dialog Component
function FieldDialog({
    field,
    region,
    onSave,
    onClose,
}: {
    field: FieldConfig | null;
    region: Region;
    onSave: (field: FieldConfig) => void;
    onClose: () => void;
}) {
    const [selectedRegion, setSelectedRegion] = useState<Region>(region);
    const [formData, setFormData] = useState<FieldConfig>(
        field || {
            name: '',
            label: '',
            required: false,
            fieldType: 'text',
            regex: '',
            message: '',
            options: [],
        }
    );
    const [testValue, setTestValue] = useState('');
    const [testResult, setTestResult] = useState<'valid' | 'invalid' | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.label) {
            toast.error('Name and label are required');
            return;
        }
        onSave(formData);
    };

    const testRegex = () => {
        if (!formData.regex || !testValue) {
            setTestResult(null);
            return;
        }
        try {
            const regex = new RegExp(formData.regex);
            setTestResult(regex.test(testValue) ? 'valid' : 'invalid');
        } catch (error) {
            toast.error('Invalid regex pattern');
            setTestResult(null);
        }
    };

    const applyTemplate = (template: string) => {
        setFormData({ ...formData, regex: template });
        setTestValue('');
        setTestResult(null);
    };

    useEffect(() => {
        testRegex();
    }, [testValue, formData.regex]);

    const typeConfig = FIELD_TYPE_CONFIG[formData.fieldType as FieldType] || FIELD_TYPE_CONFIG.text;
    const TypeIcon = typeConfig.icon;

    return (
        <>
            <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                    <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
                    {field ? 'Edit Field' : 'Add Field'}
                </SheetTitle>
                <SheetCloseButton />
            </SheetHeader>
            
            <SheetBody className="space-y-5">
                <form id="field-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Region Selector */}
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                Region <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={selectedRegion}
                                onValueChange={(value) => setSelectedRegion(value as Region)}
                                disabled={!!field}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {REGIONS.map((region) => (
                                        <SelectItem key={region} value={region}>
                                            {region.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">This field will be available for {selectedRegion.replace('_', ' ')} employees</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Field Preview */}
                <Card className={`${typeConfig.bgColor} border-2`}>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                            <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                            <span className="text-sm font-medium">
                                {formData.label || 'Field Label'}
                                {formData.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Field Name (Internal)</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs max-w-xs">
                                            Internal identifier used in database. Use lowercase with underscores.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                            placeholder="e.g., pan_number"
                            disabled={!!field}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Label (Display)</Label>
                        <Input
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="e.g., PAN Number"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select
                        value={formData.fieldType}
                        onValueChange={(value) => setFormData({ ...formData, fieldType: value as FieldType })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FIELD_TYPES.map((type) => {
                                const config = FIELD_TYPE_CONFIG[type];
                                const Icon = config.icon;
                                return (
                                    <SelectItem key={type} value={type}>
                                        <span className="flex items-center gap-2">
                                            <Icon className={`h-4 w-4 ${config.color}`} />
                                            <span className="capitalize">{type}</span>
                                        </span>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-md border">
                    <Checkbox
                        id="required"
                        checked={formData.required}
                        onCheckedChange={(checked) => setFormData({ ...formData, required: checked as boolean })}
                    />
                    <Label htmlFor="required" className="cursor-pointer">
                        Required Field
                    </Label>
                </div>

                <Separator />

                {/* Regex Validation Section */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Validation Rules (Optional)</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs max-w-xs">
                                        Add regex patterns to validate field input. Test your regex before saving.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Regex Templates */}
                    <div className="space-y-2">
                        <Label className="text-sm">Quick Templates</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {REGEX_TEMPLATES.slice(0, 6).map((template) => (
                                <TooltipProvider key={template.label}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="text-xs justify-start h-auto py-2"
                                                onClick={() => applyTemplate(template.value)}
                                            >
                                                {template.label}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">{template.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Validation Regex</Label>
                        <Input
                            value={formData.regex}
                            onChange={(e) => setFormData({ ...formData, regex: e.target.value })}
                            placeholder="e.g., ^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                            className="font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Validation Message</Label>
                        <Input
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="e.g., Invalid PAN format"
                        />
                    </div>

                    {/* Live Regex Tester */}
                    {formData.regex && (
                        <div className="space-y-2 pt-2">
                            <Label className="text-sm font-semibold">Test Regex Pattern</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        value={testValue}
                                        onChange={(e) => setTestValue(e.target.value)}
                                        placeholder="Enter test value..."
                                        className={`pr-8 ${testResult === 'valid'
                                            ? 'border-green-500 bg-green-50'
                                            : testResult === 'invalid'
                                                ? 'border-red-500 bg-red-50'
                                                : ''
                                            }`}
                                    />
                                    {testResult && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            {testResult === 'valid' ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <X className="h-4 w-4 text-red-600" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {testResult && (
                                <p className={`text-xs ${testResult === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                                    {testResult === 'valid' ? '✓ Pattern matches' : '✗ Pattern does not match'}
                                </p>
                            )}
                        </div>
                    )}
                </div>
                </form>
            </SheetBody>

            <SheetFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" form="field-form">
                    <Save className="h-4 w-4 mr-2" />
                    Save Field
                </Button>
            </SheetFooter>
        </>
    );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
    SheetFooter,
    SheetBody,
    SheetCloseButton,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Save, Trash2, Edit2, Calendar } from 'lucide-react';
import type { LeavePolicy, Distribution } from '@/types/superAdmin';
import { PageHeader } from '@/components/ui/page-header';

const DISTRIBUTIONS: Distribution[] = ['QUARTERLY', 'HALF_YEARLY', 'ANNUAL'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LeavePolicyConfig() {
    const [policies, setPolicies] = useState<LeavePolicy[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState<string | null>(null);

    // Load policies
    const loadPolicies = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token');
            const response = await fetch(`${API_URL}/superadmin/leave-policies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setPolicies(data.data);
            }
        } catch (error) {
            console.error('Error loading policies:', error);
            toast.error('Failed to load leave policies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPolicies();
    }, []);

    // Save policy
    const savePolicy = async (policy: LeavePolicy) => {
        try {
            const token = localStorage.getItem('auth-token');
            const url = policy._id
                ? `${API_URL}/superadmin/leave-policy/${policy._id}`
                : `${API_URL}/superadmin/leave-policy`;

            const method = policy._id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(policy),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Leave policy saved successfully');
                setIsDialogOpen(false);
                setEditingPolicy(null);
                loadPolicies();
            } else {
                toast.error(data.message || 'Failed to save policy');
            }
        } catch (error) {
            console.error('Error saving policy:', error);
            toast.error('Failed to save policy');
        }
    };

    // Delete policy
    const deletePolicy = async (policyId: string) => {
        try {
            const token = localStorage.getItem('auth-token');
            const response = await fetch(`${API_URL}/superadmin/leave-policy/${policyId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Leave policy deleted successfully');
                loadPolicies();
            } else {
                toast.error(data.message || 'Failed to delete policy');
            }
        } catch (error) {
            console.error('Error deleting policy:', error);
            toast.error('Failed to delete policy');
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <PageHeader
                icon={Calendar}
                title="Leave Policy Configuration"
                description="Configure leave types, allocations, and policies"
                actions={
                    <Button onClick={() => {
                        setEditingPolicy(null);
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Leave Policy
                    </Button>
                }
            />
            <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <SheetContent className="flex flex-col h-full overflow-hidden w-full sm:max-w-2xl p-0">
                    <PolicyDialog
                        policy={editingPolicy}
                        onSave={savePolicy}
                        onClose={() => {
                            setIsDialogOpen(false);
                            setEditingPolicy(null);
                        }}
                    />
                </SheetContent>
            </Sheet>

            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : policies.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No leave policies configured</p>
                            <p className="text-sm mt-1">Create a leave policy to get started</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies.map((policy) => (
                        <Card key={policy._id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div>
                                        <div className="text-base">{policy.leaveType}</div>
                                        <div className="text-xs font-normal text-muted-foreground">{policy.country}</div>
                                    </div>
                                    <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                        {policy.allocation} days
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-600">Country:</div>
                                    <div className="font-medium">{policy.country}</div>

                                    <div className="text-gray-600">Distribution:</div>
                                    <div className="font-medium">{policy.distribution}</div>

                                    <div className="text-gray-600">Requires Approval:</div>
                                    <div className="font-medium">{policy.requiresApproval ? 'Yes' : 'No'}</div>

                                    <div className="text-gray-600">Carry Forward:</div>
                                    <div className="font-medium">
                                        {policy.carryForward
                                            ? (policy.maxCarryForward ? `${policy.maxCarryForward} days` : 'Yes')
                                            : 'No'}
                                    </div>

                                    <div className="text-gray-600">Encashable:</div>
                                    <div className="font-medium">{policy.encashable ? 'Yes' : 'No'}</div>

                                    <div className="text-gray-600">Min Notice:</div>
                                    <div className="font-medium">
                                        {policy.minDaysNotice ? `${policy.minDaysNotice} days` : '0 days'}
                                    </div>

                                    <div className="text-gray-600">Max Consecutive:</div>
                                    <div className="font-medium">
                                        {policy.maxConsecutiveDays ? `${policy.maxConsecutiveDays} days` : 'Not Set'}
                                    </div>
                                </div>

                                {policy.description && (
                                    <div className="pt-3 border-t">
                                        <p className="text-sm text-gray-600">{policy.description}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-3 border-t">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setEditingPolicy(policy);
                                            setIsDialogOpen(true);
                                        }}
                                    >
                                        <Edit2 className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setPolicyToDelete(policy._id!);
                                            setDeleteConfirmOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Leave Policy</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this leave policy? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (policyToDelete) deletePolicy(policyToDelete);
                                setPolicyToDelete(null);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Policy Dialog Component
function PolicyDialog({
    policy,
    onSave,
    onClose,
}: {
    policy: LeavePolicy | null;
    onSave: (policy: LeavePolicy) => void;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState<LeavePolicy>(
        policy || {
            leaveType: '',
            country: '',
            allocation: 12,
            distribution: 'ANNUAL',
            carryForward: false,
            maxCarryForward: 0,
            encashable: false,
            requiresApproval: true,
            minDaysNotice: 0,
            maxConsecutiveDays: undefined,
            description: '',
            isActive: true,
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.leaveType || !formData.country || !formData.allocation) {
            toast.error('Leave Type, Country, and Allocation are required');
            return;
        }
        onSave(formData);
    };

    return (
        <>
            <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {policy ? 'Edit Leave Policy' : 'Add Leave Policy'}
                </SheetTitle>
                <SheetCloseButton />
            </SheetHeader>

            <SheetBody>
                <form id="policy-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Leave Type *</Label>
                        <Input
                            value={formData.leaveType}
                            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                            placeholder="e.g., Earned Leave, Sick Leave"
                            disabled={!!policy}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Country *</Label>
                        <Input
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            placeholder="e.g., India, USA, UK"
                            disabled={!!policy}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Allocation (days/year)</Label>
                        <Input
                            type="number"
                            value={formData.allocation}
                            onChange={(e) => setFormData({ ...formData, allocation: parseInt(e.target.value) || 0 })}
                            min={0}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Distribution</Label>
                        <Select
                            value={formData.distribution}
                            onValueChange={(value) => setFormData({ ...formData, distribution: value as Distribution })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DISTRIBUTIONS.map((dist) => (
                                    <SelectItem key={dist} value={dist}>
                                        {dist.replace('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="requiresApproval"
                            checked={formData.requiresApproval}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, requiresApproval: checked as boolean })
                            }
                        />
                        <Label htmlFor="requiresApproval">Requires Approval</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="carryForward"
                            checked={formData.carryForward}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, carryForward: checked as boolean })
                            }
                        />
                        <Label htmlFor="carryForward">Allow Carry Forward</Label>
                    </div>

                    {formData.carryForward && (
                        <div className="ml-6 space-y-2">
                            <Label>Max Carry Forward (days)</Label>
                            <Input
                                type="number"
                                value={formData.maxCarryForward || 0}
                                onChange={(e) =>
                                    setFormData({ ...formData, maxCarryForward: parseInt(e.target.value) || 0 })
                                }
                                min={0}
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="encashable"
                            checked={formData.encashable}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, encashable: checked as boolean })
                            }
                        />
                        <Label htmlFor="encashable">Encashable</Label>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Min Days Notice</Label>
                        <Input
                            type="number"
                            value={formData.minDaysNotice || 0}
                            onChange={(e) =>
                                setFormData({ ...formData, minDaysNotice: parseInt(e.target.value) || 0 })
                            }
                            min={0}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Max Consecutive Days (optional)</Label>
                        <Input
                            type="number"
                            value={formData.maxConsecutiveDays || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    maxConsecutiveDays: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                            }
                            min={1}
                            placeholder="No limit"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Policy description or additional notes"
                        rows={3}
                    />
                </div>

                </form>
            </SheetBody>

            <SheetFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" form="policy-form">
                    <Save className="h-4 w-4 mr-2" />
                    Save Policy
                </Button>
            </SheetFooter>
        </>
    );
}

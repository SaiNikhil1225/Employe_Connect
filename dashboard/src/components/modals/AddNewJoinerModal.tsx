import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
  SheetCloseButton,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useNewJoinerStore } from '@/store/newJoinerStore';
import { toast } from 'sonner';

interface AddNewJoinerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNewJoinerModal({ open, onOpenChange }: AddNewJoinerModalProps) {
  const addNewJoiner = useNewJoinerStore(state => state.addNewJoiner);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    role: '',
    joinDate: '',
    email: '',
    phone: '',
    location: '',
    department: '',
    businessUnit: ''
  });

  const generateAvatar = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.role.trim() || !formData.joinDate.trim() || !formData.employeeId.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Format date
    const dateObj = new Date(formData.joinDate);
    const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const longDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fullDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    addNewJoiner({
      employeeId: formData.employeeId,
      name: formData.name,
      role: formData.role,
      date: shortDate,
      joinDate: longDate,
      fullDate: fullDate,
      department: formData.department || 'General',
      avatar: generateAvatar(formData.name),
      email: formData.email || `${formData.name.toLowerCase().replace(' ', '.')}@company.com`,
      phone: formData.phone || '+1 234-567-8900',
      location: formData.location || 'Office',
      jobTitle: formData.role,
      businessUnit: formData.businessUnit || 'General'
    });

    toast.success('New joiner added successfully!');
    setFormData({
      employeeId: '',
      name: '',
      role: '',
      joinDate: '',
      email: '',
      phone: '',
      location: '',
      department: '',
      businessUnit: ''
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle>Add New Joiner</SheetTitle>
              <p className="text-sm text-muted-foreground">Add a new employee to the team celebrations list.</p>
            </div>
          </div>
          <SheetCloseButton />
        </SheetHeader>

        <SheetBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="EMP001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date *</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role / Job Title *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Hyderabad"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </SheetBody>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Joiner
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

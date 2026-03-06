import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Mail, Phone, MapPin, Calendar, User, Building, Briefcase, Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { employeeManagementService } from '@/services/employeeManagementService';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface PersonalInfoTabProps {
  employeeId: string;
  employeeData: any;
  onUpdate: () => void;
}

export default function PersonalInfoTab({ employeeId, employeeData, onUpdate }: PersonalInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(employeeData?.profilePhoto || null);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [formData, setFormData] = useState({
    name: employeeData?.name || '',
    email: employeeData?.email || '',
    phone: employeeData?.phone || '',
    designation: employeeData?.designation || '',
    department: employeeData?.department || '',
    location: employeeData?.location || '',
    dateOfBirth: employeeData?.dateOfBirth || '',
    gender: employeeData?.gender || '',
    maritalStatus: employeeData?.maritalStatus || '',
    nationality: employeeData?.nationality || '',
    address: employeeData?.address || '',
    city: employeeData?.city || '',
    state: employeeData?.state || '',
    pincode: employeeData?.pincode || '',
    country: employeeData?.country || '',
    personalEmail: employeeData?.personalEmail || '',
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await employeeManagementService.updatePersonalInfo(employeeId, formData);
      
      if (response.success) {
        toast.success('Personal information updated successfully');
        
        // Update auth store with new user data (only fields that exist in User type)
        updateUser({
          name: formData.name,
          email: formData.email,
          department: formData.department,
        });
        
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to update personal information');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update personal information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: employeeData?.name || '',
      email: employeeData?.email || '',
      phone: employeeData?.phone || '',
      designation: employeeData?.designation || '',
      department: employeeData?.department || '',
      location: employeeData?.location || '',
      dateOfBirth: employeeData?.dateOfBirth || '',
      gender: employeeData?.gender || '',
      maritalStatus: employeeData?.maritalStatus || '',
      nationality: employeeData?.nationality || '',
      address: employeeData?.address || '',
      city: employeeData?.city || '',
      state: employeeData?.state || '',
      pincode: employeeData?.pincode || '',
      country: employeeData?.country || '',
      personalEmail: employeeData?.personalEmail || '',
    });
    setPhotoPreview(employeeData?.profilePhoto || null);
    setIsEditing(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        setPhotoPreview(photoData);
        
        // Update auth store with new avatar
        updateUser({
          avatar: photoData
        });
      };
      reader.readAsDataURL(file);

      // In a real implementation, you would upload to a server here
      // For now, we'll just show the preview
      toast.success('Photo uploaded successfully');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo');
      setPhotoPreview(employeeData?.profilePhoto || null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card - MyTeam Style */}
      <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6">
            {/* Profile Photo - Centered with Upload */}
            <div className="relative group">
              {photoPreview || employeeData?.profilePhoto ? (
                <img
                  src={photoPreview || employeeData?.profilePhoto}
                  alt={employeeData?.name}
                  className="h-32 w-32 rounded-full object-cover border-4 border-border shadow-md"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold border-4 border-border shadow-md">
                  {employeeData?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NA'}
                </div>
              )}
              
              {/* Photo Upload Button */}
              <label 
                htmlFor="photo-upload" 
                className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center cursor-pointer shadow-lg transition-all border-2 border-white dark:border-gray-900"
                title="Upload photo"
              >
                <Camera className="h-5 w-5 text-white" />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
            </div>

            {/* Profile Info - Centered */}
            <div className="text-center w-full">
              <h2 className="text-3xl font-bold text-foreground mb-1">{employeeData?.name}</h2>
              <p className="text-lg text-brand-slate dark:text-gray-400 mb-3">{employeeData?.designation}</p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Badge variant="secondary" className="text-xs px-3 py-1">
                  {employeeData?.employeeId}
                </Badge>
                <Badge 
                  className={cn(
                    'text-xs px-3 py-1',
                    employeeData?.status === 'active' 
                      ? 'bg-brand-green-light text-brand-green dark:bg-brand-green/20 dark:text-brand-green-light'
                      : 'bg-gray-100 text-brand-slate dark:bg-gray-800 dark:text-gray-400'
                  )}
                >
                  {employeeData?.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}

              {/* Quick Contact Info Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{employeeData?.email}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{employeeData?.phone || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <Building className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{employeeData?.department || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{employeeData?.location || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Section */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personalEmail">Personal Email</Label>
                  <Input
                    id="personalEmail"
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <DatePicker
                    value={formData.dateOfBirth}
                    onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
                    placeholder="Select date of birth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select value={formData.maritalStatus} onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Work Email</p>
                  <p className="text-sm font-medium text-foreground break-all">{employeeData?.email || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm font-medium text-foreground">{employeeData?.phone || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Personal Email</p>
                  <p className="text-sm font-medium text-foreground break-all">{employeeData?.personalEmail || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Date of Birth</p>
                  <p className="text-sm font-medium text-foreground">{employeeData?.dateOfBirth ? new Date(employeeData.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Gender</p>
                  <p className="text-sm font-medium text-foreground">{employeeData?.gender || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Marital Status</p>
                  <p className="text-sm font-medium text-foreground">{employeeData?.maritalStatus || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Nationality</p>
                  <p className="text-sm font-medium text-foreground">{employeeData?.nationality || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Information Section */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Work Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <Briefcase className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Designation</p>
                <p className="text-sm font-medium text-foreground">{employeeData?.designation || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <Building className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Department</p>
                <p className="text-sm font-medium text-foreground">{employeeData?.department || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Location</p>
                <p className="text-sm font-medium text-foreground">{employeeData?.location || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Date of Joining</p>
                <p className="text-sm font-medium text-foreground">{employeeData?.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Reporting Manager</p>
                <p className="text-sm font-medium text-foreground">{employeeData?.reportingManager || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <Briefcase className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">Employee ID</p>
                <p className="text-sm font-medium text-foreground">{employeeData?.employeeId || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information Section */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Current Address</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {employeeData?.address && employeeData?.city && employeeData?.state
                      ? `${employeeData.address}, ${employeeData.city}, ${employeeData.state} ${employeeData.pincode || ''}, ${employeeData.country || ''}`
                      : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

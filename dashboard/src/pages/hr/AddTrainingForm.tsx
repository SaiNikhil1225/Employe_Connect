import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TrainingFormData {
  trainingName: string;
  trainingCategory: string;
  description: string;
  trainerName: string;
  trainerOrganization: string;
  trainingMode: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  maxParticipants: number;
  costPerEmployee: number;
  certificationAvailable: boolean;
  certificationName: string;
  certificationValidityMonths: number;
  prerequisites: string[];
  status: string;
  skillsToBeAcquired: string[];
  targetDepartments: string[];
  targetGrades: string[];
  targetEmploymentTypes: string[];
  targetLocations: string[];
  location: string;
}

const categories = [
  'Technical',
  'Soft Skills',
  'Leadership',
  'Compliance',
  'Safety',
  'Product Knowledge',
  'Sales & Marketing',
  'Finance & Accounting',
  'HR & Administration',
  'Customer Service',
  'Project Management',
  'Quality Management',
  'Other'
];

export function AddTrainingForm() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentPrerequisite, setCurrentPrerequisite] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<TrainingFormData>({
    trainingName: '',
    trainingCategory: '',
    description: '',
    trainerName: '',
    trainerOrganization: '',
    trainingMode: '',
    startDate: '',
    endDate: '',
    durationHours: 0,
    maxParticipants: 0,
    costPerEmployee: 0,
    certificationAvailable: false,
    certificationName: '',
    certificationValidityMonths: 0,
    prerequisites: [],
    status: 'Scheduled',
    skillsToBeAcquired: [],
    targetDepartments: [],
    targetGrades: [],
    targetEmploymentTypes: [],
    targetLocations: [],
    location: ''
  });
  
  // Fetch employees and extract unique values for dropdowns
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/employees');
        const result = await response.json();
        if (result.success) {
          const empData = result.data;
          setEmployees(empData);
          
          // Extract unique departments
          const uniqueDepts = [...new Set(empData.map((e: any) => e.department).filter(Boolean))].sort();
          setDepartments(uniqueDepts);
          
          // Extract unique locations
          const uniqueLocs = [...new Set(empData.map((e: any) => e.location).filter(Boolean))].sort();
          setLocations(uniqueLocs);
          
          // Extract unique grades
          const uniqueGrades = [...new Set(empData.map((e: any) => e.grade).filter(Boolean))].sort();
          setGrades(uniqueGrades);
          
          // Extract unique employment types
          const uniqueEmpTypes = [...new Set(empData.map((e: any) => e.employmentType).filter(Boolean))].sort();
          setEmploymentTypes(uniqueEmpTypes);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employee data');
      }
    };
    
    fetchEmployees();
  }, []);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, certificationAvailable: checked }));
  };
  
  const toggleArrayItem = (key: keyof TrainingFormData, value: string) => {
    setFormData(prev => {
      const array = prev[key] as string[];
      const newArray = array.includes(value)
        ? array.filter(item => item !== value)
        : [...array, value];
      return { ...prev, [key]: newArray };
    });
  };
  
  const addSkill = () => {
    if (currentSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skillsToBeAcquired: [...prev.skillsToBeAcquired, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };
  
  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skillsToBeAcquired: prev.skillsToBeAcquired.filter(s => s !== skill)
    }));
  };
  
  const addPrerequisite = () => {
    if (currentPrerequisite.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, currentPrerequisite.trim()]
      }));
      setCurrentPrerequisite('');
    }
  };
  
  const removePrerequisite = (prerequisite: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(p => p !== prerequisite)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.trainingName.trim()) {
      toast.error('Training name is required');
      return;
    }
    
    if (!formData.trainingCategory) {
      toast.error('Training category is required');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Start and end dates are required');
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }
    
    if (formData.durationHours <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }
    
    if (formData.maxParticipants <= 0) {
      toast.error('Maximum participants must be greater than 0');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: user?.employeeId || user?.name || 'HR'
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Training program created successfully');
        navigate('/hr/training');
      } else {
        toast.error(result.message || 'Failed to create training program');
      }
    } catch (error) {
      console.error('Error creating training:', error);
      toast.error('Failed to create training program');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/hr/training')}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Training Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Add New Training Program</h1>
        <p className="text-muted-foreground mt-1">
          Create a new training program for employees
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of the training program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trainingName">Training Name *</Label>
                  <Input
                    id="trainingName"
                    name="trainingName"
                    value={formData.trainingName}
                    onChange={handleInputChange}
                    placeholder="e.g., React Advanced Development"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trainingCategory">Category *</Label>
                  <Select
                    value={formData.trainingCategory}
                    onValueChange={(value) => handleSelectChange('trainingCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the training program objectives and content"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="trainerName">Trainer Name *</Label>
                  <Input
                    id="trainerName"
                    name="trainerName"
                    value={formData.trainerName}
                    onChange={handleInputChange}
                    placeholder="Name of the trainer"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trainerOrganization">Trainer Organization</Label>
                  <Input
                    id="trainerOrganization"
                    name="trainerOrganization"
                    value={formData.trainerOrganization}
                    onChange={handleInputChange}
                    placeholder="Organization or company"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Training Details */}
          <Card>
            <CardHeader>
              <CardTitle>Training Details</CardTitle>
              <CardDescription>
                Specify the training schedule and logistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="trainingMode">Training Mode *</Label>
                  <Select
                    value={formData.trainingMode}
                    onValueChange={(value) => handleSelectChange('trainingMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Offline">Offline</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="durationHours">Duration (Hours) *</Label>
                  <Input
                    id="durationHours"
                    name="durationHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.durationHours || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    value={formData.maxParticipants || ''}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="costPerEmployee">Cost per Employee ($) *</Label>
                  <Input
                    id="costPerEmployee"
                    name="costPerEmployee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPerEmployee || ''}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Training venue or online platform"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Certification */}
          <Card>
            <CardHeader>
              <CardTitle>Certification</CardTitle>
              <CardDescription>
                Configure certification details if applicable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="certificationAvailable"
                  checked={formData.certificationAvailable}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="certificationAvailable" className="cursor-pointer">
                  This training provides certification
                </Label>
              </div>
              
              {formData.certificationAvailable && (
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificationName">Certification Name</Label>
                    <Input
                      id="certificationName"
                      name="certificationName"
                      value={formData.certificationName}
                      onChange={handleInputChange}
                      placeholder="e.g., AWS Certified Developer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="certificationValidityMonths">
                      Validity (Months)
                    </Label>
                    <Input
                      id="certificationValidityMonths"
                      name="certificationValidityMonths"
                      type="number"
                      min="0"
                      value={formData.certificationValidityMonths || ''}
                      onChange={handleInputChange}
                      placeholder="0 for lifetime validity"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Skills & Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Prerequisites</CardTitle>
              <CardDescription>
                Define skills to be acquired and any prerequisites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Skills to be Acquired</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Enter a skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skillsToBeAcquired.map(skill => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Prerequisites</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentPrerequisite}
                    onChange={(e) => setCurrentPrerequisite(e.target.value)}
                    placeholder="Enter a prerequisite"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPrerequisite();
                      }
                    }}
                  />
                  <Button type="button" onClick={addPrerequisite} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.prerequisites.map(prereq => (
                    <Badge key={prereq} variant="secondary" className="gap-1">
                      {prereq}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(prereq)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>
                Select the target departments, locations, grades, and employment types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Target Departments</Label>
                {departments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading departments...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {departments.map(dept => (
                      <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={formData.targetDepartments.includes(dept)}
                          onCheckedChange={() => toggleArrayItem('targetDepartments', dept)}
                        />
                        <span className="text-sm">{dept}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label>Target Locations</Label>
                {locations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading locations...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {locations.map(loc => (
                      <label key={loc} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={formData.targetLocations.includes(loc)}
                          onCheckedChange={() => toggleArrayItem('targetLocations', loc)}
                        />
                        <span className="text-sm">{loc}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label>Target Grades/Bands</Label>
                {grades.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading grades...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {grades.map(grade => (
                      <label key={grade} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={formData.targetGrades.includes(grade)}
                          onCheckedChange={() => toggleArrayItem('targetGrades', grade)}
                        />
                        <span className="text-sm">{grade}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label>Target Employment Types</Label>
                {employmentTypes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading employment types...</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {employmentTypes.map(type => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={formData.targetEmploymentTypes.includes(type)}
                          onCheckedChange={() => toggleArrayItem('targetEmploymentTypes', type)}
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/hr/training')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Training Program
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddTrainingForm;

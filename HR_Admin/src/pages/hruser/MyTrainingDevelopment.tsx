import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Clock, Award, Sparkles, Search, Loader2 } from 'lucide-react';
import { TrainingCard } from '@/components/hruser/TrainingCard';
import { ProgressTracker } from '@/components/hruser/ProgressTracker';
import { CertificateCard } from '@/components/hruser/CertificateCard';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

export function MyTrainingDevelopment() {
  const { permissions } = useProfile();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('trainings');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [trainings, setTrainings] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch trainings on mount
  useEffect(() => {
    const fetchTrainings = async () => {
      if (!user?.employeeId) return;
      
      try {
        setIsLoading(true);
        // Fetch enrollments for current user
        const response = await axios.get(`${API_URL}/training/enrollments/all`, {
          params: { employeeId: user.employeeId }
        });

        if (response.data.success) {
          const enrollments = response.data.data;
          
          // Transform enrollments to training format
          const transformedTrainings = enrollments.map((enrollment: any) => ({
            id: enrollment.trainingId,
            name: enrollment.trainingName,
            description: `${enrollment.trainingCategory} training program`,
            category: enrollment.trainingCategory || 'Other',
            status: enrollment.completionStatus === 'Completed' ? 'completed' 
                   : enrollment.completionStatus === 'In Progress' ? 'in_progress' 
                   : 'not_started',
            startDate: enrollment.startDate,
            endDate: enrollment.endDate,
            timing: '9:00 AM - 5:00 PM', // Default timing
            duration: enrollment.durationHours || 0,
            location: { 
              venue: enrollment.location || 'TBD', 
              room: 'TBD', 
              type: enrollment.trainingMode?.toLowerCase() || 'in_person' 
            },
            trainer: {
              id: enrollment.trainerId || 'TBD',
              name: enrollment.trainerName || 'To Be Announced',
              email: enrollment.trainerEmail || 'tba@company.com',
              phone: enrollment.trainerPhone || 'N/A',
              designation: 'Trainer',
              bio: 'Professional trainer'
            },
            participants: { 
              total: enrollment.currentEnrollments || 0, 
              list: [] 
            },
            materials: enrollment.materials || [],
            progress: {
              percentage: enrollment.progressPercentage || 0,
              hoursCompleted: enrollment.hoursCompleted || 0,
              totalHours: enrollment.durationHours || 0,
              modulesCompleted: 0,
              totalModules: 0
            }
          }));

          setTrainings(transformedTrainings);
          
          // Filter completed trainings for certificates
          const completedTrainings = enrollments
            .filter((e: any) => e.completionStatus === 'Completed' && e.certificationStatus === 'Certified')
            .map((e: any) => ({
              id: e.certificationId || `CERT-${e.enrollmentId}`,
              trainingId: e.trainingId,
              trainingName: e.trainingName,
              recipientName: user.name || '',
              completionDate: e.completionDate || e.endDate,
              score: e.score || 0,
              grade: e.grade || 'Pass',
              trainerName: e.trainerName || 'Trainer',
              duration: e.durationHours || 0,
              pdfUrl: `/certificates/${e.certificationId}.pdf`,
              verificationUrl: `https://company.com/verify/${e.certificationId}`,
              issuedBy: 'Company Name',
              issuedDate: e.certificationDate || e.completionDate
            }));
          
          setCertificates(completedTrainings);
        }
      } catch (error: any) {
        console.error('Failed to fetch trainings:', error);
        toast.error('Failed to load training data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainings();
  }, [user?.employeeId, user?.name]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalAssigned = trainings.filter(t => t.status !== 'completed').length;
    const inProgress = trainings.filter(t => t.status === 'in_progress').length;
    const completed = trainings.filter(t => t.status === 'completed').length;
    const certificatesCount = certificates.length;

    return { totalAssigned, inProgress, completed, certificates: certificatesCount };
  }, [trainings, certificates]);

  // Filter trainings
  const filteredTrainings = useMemo(() => {
    return trainings.filter(training => {
      const matchesSearch = training.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           training.trainer.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || training.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || training.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter, trainings]);

  // Only show for HR user mode
  if (!permissions.isHRUser) {
    return null;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          My Training & Development
        </h1>
        <p className="text-muted-foreground mt-2">Track your learning journey and view assigned programs</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
        {/* Total Assigned */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Assigned</p>
                <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">{stats.totalAssigned}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Active Programs</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/20 dark:bg-blue-500/30">
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">In Progress</p>
                <p className="text-4xl font-bold text-orange-700 dark:text-orange-300">{stats.inProgress}</p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70">Keep Learning!</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/20 dark:bg-orange-500/30">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                <p className="text-4xl font-bold text-green-700 dark:text-green-300">{stats.completed}</p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">This Year</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/20 dark:bg-green-500/30">
                <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates */}
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Certificates</p>
                <p className="text-4xl font-bold text-purple-700 dark:text-purple-300">{stats.certificates}</p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Download Available</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/20 dark:bg-purple-500/30">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trainings" className="text-sm">
            <GraduationCap className="h-4 w-4 mr-2" />
            My Trainings
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-sm">
            <Clock className="h-4 w-4 mr-2" />
            Progress Tracker
          </TabsTrigger>
          <TabsTrigger value="certificates" className="text-sm">
            <Award className="h-4 w-4 mr-2" />
            Certificates
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: My Trainings */}
        <TabsContent value="trainings" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search trainings by name or trainer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Training Cards */}
          <div className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Loading trainings...</h3>
                </CardContent>
              </Card>
            ) : filteredTrainings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <GraduationCap className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No Trainings Found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {trainings.length === 0 
                      ? "You haven't been assigned to any training programs yet" 
                      : "Try adjusting your filters or search query"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTrainings.map(training => (
                <TrainingCard key={training.id} training={training} />
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Progress Tracker */}
        <TabsContent value="progress">
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">Loading progress...</h3>
              </CardContent>
            </Card>
          ) : (
            <ProgressTracker trainings={trainings} />
          )}
        </TabsContent>

        {/* Tab 3: Certificates */}
        <TabsContent value="certificates" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">Loading certificates...</h3>
              </CardContent>
            </Card>
          ) : certificates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Award className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">No Certificates Yet</h3>
                <p className="text-sm text-muted-foreground mt-2">Complete trainings to earn certificates</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map(certificate => (
                <CertificateCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

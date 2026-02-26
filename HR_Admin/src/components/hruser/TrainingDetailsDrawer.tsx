import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, Mail, Phone, Target, Clock, Users, Book } from 'lucide-react';

interface Training {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
  timing: string;
  duration: number;
  location: { venue: string; room: string; type: string };
  trainer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
    bio: string;
  };
  participants: { total: number; list: any[] };
  materials: any[];
  progress: {
    percentage: number;
    hoursCompleted: number;
    totalHours: number;
    modulesCompleted: number;
    totalModules: number;
  };
}

interface TrainingDetailsDrawerProps {
  training: Training;
  open: boolean;
  onClose: () => void;
}

const categoryColors: Record<string, string> = {
  Technical: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Soft Skills': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Leadership: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Compliance: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
};

const statusConfig: Record<string, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' }
};

export function TrainingDetailsDrawer({ training, open, onClose }: TrainingDetailsDrawerProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const statusInfo = statusConfig[training.status] || statusConfig.not_started;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{training.name}</h2>
              <div className="flex gap-2">
                <Badge variant="outline" className={categoryColors[training.category] || categoryColors.Other}>
                  {training.category}
                </Badge>
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Course Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <Book className="h-4 w-4" />
              Course Overview
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {training.description}
            </p>
          </div>

          <hr className="border-muted" />

          {/* Learning Objectives */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
              <Target className="h-4 w-4" />
              Learning Objectives
            </div>
            <ul className="ml-6 space-y-2 text-sm text-muted-foreground">
              <li>• Master key concepts and practical applications</li>
              <li>• Develop hands-on experience through exercises</li>
              <li>• Implement best practices in real-world scenarios</li>
              <li>• Build production-ready solutions</li>
            </ul>
          </div>

          <hr className="border-muted" />

          {/* Trainer Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
              <User className="h-4 w-4" />
              Trainer Information
            </div>
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div>
                <p className="font-semibold text-lg">{training.trainer.name}</p>
                <p className="text-sm text-muted-foreground">{training.trainer.designation}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${training.trainer.email}`} className="hover:text-blue-600">
                    {training.trainer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${training.trainer.phone}`} className="hover:text-blue-600">
                    {training.trainer.phone}
                  </a>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">
                {training.trainer.bio}
              </p>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Training Schedule */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
              <Calendar className="h-4 w-4" />
              Training Schedule
            </div>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDate(training.startDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{formatDate(training.endDate)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{training.duration} hours</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timing</p>
                  <p className="font-medium">{training.timing}</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Venue Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
              <MapPin className="h-4 w-4" />
              Venue Details
            </div>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{training.location.venue}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Room</p>
                <p className="font-medium">{training.location.room}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{training.location.type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <hr className="border-muted" />

          {/* Participants */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
              <Users className="h-4 w-4" />
              Participants
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">{training.participants.total}</span> participants enrolled
              </p>
            </div>
          </div>

          {/* Progress (if in progress) */}
          {training.status === 'in_progress' && (
            <>
              <hr className="border-muted" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                  My Progress
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {training.progress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${training.progress.percentage}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Hours Completed</p>
                      <p className="font-medium">{training.progress.hoursCompleted} / {training.progress.totalHours}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Modules Completed</p>
                      <p className="font-medium">{training.progress.modulesCompleted} / {training.progress.totalModules}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

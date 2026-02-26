import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, FileText, FolderOpen, User } from 'lucide-react';
import { TrainingDetailsDrawer } from './TrainingDetailsDrawer';
import { MaterialsModal } from './MaterialsModal';
import { ParticipantsModal } from './ParticipantsModal';

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

interface TrainingCardProps {
  training: Training;
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

const locationTypeConfig: Record<string, { color: string }> = {
  in_person: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  online: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  hybrid: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' }
};

export function TrainingCard({ training }: TrainingCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusInfo = statusConfig[training.status] || statusConfig.not_started;

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2">
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <Badge variant="outline" className={categoryColors[training.category] || categoryColors.Other}>
              {training.category}
            </Badge>
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {training.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {training.description}
            </p>
          </div>

          <hr className="border-muted" />

          {/* Trainer Info */}
          <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4 text-blue-600" />
              <span>Trainer</span>
            </div>
            <div className="ml-6 space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{training.trainer.name}</p>
              <p className="text-xs text-muted-foreground">{training.trainer.email}</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span>Schedule</span>
            </div>
            <div className="ml-6 space-y-1 text-sm text-muted-foreground">
              <p>{formatDate(training.startDate)} - {formatDate(training.endDate)}</p>
              <p>{training.timing}</p>
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                Duration: {training.duration} hours
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-green-600" />
              <span>Location</span>
            </div>
            <div className="ml-6 space-y-1">
              <p className="text-sm text-muted-foreground">
                {training.location.venue} - {training.location.room}
              </p>
              <Badge className={locationTypeConfig[training.location.type]?.color || ''}>
                {training.location.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{training.participants.total} enrolled</span>
          </div>

          {/* Progress (Only for in_progress) */}
          {training.status === 'in_progress' && (
            <>
              <hr className="border-muted" />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">My Progress</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {training.progress.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${training.progress.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {training.progress.hoursCompleted} of {training.progress.totalHours} hours completed
                </p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <hr className="border-muted" />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={() => setDetailsOpen(true)}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMaterialsOpen(true)}
              className="flex-1"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Materials
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParticipantsOpen(true)}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Participants
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drawers and Modals */}
      <TrainingDetailsDrawer
        training={training}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
      <MaterialsModal
        training={training}
        open={materialsOpen}
        onClose={() => setMaterialsOpen(false)}
      />
      <ParticipantsModal
        training={training}
        open={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
      />
    </>
  );
}

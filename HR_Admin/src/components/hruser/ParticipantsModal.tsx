import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, Mail, User, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

interface Training {
  id: string;
  name: string;
  participants: {
    total: number;
    list: Array<{
      id: string;
      name: string;
      email: string;
      designation: string;
      department: string;
    }>;
  };
}

interface ParticipantsModalProps {
  training: Training;
  open: boolean;
  onClose: () => void;
}

export function ParticipantsModal({ training, open, onClose }: ParticipantsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch participants when modal opens
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!open || !training.id) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/training/${training.id}/enrollments`);
        
        if (response.data.success) {
          const enrollments = response.data.data;
          const participantsList = enrollments.map((enrollment: any) => ({
            id: enrollment.employeeId,
            name: enrollment.employeeName,
            email: enrollment.email,
            designation: enrollment.designation || 'N/A',
            department: enrollment.department
          }));
          setParticipants(participantsList);
        }
      } catch (error) {
        console.error('Failed to fetch participants:', error);
        toast.error('Failed to load participants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [open, training.id]);

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Training Participants - {training.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Total Enrolled: {training.participants.total} participants
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Loading participants...</p>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {participants.length === 0 ? 'No participants enrolled yet' : 'No participants found'}
              </p>
            </div>
          ) : (
            filteredParticipants.map((participant) => (
              <div
                key={participant.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {getInitials(participant.name)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {participant.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {participant.designation} • {participant.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <a
                        href={`mailto:${participant.email}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {participant.email}
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button size="sm" variant="outline">
                    <User className="h-3 w-3 mr-1" />
                    View Profile
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

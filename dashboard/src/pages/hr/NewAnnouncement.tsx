import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sanitizeString, sanitizeHtml } from '@/utils/sanitize';
import { useAnnouncementStore } from '@/store/announcementStore';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/constants/design-system';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X,
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  Send, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Maximize2,
  Heart,
  MessageCircle,
  Eye,
  FileText,
  Calendar,
  Pin,
  BarChart3,
  Plus,
  Trash2,
  Clock,
  Users,
  CheckCircle2,
  FileImage,
  User,
  Mail,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { getAvatarGradient } from '@/constants/design-system';

type LayoutType = 'content-only' | 'content-with-image' | 'image-only';
type SubLayout = 'left-image' | 'top-image' | 'right-image';

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Human Resources', 'Finance', 'Operations', 'Legal', 'Customer Success',
  'IT', 'Data & Analytics', 'Research', 'Administration'
];

interface AnnouncementFormData {
  title: string;
  description: string;
  type: 'general' | 'event';
  category: string;
  isPinned: boolean;
  needsAcknowledgement: boolean;
  image: string | null;
  attachments: File[];
  expiresIn: string;
  layoutType: LayoutType;
  subLayout: SubLayout;
  publishType: 'now' | 'later';
  scheduleDate: string;
  scheduleTime: string;
  audience: 'all' | 'departments';
  selectedAudienceDepts: string[];
  notifyByEmail: boolean;
}

interface PollOption {
  id: string;
  text: string;
}

interface PollFormData {
  question: string;
  options: PollOption[];
  allowMultipleAnswers: boolean;
  isAnonymous: boolean;
  expiresIn: string;
  category: string;
}

interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: 'mcq-single' | 'mcq-multiple' | 'text-short' | 'text-long' | 'rating-5' | 'yes-no';
  options: string[];
  isRequired: boolean;
}

interface SurveyFormData {
  title: string;
  description: string;
  category: string;
  questions: SurveyQuestion[];
  startDate: string;
  endDate: string;
  allowAnonymous: boolean;
  targetAudience: 'all' | 'departments' | 'custom';
  selectedDepartments: string[];
}

interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  category: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  mode: 'in-person' | 'virtual' | 'hybrid';
  venue: string;
  address: string;
  virtualLink: string;
  enableRSVP: boolean;
  maxAttendees: string;
  organizer: string;
  contactEmail: string;
  targetAudience: 'all' | 'departments' | 'custom';
  selectedDepartments: string[];
}

export function NewAnnouncement() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('announcement');
  const [fontFamily, setFontFamily] = useState('default');
  const [deptSearch, setDeptSearch] = useState('');
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  
  // Store hooks
  const addAnnouncement = useAnnouncementStore(state => state.addAnnouncement);
  const updateAnnouncement = useAnnouncementStore(state => state.updateAnnouncement);
  const fetchAnnouncements = useAnnouncementStore(state => state.fetchAnnouncements);
  const user = useAuthStore(state => state.user);
  
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    description: '',
    type: 'general',
    category: 'general',
    isPinned: false,
    needsAcknowledgement: false,
    image: null,
    attachments: [],
    expiresIn: '7days',
    layoutType: 'content-only',
    subLayout: 'left-image',
    publishType: 'now',
    scheduleDate: '',
    scheduleTime: '',
    audience: 'all',
    selectedAudienceDepts: [],
    notifyByEmail: false
  });

  // Poll form state
  const [pollData, setPollData] = useState<PollFormData>({
    question: '',
    options: [
      { id: '1', text: '' },
      { id: '2', text: '' }
    ],
    allowMultipleAnswers: false,
    isAnonymous: false,
    expiresIn: '7days',
    category: 'general'
  });

  // Survey form state
  const [surveyData, setSurveyData] = useState<SurveyFormData>({
    title: '',
    description: '',
    category: 'employee-feedback',
    questions: [{
      id: '1',
      questionText: '',
      questionType: 'mcq-single',
      options: ['', ''],
      isRequired: true
    }],
    startDate: '',
    endDate: '',
    allowAnonymous: false,
    targetAudience: 'all',
    selectedDepartments: []
  });

  // Event form state
  const [eventData, setEventData] = useState<EventFormData>({
    title: '',
    description: '',
    eventType: 'town-hall',
    category: 'company-wide',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    mode: 'in-person',
    venue: '',
    address: '',
    virtualLink: '',
    enableRSVP: true,
    maxAttendees: '',
    organizer: user?.name || '',
    contactEmail: user?.email || '',
    targetAudience: 'all',
    selectedDepartments: []
  });

  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    bulletList: false,
    numberedList: false
  });

  // Load announcement data if editing, reposting, or draft data if resuming
  useEffect(() => {
    const editAnnouncement = location.state?.editAnnouncement;
    const repostAnnouncement = location.state?.repostAnnouncement;
    const draftData = location.state?.draft;
    
    if (editAnnouncement) {
      setEditingAnnouncementId(editAnnouncement.id);
      setFormData({
        title: editAnnouncement.title || '',
        description: editAnnouncement.description || '',
        type: editAnnouncement.type || 'general',
        category: editAnnouncement.category || 'general',
        isPinned: editAnnouncement.isPinned || false,
        needsAcknowledgement: editAnnouncement.needsAcknowledgement || false,
        image: editAnnouncement.imageUrl || null,
        attachments: [],
        expiresIn: editAnnouncement.expiresAt ? calculateExpiryDays(editAnnouncement.expiresAt) : '7days',
        layoutType: editAnnouncement.layoutType || 'content-only',
        subLayout: editAnnouncement.subLayout || 'left-image'
      });
    } else if (repostAnnouncement) {
      // Repost functionality - pre-fill form but don't set editing ID
      setFormData({
        title: repostAnnouncement.title || '',
        description: repostAnnouncement.description || '',
        type: repostAnnouncement.type || 'general',
        category: repostAnnouncement.category || 'general',
        isPinned: false, // Reset pinned status
        needsAcknowledgement: repostAnnouncement.needsAcknowledgement || false,
        image: repostAnnouncement.imageUrl || null,
        attachments: [],
        expiresIn: '7days', // Reset expiry
        layoutType: repostAnnouncement.layoutType || 'content-only',
        subLayout: repostAnnouncement.subLayout || 'left-image'
      });
      toast.info('Reposting announcement', {
        description: 'Edit as needed and publish'
      });
    } else if (draftData) {
      // Load draft data
      if (draftData.type === 'announcement' && draftData.formData) {
        setActiveTab('announcement');
        setFormData(draftData.formData);
      } else if (draftData.type === 'polls' && draftData.pollData) {
        setActiveTab('polls');
        setPollData(draftData.pollData);
      }
      
      toast.info('Draft loaded', {
        description: 'Continue editing your saved draft'
      });
    }
  }, [location.state]);

  // Helper to calculate expiry days from expiresAt date
  const calculateExpiryDays = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return '1day';
    if (diffDays <= 7) return '7days';
    if (diffDays <= 14) return '14days';
    if (diffDays <= 30) return '30days';
    return 'never';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Maximum file size is 20MB'
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          if (Math.abs(aspectRatio - 1) > 0.1) {
            toast.warning('Image Ratio', {
              description: 'Recommended aspect ratio is 1:1 for best display'
            });
          }
          setFormData(prev => ({ ...prev, image: reader.result as string }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Only PNG, JPG, JPEG, and PDF files are allowed'
        });
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File too large', {
          description: `${file.name} exceeds 20MB limit`
        });
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleGetFromPexels = () => {
    // Simulate Pexels integration
    const sampleImages = [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=800&fit=crop'
    ];
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setFormData(prev => ({ ...prev, image: randomImage }));
    toast.success('Image loaded from Pexels');
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error('Title required', {
        description: 'Please enter an announcement title'
      });
      return;
    }

    setIsPublishing(true);

    try {
      const expiryDays = formData.expiresIn === 'never' ? null : parseInt(formData.expiresIn.replace('days', '').replace('day', ''));
      const expiryDate = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() : undefined;

      // If editing an existing draft, update it
      if (editingAnnouncementId) {
        await updateAnnouncement(editingAnnouncementId, {
          title: formData.title,
          description: formData.description,
          priority: formData.type === 'event' ? 'high' : 'medium',
          imageUrl: formData.image || undefined,
          category: formData.category,
          isPinned: formData.isPinned,
          status: 'draft',
          expiresAt: expiryDate,
          layoutType: formData.layoutType,
          subLayout: formData.subLayout,
          isPoll: activeTab === 'polls',
          pollOptions: activeTab === 'polls' ? pollData.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: 0,
            voters: [],
            votedBy: []
          })) : undefined,
          allowMultipleAnswers: activeTab === 'polls' ? pollData.allowMultipleAnswers : undefined,
          isAnonymous: activeTab === 'polls' ? pollData.isAnonymous : undefined,
        });
      } else {
        // Create new draft
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        await addAnnouncement({
          title: formData.title,
          description: formData.description,
          author: user?.name || 'Admin',
          role: user?.role || 'Administrator',
          date: dateStr,
          time: 'Just now',
          avatar: getInitials(user?.name || 'AD'),
          priority: formData.type === 'event' ? 'high' : 'medium',
          imageUrl: formData.image || undefined,
          category: formData.category,
          isPinned: formData.isPinned,
          views: 0,
          status: 'draft',
          expiresAt: expiryDate,
          layoutType: formData.layoutType,
          subLayout: formData.subLayout,
          isPoll: activeTab === 'polls',
          pollOptions: activeTab === 'polls' ? pollData.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: 0,
            voters: [],
            votedBy: []
          })) : undefined,
          allowMultipleAnswers: activeTab === 'polls' ? pollData.allowMultipleAnswers : undefined,
          isAnonymous: activeTab === 'polls' ? pollData.isAnonymous : undefined,
          pollExpiresAt: activeTab === 'polls' && pollData.expiresIn !== 'never' 
            ? new Date(Date.now() + parseInt(pollData.expiresIn.replace('days', '')) * 24 * 60 * 60 * 1000).toISOString() 
            : undefined
        });
      }

      await fetchAnnouncements();

      toast.success('Draft saved', {
        description: 'Your draft has been saved successfully'
      });
      
      setTimeout(() => {
        navigate('/admin-announcements');
      }, 1000);
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft', {
        description: 'Please try again later'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublish = async () => {
    // Sanitize input data
    const sanitizedTitle = sanitizeString(formData.title);
    const sanitizedDescription = sanitizeHtml(formData.description); // Use sanitizeHtml to preserve formatting

    if (!sanitizedTitle.trim() || !sanitizedDescription.trim()) {
      toast.error('Required fields missing', {
        description: 'Please fill in title and description'
      });
      return;
    }

    // Validate image requirement for certain layouts
    if ((formData.layoutType === 'content-with-image' || formData.layoutType === 'image-only') && !formData.image) {
      toast.error('Image required', {
        description: `Please upload an image for ${formData.layoutType === 'image-only' ? 'image-only' : 'content with image'} layout`
      });
      return;
    }

    setIsPublishing(true);

    try {
      // If editing, update the announcement and change status to published
      if (editingAnnouncementId) {
        const expiryDays = formData.expiresIn === 'never' ? null : parseInt(formData.expiresIn.replace('days', '').replace('day', ''));
        const expiryDate = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() : undefined;
        const isScheduled = formData.publishType === 'later';
        const scheduledAt = isScheduled && formData.scheduleDate && formData.scheduleTime
          ? new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toISOString()
          : undefined;

        await updateAnnouncement(editingAnnouncementId, {
          title: sanitizedTitle,
          description: sanitizedDescription,
          priority: formData.type === 'event' ? 'high' : 'medium',
          imageUrl: formData.image || undefined,
          category: formData.category,
          isPinned: formData.isPinned,
          status: isScheduled ? 'scheduled' : 'published',
          expiresAt: expiryDate,
          scheduledAt,
          targetDepartments: formData.audience === 'departments' ? formData.selectedAudienceDepts : [],
          notifyByEmail: formData.notifyByEmail,
          layoutType: formData.layoutType,
          subLayout: formData.subLayout
        });

        toast.success(isScheduled ? 'Announcement scheduled!' : 'Announcement updated and published!', {
          description: isScheduled
            ? `Your announcement will be published on ${formData.scheduleDate} at ${formData.scheduleTime}`
            : 'Your announcement has been updated and is now visible to all users'
        });
      } else {
        // Create new announcement
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        // Calculate expiry date for announcement
        const expiryDays = formData.expiresIn === 'never' ? null : parseInt(formData.expiresIn.replace('days', '').replace('day', ''));
        const expiryDate = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() : undefined;
        const isScheduled = formData.publishType === 'later';
        const scheduledAt = isScheduled && formData.scheduleDate && formData.scheduleTime
          ? new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toISOString()
          : undefined;

        // Validate schedule date/time when publishType is 'later'
        if (isScheduled && (!formData.scheduleDate || !formData.scheduleTime)) {
          toast.error('Schedule date & time required', {
            description: 'Please select a date and time for the scheduled publish'
          });
          setIsPublishing(false);
          return;
        }

        await addAnnouncement({
          title: sanitizedTitle,
          description: sanitizedDescription,
          author: user?.name || 'Admin',
          role: user?.role || 'Administrator',
          date: dateStr,
          time: 'Just now',
          avatar: getInitials(user?.name || 'AD'),
          priority: formData.type === 'event' ? 'high' : 'medium',
          imageUrl: formData.image || undefined,
          category: formData.category,
          isPinned: formData.isPinned,
          views: 0,
          status: isScheduled ? 'scheduled' : 'published',
          expiresAt: expiryDate,
          scheduledAt,
          targetDepartments: formData.audience === 'departments' ? formData.selectedAudienceDepts : [],
          notifyByEmail: formData.notifyByEmail,
          layoutType: formData.layoutType,
          subLayout: formData.subLayout
        });

        toast.success(isScheduled ? 'Announcement scheduled!' : 'Announcement published!', {
          description: isScheduled
            ? `Your announcement will be published on ${formData.scheduleDate} at ${formData.scheduleTime}`
            : 'Your announcement is now visible to all users'
        });
      }

      // Refetch announcements to ensure sync
      await fetchAnnouncements();

      setTimeout(() => {
        navigate('/admin-announcements');
      }, 1000);
    } catch (error) {
      console.error('Failed to publish announcement:', error);
      toast.error('Failed to publish', {
        description: 'Please try again later'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Poll helper functions
  const addPollOption = () => {
    if (pollData.options.length >= 6) {
      toast.error('Maximum options reached', {
        description: 'You can add up to 6 options'
      });
      return;
    }
    setPollData(prev => ({
      ...prev,
      options: [...prev.options, { id: Date.now().toString(), text: '' }]
    }));
  };

  const removePollOption = (id: string) => {
    if (pollData.options.length <= 2) {
      toast.error('Minimum options required', {
        description: 'A poll must have at least 2 options'
      });
      return;
    }
    setPollData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== id)
    }));
  };

  const updatePollOption = (id: string, text: string) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map(opt => opt.id === id ? { ...opt, text } : opt)
    }));
  };

  const handlePublishPoll = async () => {
    const sanitizedQuestion = sanitizeString(pollData.question);
    
    if (!sanitizedQuestion.trim()) {
      toast.error('Question required', {
        description: 'Please enter a poll question'
      });
      return;
    }

    const validOptions = pollData.options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      toast.error('Options required', {
        description: 'Please provide at least 2 options'
      });
      return;
    }

    setIsPublishing(true);

    try {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Calculate expiry date
      const expiryDays = pollData.expiresIn === 'never' ? null : parseInt(pollData.expiresIn.replace('days', '').replace('day', ''));
      const expiryDate = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString() : undefined;

      await addAnnouncement({
        title: sanitizedQuestion,
        description: `Poll with ${validOptions.length} options`,
        author: user?.name || 'Admin',
        role: user?.role || 'Administrator',
        date: dateStr,
        time: 'Just now',
        avatar: getInitials(user?.name || 'Admin'),
        priority: 'medium',
        category: pollData.category,
        isPinned: false,
        views: 0,
        // Poll specific fields
        isPoll: true,
        pollOptions: validOptions.map(opt => ({
          id: opt.id,
          text: sanitizeString(opt.text),
          votes: 0,
          votedBy: []
        })),
        allowMultipleAnswers: pollData.allowMultipleAnswers,
        isAnonymous: pollData.isAnonymous,
        pollExpiresAt: expiryDate,
        totalVotes: 0
      });

      await fetchAnnouncements();

      toast.success('Poll published!', {
        description: 'Your poll is now visible to all users'
      });

      setTimeout(() => {
        navigate('/admin-announcements');
      }, 1000);
    } catch (error) {
      console.error('Failed to publish poll:', error);
      toast.error('Failed to publish', {
        description: 'Please try again later'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const applyFormatting = (format: keyof typeof textFormatting) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText = '';
    let cursorOffset = 0;

    if (!selectedText) {
      // No selection, show placeholder text
      toast.info('Select text first', {
        description: 'Please select the text you want to format'
      });
      return;
    }

    switch (format) {
      case 'bold':
        newText = `<strong>${selectedText}</strong>`;
        cursorOffset = 8; // Length of '<strong>'
        break;
      case 'italic':
        newText = `<em>${selectedText}</em>`;
        cursorOffset = 4; // Length of '<em>'
        break;
      case 'bulletList':
        const bulletItems = selectedText.split('\n').filter(line => line.trim());
        newText = bulletItems.map(item => `• ${item}`).join('\n');
        cursorOffset = 0;
        break;
      case 'numberedList':
        const numberedItems = selectedText.split('\n').filter(line => line.trim());
        newText = numberedItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
        cursorOffset = 0;
        break;
      default:
        return;
    }

    const updatedDescription = beforeText + newText + afterText;
    setFormData(prev => ({ ...prev, description: updatedDescription }));

    // Update selection to highlight the newly formatted text
    setTimeout(() => {
      textarea.focus();
      const newStart = start + cursorOffset;
      const newEnd = start + newText.length - (format === 'bold' ? 9 : format === 'italic' ? 5 : 0);
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);

    setTextFormatting(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin-announcements')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{editingAnnouncementId ? 'Edit Announcement' : 'Create New'}</h1>
                <p className="text-sm text-muted-foreground">
                  {editingAnnouncementId ? 'Update your announcement' : 'Create announcements or polls for your organization'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isPublishing}>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              {activeTab === 'announcement' ? (
                <Button onClick={handlePublish} disabled={isPublishing}>
                  <Send className="h-4 w-4 mr-2" />
                  {isPublishing ? (editingAnnouncementId ? 'Updating...' : 'Publishing...') : (editingAnnouncementId ? 'Update' : 'Publish')}
                </Button>
              ) : (
                <Button onClick={handlePublishPoll} disabled={isPublishing}>
                  <Send className="h-4 w-4 mr-2" />
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="announcement" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="polls" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Polls
            </TabsTrigger>
            <TabsTrigger value="surveys" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Surveys
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Announcement Tab */}
          <TabsContent value="announcement">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              {/* LEFT SECTION - Form */}
              <div className="space-y-4">
                {/* Content & Layout */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                      Content & Layout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <>
                      {/* Layout Type Selector */}
                      <div className="space-y-2">
                      <Label className="text-sm font-medium">Layout Style *</Label>
                      <Select
                        value={formData.layoutType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, layoutType: value as LayoutType }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select layout style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content-only">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Content Only</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="content-with-image">
                            <div className="flex items-center gap-2">
                              <FileImage className="h-4 w-4" />
                              <span>Content + Image</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="image-only">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              <span>Image Only</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div 
                      className="transition-all duration-200"
                      style={{
                        maxHeight: formData.layoutType === 'content-with-image' ? '500px' : '0',
                        opacity: formData.layoutType === 'content-with-image' ? 1 : 0,
                        overflow: 'hidden',
                        visibility: formData.layoutType === 'content-with-image' ? 'visible' : 'hidden'
                      }}
                    >
                      <div className="pt-2 space-y-2">
                        <Label className="text-sm font-medium">Image Position *</Label>
                        <Select
                          value={formData.subLayout}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, subLayout: value as SubLayout }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select image position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left-image">
                              <div className="flex items-center gap-2">
                                <span>🖼️|📝</span>
                                <span>Image on Left</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="top-image">
                              <div className="flex items-center gap-2">
                                <span>🖼️/📝</span>
                                <span>Image on Top</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="right-image">
                              <div className="flex items-center gap-2">
                                <span>📝|🖼️</span>
                                <span>Image on Right</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div 
                      className="transition-all duration-200"
                      style={{
                        maxHeight: formData.layoutType !== 'content-only' ? '800px' : '0',
                        opacity: formData.layoutType !== 'content-only' ? 1 : 0,
                        overflow: 'hidden',
                        visibility: formData.layoutType !== 'content-only' ? 'visible' : 'hidden'
                      }}
                    >
                      <div className="pt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-primary" />
                            Image
                          </Label>
                          {(formData.layoutType === 'content-with-image' || formData.layoutType === 'image-only') && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        
                        {formData.image ? (
                          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted/30">
                            <img 
                              src={formData.image} 
                              alt="Announcement header" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="aspect-video border-2 border-dashed rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <div className="text-center p-6">
                              <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm font-medium mb-1">Upload Image</p>
                              <p className="text-xs text-muted-foreground">
                                16:9 ratio
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGetFromPexels}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Pexels
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="transition-all duration-200"
                      style={{
                        maxHeight: formData.layoutType !== 'image-only' ? '100px' : '0',
                        opacity: formData.layoutType !== 'image-only' ? 1 : 0,
                        overflow: 'hidden',
                        visibility: formData.layoutType !== 'image-only' ? 'visible' : 'hidden'
                      }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
                            Content
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Title - Conditional */}
                    <div 
                      className="transition-all duration-200"
                      style={{
                        maxHeight: formData.layoutType !== 'image-only' ? '200px' : '0',
                        opacity: formData.layoutType !== 'image-only' ? 1 : 0,
                        overflow: 'hidden',
                        visibility: formData.layoutType !== 'image-only' ? 'visible' : 'hidden'
                      }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter announcement title..."
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Rich Text Editor - Conditional */}
                    <div 
                      className="transition-all duration-200"
                      style={{
                        maxHeight: formData.layoutType !== 'image-only' ? '600px' : '0',
                        opacity: formData.layoutType !== 'image-only' ? 1 : 0,
                        overflow: 'hidden',
                        visibility: formData.layoutType !== 'image-only' ? 'visible' : 'hidden'
                      }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                        <div className="border rounded-lg bg-background">
                          {/* Toolbar */}
                          <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
                        <Select value={fontFamily} onValueChange={setFontFamily}>
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="serif">Serif</SelectItem>
                            <SelectItem value="mono">Monospace</SelectItem>
                            <SelectItem value="sans">Sans Serif</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button
                          type="button"
                          variant={textFormatting.bold ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => applyFormatting('bold')}
                          title="Bold (wrap with <strong>)"
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant={textFormatting.italic ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => applyFormatting('italic')}
                          title="Italic (wrap with <em>)"
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <Button
                          type="button"
                          variant={textFormatting.bulletList ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => applyFormatting('bulletList')}
                          title="Bullet List"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant={textFormatting.numberedList ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => applyFormatting('numberedList')}
                          title="Numbered List"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                          </div>
                          {/* Text Area */}
                          <Textarea
                            ref={descriptionRef}
                            id="description"
                            placeholder="Write your announcement description here..."
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="min-h-[180px] border-0 focus-visible:ring-0 resize-none"
                            style={{
                              fontFamily: fontFamily === 'default' ? 'inherit' : 
                                         fontFamily === 'serif' ? 'Georgia, serif' :
                                         fontFamily === 'mono' ? 'Consolas, monospace' :
                                         fontFamily === 'sans' ? 'Arial, sans-serif' : 'inherit'
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formData.description.length} characters
                        </p>
                      </div>
                    </div>
                    </>
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company-news">Company News</SelectItem>
                          <SelectItem value="policy-update">Policy Update</SelectItem>
                          <SelectItem value="hr-update">HR Update</SelectItem>
                          <SelectItem value="it-update">IT Update</SelectItem>
                          <SelectItem value="team-update">Team Update</SelectItem>
                          <SelectItem value="event-activity">Event/Activity</SelectItem>
                          <SelectItem value="achievement">Achievement</SelectItem>
                          <SelectItem value="training">Training/Learning</SelectItem>
                          <SelectItem value="facility">Facility Update</SelectItem>
                          <SelectItem value="safety">Safety/Security</SelectItem>
                          <SelectItem value="general">General Information</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pin Announcement */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <div className="space-y-0.5">
                        <Label htmlFor="pinned" className="flex items-center gap-2 text-sm font-medium">
                          <Pin className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                          Pin Announcement
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Show at the top of feed
                        </p>
                      </div>
                      <Switch
                        id="pinned"
                        checked={formData.isPinned}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, isPinned: checked }))
                        }
                      />
                    </div>

                    {/* Announcement Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                        Duration
                      </Label>
                      <Select
                        value={formData.expiresIn}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, expiresIn: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1day">1 Day</SelectItem>
                          <SelectItem value="3days">3 Days</SelectItem>
                          <SelectItem value="7days">7 Days</SelectItem>
                          <SelectItem value="14days">14 Days</SelectItem>
                          <SelectItem value="30days">30 Days</SelectItem>
                          <SelectItem value="90days">90 Days</SelectItem>
                          <SelectItem value="never">No Expiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Needs Acknowledgement */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="space-y-0.5">
                        <Label htmlFor="acknowledgement" className="flex items-center gap-2 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                          Require Acknowledgement
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Users must confirm they've read this
                        </p>
                      </div>
                      <Switch
                        id="acknowledgement"
                        checked={formData.needsAcknowledgement}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, needsAcknowledgement: checked }))
                        }
                      />
                    </div>

                    {/* Publish Scheduling */}
                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-3 space-y-3">
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                          Publish Timing
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">Choose when this announcement goes live</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, publishType: 'now', scheduleDate: '', scheduleTime: '' }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                            formData.publishType === 'now'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          <Send className="h-3.5 w-3.5" />
                          Publish Now
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, publishType: 'later' }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                            formData.publishType === 'later'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Publish Later
                        </button>
                      </div>
                      {formData.publishType === 'later' && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200 dark:border-blue-800">
                          <div className="space-y-1.5 pt-2">
                            <Label className="text-xs font-medium text-blue-700 dark:text-blue-400">Date</Label>
                            <Input
                              type="date"
                              value={formData.scheduleDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                              className="text-sm bg-white dark:bg-background h-9"
                            />
                          </div>
                          <div className="space-y-1.5 pt-2">
                            <Label className="text-xs font-medium text-blue-700 dark:text-blue-400">Time</Label>
                            <Input
                              type="time"
                              value={formData.scheduleTime}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduleTime: e.target.value }))}
                              className="text-sm bg-white dark:bg-background h-9"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Audience */}
                    <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 p-3 space-y-3">
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Users className="h-4 w-4 text-violet-600 dark:text-violet-500" />
                          Audience
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">Who can see this announcement</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, audience: 'all', selectedAudienceDepts: [] }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                            formData.audience === 'all'
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-violet-400 hover:text-violet-600'
                          }`}
                        >
                          <Users className="h-3.5 w-3.5" />
                          All Employees
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, audience: 'departments' }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                            formData.audience === 'departments'
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-violet-400 hover:text-violet-600'
                          }`}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          Select Groups
                        </button>
                      </div>
                      {formData.audience === 'departments' && (
                        <div className="rounded-md border border-violet-200 dark:border-violet-700 bg-white dark:bg-background p-2 space-y-2">
                          <Input
                            placeholder="Search departments..."
                            value={deptSearch}
                            onChange={(e) => setDeptSearch(e.target.value)}
                            className="text-sm h-8 border-0 border-b rounded-none focus-visible:ring-0 px-1"
                          />
                          <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
                            {DEPARTMENTS.filter(d =>
                              d.toLowerCase().includes(deptSearch.toLowerCase())
                            ).map(dept => {
                              const isSelected = formData.selectedAudienceDepts.includes(dept);
                              return (
                                <div
                                  key={dept}
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    selectedAudienceDepts: isSelected
                                      ? prev.selectedAudienceDepts.filter(d => d !== dept)
                                      : [...prev.selectedAudienceDepts, dept]
                                  }))}
                                  className={`flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm select-none transition-colors ${
                                    isSelected
                                      ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-medium'
                                      : 'hover:bg-muted/50'
                                  }`}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => {}}
                                    onClick={(e) => e.stopPropagation()}
                                    className="pointer-events-none"
                                  />
                                  {dept}
                                </div>
                              );
                            })}
                          </div>
                          {formData.selectedAudienceDepts.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1 border-t">
                              {formData.selectedAudienceDepts.map(d => (
                                <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium">
                                  {d}
                                  <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, selectedAudienceDepts: prev.selectedAudienceDepts.filter(x => x !== d) }))}
                                    className="hover:text-violet-900"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notify by Email */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifyEmail" className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-4 w-4 text-sky-600 dark:text-sky-500" />
                          Notify employees with email
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Send an email notification when published
                        </p>
                      </div>
                      <Switch
                        id="notifyEmail"
                        checked={formData.notifyByEmail}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, notifyByEmail: checked }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Attachments */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Upload className="h-5 w-5 text-teal-600 dark:text-teal-500" />
                      Attachments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">

                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => attachmentInputRef.current?.click()}
                    >
                      <input
                        ref={attachmentInputRef}
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={handleAttachmentUpload}
                        className="hidden"
                      />
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Upload Files</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                    {formData.attachments.length > 0 && (
                      <div className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2.5 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT SECTION - Preview Only */}
              <div className="space-y-5">
                {/* Live Preview */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                        Preview
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullPreview(true)}
                      >
                        <Maximize2 className="h-4 w-4 mr-1.5" />
                        Expand
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg min-h-[400px] bg-muted/20">
                  {/* Preview Card with Layout */}
                  <div key={`${formData.layoutType}-${formData.subLayout}`} className="h-full">
                    {/* Layout-based rendering */}
                    {formData.layoutType === 'image-only' ? (
                      /* Image Only Layout */
                      <div className="p-4">
                        {formData.image ? (
                          <div className="w-full overflow-hidden rounded-lg">
                            <img 
                              src={formData.image} 
                              alt="Preview" 
                              className="w-full h-auto object-contain max-h-96"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-sm">Upload an image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : formData.layoutType === 'content-with-image' ? (
                      /* Content with Image Layout */
                      <div className="p-4">
                        {formData.subLayout === 'left-image' ? (
                          <div className="flex gap-4">
                            <div className="w-2/5 flex-shrink-0">
                              {formData.image ? (
                                <img 
                                  src={formData.image} 
                                  alt="Preview" 
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-3">
                              <h3 className="font-semibold text-lg line-clamp-2">
                                {formData.title || 'Announcement Title'}
                              </h3>
                              <p 
                                className="text-sm text-muted-foreground line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: formData.description || 'Your announcement description...' }}
                              />
                            </div>
                          </div>
                        ) : formData.subLayout === 'right-image' ? (
                          <div className="flex gap-4">
                            <div className="flex-1 space-y-3">
                              <h3 className="font-semibold text-lg line-clamp-2">
                                {formData.title || 'Announcement Title'}
                              </h3>
                              <p 
                                className="text-sm text-muted-foreground line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: formData.description || 'Your announcement description...' }}
                              />
                            </div>
                            <div className="w-2/5 flex-shrink-0">
                              {formData.image ? (
                                <img 
                                  src={formData.image} 
                                  alt="Preview" 
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Top Image */
                          <div className="space-y-3">
                            {formData.image ? (
                              <img 
                                src={formData.image} 
                                alt="Preview" 
                                className="w-full h-auto object-cover rounded-lg max-h-64"
                              />
                            ) : (
                              <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <h3 className="font-semibold text-lg line-clamp-2">
                              {formData.title || 'Announcement Title'}
                            </h3>
                            <p 
                              className="text-sm text-muted-foreground"
                              dangerouslySetInnerHTML={{ __html: formData.description || 'Your announcement description...' }}
                            />
                          </div>
                        )}
                        
                        {/* Acknowledgement Badge */}
                        {formData.needsAcknowledgement && (
                          <Badge variant="outline" className="text-xs mt-3">
                            Acknowledgement Required
                          </Badge>
                        )}
                        
                        {/* Engagement Section */}
                        <div className="flex items-center gap-4 pt-3 mt-3 border-t">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">0</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">0</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">0</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Content Only Layout */
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {formData.title || 'Announcement Title'}
                        </h3>

                        <p 
                          className="text-sm text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: formData.description || 'Your announcement description will appear here...' }}
                        />

                        {formData.needsAcknowledgement && (
                          <Badge variant="outline" className="text-xs">
                            Acknowledgement Required
                          </Badge>
                        )}

                        <div className="flex items-center gap-4 pt-2 border-t">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Heart className="h-4 w-4" />
                            <span className="text-sm">0</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm">0</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">0</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          {/* Polls Tab */}
          <TabsContent value="polls">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* LEFT SECTION - Poll Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      Create a Poll
                    </CardTitle>
                    <CardDescription>Create engaging polls to gather feedback from your team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Poll Question */}
                    <div className="space-y-2">
                      <Label htmlFor="question">Question *</Label>
                      <Input
                        id="question"
                        placeholder="Ask your question..."
                        value={pollData.question}
                        onChange={(e) => setPollData(prev => ({ ...prev, question: e.target.value }))}
                        className="text-lg"
                      />
                    </div>

                    {/* Poll Options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Options *</Label>
                        <span className="text-xs text-muted-foreground">{pollData.options.length}/6 options</span>
                      </div>
                      <div className="space-y-2">
                        {pollData.options.map((option, index) => (
                          <div key={option.id} className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-sm font-medium">
                              {index + 1}
                            </div>
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option.text}
                              onChange={(e) => updatePollOption(option.id, e.target.value)}
                              className="flex-1"
                            />
                            {pollData.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => removePollOption(option.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {pollData.options.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-dashed"
                          onClick={addPollOption}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Option
                        </Button>
                      )}
                    </div>

                    {/* Poll Category */}
                    <div className="space-y-2">
                      <Label htmlFor="pollCategory">Category</Label>
                      <Select
                        value={pollData.category}
                        onValueChange={(value) => setPollData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee-feedback">Employee Feedback</SelectItem>
                          <SelectItem value="opinion">Opinion Poll</SelectItem>
                          <SelectItem value="event-planning">Event Planning</SelectItem>
                          <SelectItem value="team-decision">Team Decision</SelectItem>
                          <SelectItem value="preference">Preference Survey</SelectItem>
                          <SelectItem value="satisfaction">Satisfaction Check</SelectItem>
                          <SelectItem value="quick-poll">Quick Poll</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Poll Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="duration">Poll Duration</Label>
                      <Select
                        value={pollData.expiresIn}
                        onValueChange={(value) => setPollData(prev => ({ ...prev, expiresIn: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1day">1 Day</SelectItem>
                          <SelectItem value="3days">3 Days</SelectItem>
                          <SelectItem value="7days">7 Days</SelectItem>
                          <SelectItem value="14days">14 Days</SelectItem>
                          <SelectItem value="30days">30 Days</SelectItem>
                          <SelectItem value="never">No Expiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Poll Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label htmlFor="multipleAnswers" className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Allow Multiple Answers
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Users can select more than one option
                          </p>
                        </div>
                        <Switch
                          id="multipleAnswers"
                          checked={pollData.allowMultipleAnswers}
                          onCheckedChange={(checked) => 
                            setPollData(prev => ({ ...prev, allowMultipleAnswers: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label htmlFor="anonymous" className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            Anonymous Voting
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Hide who voted for which option
                          </p>
                        </div>
                        <Switch
                          id="anonymous"
                          checked={pollData.isAnonymous}
                          onCheckedChange={(checked) => 
                            setPollData(prev => ({ ...prev, isAnonymous: checked }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT SECTION - Poll Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Poll Preview</CardTitle>
                    <CardDescription>How your poll will appear to users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 rounded-xl p-5 space-y-4 bg-purple-50 dark:bg-purple-950/20">
                      {/* Poll Header */}
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full ${getAvatarGradient(user?.name || 'Admin')} flex items-center justify-center text-white font-semibold`}>
                          {getInitials(user?.name || 'AD')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{user?.name || 'Admin'}</span>
                            <Badge variant="secondary" className="text-xs">Poll</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Just now</span>
                            <span>•</span>
                            <span>{pollData.expiresIn === 'never' ? 'No expiry' : `Expires in ${pollData.expiresIn.replace('days', ' days').replace('day', ' day')}`}</span>
                          </div>
                        </div>
                      </div>

                      {/* Poll Question */}
                      <h3 className="font-semibold text-lg">
                        {pollData.question || 'Your poll question will appear here...'}
                      </h3>

                      {/* Poll Options Preview */}
                      <div className="space-y-2">
                        {pollData.options.map((option, index) => (
                          <div
                            key={option.id}
                            className="relative overflow-hidden border-2 rounded-lg p-3 hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer bg-white dark:bg-gray-800"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 ${pollData.allowMultipleAnswers ? 'rounded-md' : ''} border-purple-300 flex items-center justify-center`}>
                                {index === 0 && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                              </div>
                              <span className="text-sm font-medium">
                                {option.text || `Option ${index + 1}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Poll Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>0 votes</span>
                        <div className="flex items-center gap-2">
                          {pollData.isAnonymous && (
                            <Badge variant="outline" className="text-xs">Anonymous</Badge>
                          )}
                          {pollData.allowMultipleAnswers && (
                            <Badge variant="outline" className="text-xs">Multiple Choice</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Poll Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">💡 Tips for Great Polls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Keep questions clear and concise</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Provide balanced and distinct options</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Use anonymous voting for sensitive topics</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Set appropriate duration based on urgency</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              {/* LEFT SECTION - Survey Form */}
              <div className="space-y-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-teal-600" />
                      Survey Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="surveyTitle">Survey Title *</Label>
                      <Input
                        id="surveyTitle"
                        placeholder="e.g., Q1 2026 Employee Satisfaction Survey"
                        value={surveyData.title}
                        onChange={(e) => setSurveyData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surveyDesc">Description *</Label>
                      <Textarea
                        id="surveyDesc"
                        placeholder="Describe the purpose and what you hope to learn..."
                        value={surveyData.description}
                        onChange={(e) => setSurveyData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={surveyData.category}
                        onValueChange={(value) => setSurveyData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee-satisfaction">Employee Satisfaction</SelectItem>
                          <SelectItem value="performance-feedback">Performance Feedback</SelectItem>
                          <SelectItem value="training-needs">Training Needs Assessment</SelectItem>
                          <SelectItem value="workplace-environment">Workplace Environment</SelectItem>
                          <SelectItem value="benefits">Benefits & Compensation</SelectItem>
                          <SelectItem value="leadership">Leadership Feedback</SelectItem>
                          <SelectItem value="work-life-balance">Work-Life Balance</SelectItem>
                          <SelectItem value="general">General Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-teal-600" />
                      Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {surveyData.questions.map((q, index) => (
                      <Card key={q.id} className="border-2">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Question {index + 1}</Label>
                            {surveyData.questions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSurveyData(prev => ({
                                    ...prev,
                                    questions: prev.questions.filter((_, i) => i !== index)
                                  }));
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>

                          <Input
                            placeholder="Enter your question"
                            value={q.questionText}
                            onChange={(e) => {
                              const newQuestions = [...surveyData.questions];
                              newQuestions[index].questionText = e.target.value;
                              setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                            }}
                          />

                          <Select
                            value={q.questionType}
                            onValueChange={(value: any) => {
                              const newQuestions = [...surveyData.questions];
                              newQuestions[index].questionType = value;
                              setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mcq-single">Multiple Choice (Single Answer)</SelectItem>
                              <SelectItem value="mcq-multiple">Multiple Choice (Multiple Answers)</SelectItem>
                              <SelectItem value="text-short">Text Response (Short)</SelectItem>
                              <SelectItem value="text-long">Text Response (Long)</SelectItem>
                              <SelectItem value="rating-5">Rating Scale (1-5)</SelectItem>
                              <SelectItem value="yes-no">Yes/No</SelectItem>
                            </SelectContent>
                          </Select>

                          {(q.questionType === 'mcq-single' || q.questionType === 'mcq-multiple') && (
                            <div className="space-y-2 pl-4 border-l-2">
                              <Label className="text-xs text-muted-foreground">Options</Label>
                              {q.options.map((opt, optIndex) => (
                                <div key={optIndex} className="flex gap-2">
                                  <Input
                                    placeholder={`Option ${optIndex + 1}`}
                                    value={opt}
                                    onChange={(e) => {
                                      const newQuestions = [...surveyData.questions];
                                      newQuestions[index].options[optIndex] = e.target.value;
                                      setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                                    }}
                                  />
                                  {q.options.length > 2 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newQuestions = [...surveyData.questions];
                                        newQuestions[index].options = newQuestions[index].options.filter((_, i) => i !== optIndex);
                                        setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              {q.options.length < 6 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newQuestions = [...surveyData.questions];
                                    newQuestions[index].options.push('');
                                    setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add Option
                                </Button>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={q.isRequired}
                              onCheckedChange={(checked) => {
                                const newQuestions = [...surveyData.questions];
                                newQuestions[index].isRequired = checked;
                                setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                              }}
                            />
                            <Label className="text-sm">Required Question</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {surveyData.questions.length < 20 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSurveyData(prev => ({
                            ...prev,
                            questions: [
                              ...prev.questions,
                              {
                                id: Date.now().toString(),
                                questionText: '',
                                questionType: 'mcq-single',
                                options: ['', ''],
                                isRequired: true
                              }
                            ]
                          }));
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-teal-600" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Input
                          type="date"
                          value={surveyData.startDate}
                          onChange={(e) => setSurveyData(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date *</Label>
                        <Input
                          type="date"
                          value={surveyData.endDate}
                          onChange={(e) => setSurveyData(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <Label>Allow Anonymous Responses</Label>
                        <p className="text-xs text-muted-foreground">Respondents can submit without revealing identity</p>
                      </div>
                      <Switch
                        checked={surveyData.allowAnonymous}
                        onCheckedChange={(checked) => setSurveyData(prev => ({ ...prev, allowAnonymous: checked }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Target Audience *</Label>
                      <Select
                        value={surveyData.targetAudience}
                        onValueChange={(value: any) => setSurveyData(prev => ({ ...prev, targetAudience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Employees</SelectItem>
                          <SelectItem value="departments">Specific Departments</SelectItem>
                          <SelectItem value="custom">Custom List</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT SECTION - Preview */}
              <div className="space-y-6">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Survey Preview</CardTitle>
                    <CardDescription>How your survey will appear to employees</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border-2 rounded-lg bg-teal-50 dark:bg-teal-950/20">
                      <h3 className="font-bold text-lg mb-2">{surveyData.title || 'Survey Title'}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {surveyData.description || 'Survey description will appear here...'}
                      </p>
                      <div className="space-y-4">
                        {surveyData.questions.map((q, i) => (
                          <div key={q.id} className="p-3 bg-background rounded border">
                            <p className="font-medium text-sm mb-2">
                              {i + 1}. {q.questionText || `Question ${i + 1}`}
                              {q.isRequired && <span className="text-red-500 ml-1">*</span>}
                            </p>
                            {q.questionType === 'text-short' && (
                              <Input placeholder="Short answer" disabled className="mt-2" />
                            )}
                            {q.questionType === 'text-long' && (
                              <Textarea placeholder="Long answer" disabled className="mt-2" rows={3} />
                            )}
                            {(q.questionType === 'mcq-single' || q.questionType === 'mcq-multiple') && (
                              <div className="space-y-1 mt-2">
                                {q.options.map((opt, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <div className={`w-4 h-4 border rounded ${q.questionType === 'mcq-multiple' ? 'rounded-sm' : 'rounded-full'}`} />
                                    {opt || `Option ${idx + 1}`}
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.questionType === 'rating-5' && (
                              <div className="flex gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <div key={n} className="w-8 h-8 border rounded flex items-center justify-center text-sm">{n}</div>
                                ))}
                              </div>
                            )}
                            {q.questionType === 'yes-no' && (
                              <div className="flex gap-4 mt-2">
                                <Button variant="outline" size="sm" disabled>Yes</Button>
                                <Button variant="outline" size="sm" disabled>No</Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-4">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Active: {surveyData.startDate || 'Start Date'} to {surveyData.endDate || 'End Date'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              {/* LEFT SECTION - Event Form */}
              <div className="space-y-4">
                {/* Event Details */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      Event Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventTitle">Event Title *</Label>
                      <Input
                        id="eventTitle"
                        placeholder="e.g., Annual Town Hall Meeting 2026"
                        value={eventData.title}
                        onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDesc">Description *</Label>
                      <Textarea
                        id="eventDesc"
                        placeholder="Describe the event, agenda, and what attendees should know..."
                        value={eventData.description}
                        onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Event Type *</Label>
                        <Select
                          value={eventData.eventType}
                          onValueChange={(value) => setEventData(prev => ({ ...prev, eventType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="celebration">Celebration</SelectItem>
                            <SelectItem value="town-hall">Town Hall Meeting</SelectItem>
                            <SelectItem value="training">Training/Workshop</SelectItem>
                            <SelectItem value="team-building">Team Building</SelectItem>
                            <SelectItem value="awards">Awards Ceremony</SelectItem>
                            <SelectItem value="social">Social Event</SelectItem>
                            <SelectItem value="meeting">Business Meeting</SelectItem>
                            <SelectItem value="wellness">Wellness Activity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select
                          value={eventData.category}
                          onValueChange={(value) => setEventData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="company-wide">Company-Wide</SelectItem>
                            <SelectItem value="department">Department-Specific</SelectItem>
                            <SelectItem value="location">Location-Specific</SelectItem>
                            <SelectItem value="team">Team Event</SelectItem>
                            <SelectItem value="optional">Optional/Social</SelectItem>
                            <SelectItem value="mandatory">Mandatory/Required</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Time */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
                        <Input
                          type="date"
                          value={eventData.startDate}
                          onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Time *</Label>
                        <Input
                          type="time"
                          value={eventData.startTime}
                          onChange={(e) => setEventData(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={eventData.endDate}
                          onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time *</Label>
                        <Input
                          type="time"
                          value={eventData.endTime}
                          onChange={(e) => setEventData(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pin className="h-5 w-5 text-amber-600" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Event Mode *</Label>
                      <Select
                        value={eventData.mode}
                        onValueChange={(value: any) => setEventData(prev => ({ ...prev, mode: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-person">In-Person</SelectItem>
                          <SelectItem value="virtual">Virtual (Online)</SelectItem>
                          <SelectItem value="hybrid">Hybrid (In-Person + Virtual)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(eventData.mode === 'in-person' || eventData.mode === 'hybrid') && (
                      <>
                        <div className="space-y-2">
                          <Label>Venue Name *</Label>
                          <Input
                            placeholder="e.g., Conference Room A, Main Auditorium"
                            value={eventData.venue}
                            onChange={(e) => setEventData(prev => ({ ...prev, venue: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Textarea
                            placeholder="Full address with building/floor details"
                            value={eventData.address}
                            onChange={(e) => setEventData(prev => ({ ...prev, address: e.target.value }))}
                            rows={2}
                          />
                        </div>
                      </>
                    )}

                    {(eventData.mode === 'virtual' || eventData.mode === 'hybrid') && (
                      <div className="space-y-2">
                        <Label>Virtual Meeting Link *</Label>
                        <Input
                          placeholder="Zoom/Teams/Meet link"
                          value={eventData.virtualLink}
                          onChange={(e) => setEventData(prev => ({ ...prev, virtualLink: e.target.value }))}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* RSVP & Settings */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-amber-600" />
                      RSVP & Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <Label>Enable RSVP</Label>
                        <p className="text-xs text-muted-foreground">Allow attendees to confirm attendance</p>
                      </div>
                      <Switch
                        checked={eventData.enableRSVP}
                        onCheckedChange={(checked) => setEventData(prev => ({ ...prev, enableRSVP: checked }))}
                      />
                    </div>

                    {eventData.enableRSVP && (
                      <div className="space-y-2">
                        <Label>Max Attendees (optional)</Label>
                        <Input
                          type="number"
                          placeholder="Leave blank for unlimited"
                          value={eventData.maxAttendees}
                          onChange={(e) => setEventData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Organizer</Label>
                        <Input
                          value={eventData.organizer}
                          onChange={(e) => setEventData(prev => ({ ...prev, organizer: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Email</Label>
                        <Input
                          type="email"
                          value={eventData.contactEmail}
                          onChange={(e) => setEventData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Audience *</Label>
                      <Select
                        value={eventData.targetAudience}
                        onValueChange={(value: any) => setEventData(prev => ({ ...prev, targetAudience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Employees</SelectItem>
                          <SelectItem value="departments">Specific Departments</SelectItem>
                          <SelectItem value="custom">Custom List</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT SECTION - Preview */}
              <div className="space-y-6">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Event Preview</CardTitle>
                    <CardDescription>How your event will appear to employees</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{eventData.title || 'Event Title'}</h3>
                          <Badge className="mt-1" variant="outline">{eventData.eventType || 'Event Type'}</Badge>
                        </div>
                        <Badge className="bg-amber-500 text-white">
                          <Calendar className="h-3 w-3 mr-1" />
                          Event
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {eventData.description || 'Event description will appear here...'}
                      </p>

                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-amber-600" />
                          <span className="font-medium">
                            {eventData.startDate ? new Date(eventData.startDate).toLocaleDateString() : 'Date'} 
                            {eventData.startTime && ` at ${eventData.startTime}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span>
                            {eventData.startTime || 'Start Time'} - {eventData.endTime || 'End Time'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Pin className="h-4 w-4 text-amber-600" />
                          <span>
                            {eventData.mode === 'virtual' ? 'Virtual Event' : 
                             eventData.mode === 'hybrid' ? 'Hybrid Event' :
                             eventData.venue || 'Venue Name'}
                          </span>
                        </div>

                        {eventData.enableRSVP && (
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-amber-600" />
                            <span>RSVP Required</span>
                            {eventData.maxAttendees && <span className="text-muted-foreground">• Max {eventData.maxAttendees} attendees</span>}
                          </div>
                        )}
                      </div>

                      {eventData.enableRSVP && (
                        <div className="pt-3 border-t">
                          <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            RSVP Now
                          </Button>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        <User className="h-3 w-3 inline mr-1" />
                        Organized by {eventData.organizer || 'Organizer'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Full Screen Preview Modal */}
      {isFullPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="font-semibold">Full Preview</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullPreview(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              {formData.image && (
                <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">
                  {formData.title || 'Announcement Title'}
                </h1>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {formData.description || 'Your announcement description will appear here...'}
                </p>
                {formData.needsAcknowledgement && (
                  <Badge variant="outline">
                    Acknowledgement Required
                  </Badge>
                )}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    <span>0</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>0</span>
                  </Button>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">0 views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

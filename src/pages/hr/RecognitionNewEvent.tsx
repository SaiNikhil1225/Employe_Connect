import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeStore } from '@/store/employeeStore';
import { useAuthStore } from '@/store/authStore';
import { useRecognitionPostStore } from '@/store/recognitionPostStore';
import { useAnnouncementStore } from '@/store/announcementStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { getInitials, getAvatarGradient } from '@/constants/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  Send,
  Cake,
  Award,
  Building2,
  Calendar as CalendarIcon,
  Eye,
  Mail,
  Heart,
  MessageCircle,
  Clock,
  Upload,
  X,
  Image as ImageIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  FileText,
  FileImage,
  Pin,
  CheckCircle2,
  Users,
  Search,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

type LayoutType = 'content-only' | 'content-with-image' | 'image-only';
type SubLayout = 'left-image' | 'top-image' | 'right-image';

interface BirthdayFormData {
  employeeName: string;
  birthdayDate: string;
  title: string;
  message: string;
  layoutType: LayoutType;
  subLayout: SubLayout;
  bannerImage: string | null;
  category: string;
  isPinned: boolean;
  needsAcknowledgement: boolean;
  expiresIn: string;
  publishType: 'now' | 'later';
  scheduleDate: string;
  scheduleTime: string;
  audience: 'all' | 'departments';
  selectedAudienceDepts: string[];
  notifyByEmail: boolean;
}

interface AnniversaryFormData {
  employeeName: string;
  joiningDate: string;
  yearsOfService: number | '';
  milestone: string;
  title: string;
  message: string;
  layoutType: LayoutType;
  subLayout: SubLayout;
  bannerImage: string | null;
  category: string;
  isPinned: boolean;
  needsAcknowledgement: boolean;
  expiresIn: string;
  publishType: 'now' | 'later';
  scheduleDate: string;
  scheduleTime: string;
  audience: 'all' | 'departments';
  selectedAudienceDepts: string[];
  notifyByEmail: boolean;
}

const DEPARTMENTS = [
  'Engineering','Product','Design','Marketing','Sales','Human Resources',
  'Finance','Operations','Legal','Customer Success','IT','Data & Analytics',
  'Research','Administration'
];

const getTextContent = (html: string) =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

export function RecognitionNewEvent() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addPost } = useRecognitionPostStore();
  const { addAnnouncement } = useAnnouncementStore();
  const { employees: storeEmployees, fetchEmployees } = useEmployeeStore();
  const EMPLOYEES = storeEmployees
    .filter(e => e.status === 'active')
    .map(e => e.name)
    .sort();

  useEffect(() => {
    if (storeEmployees.length === 0) {
      fetchEmployees();
    }
  }, []);

  const [activeTab, setActiveTab] = useState('birthday');
  const [isPublishing, setIsPublishing] = useState(false);

  const bdFileRef = useRef<HTMLInputElement>(null);
  const annFileRef = useRef<HTMLInputElement>(null);
  const bdEditorRef = useRef<HTMLDivElement>(null);
  const annEditorRef = useRef<HTMLDivElement>(null);
  const [bdFontFamily, setBdFontFamily] = useState('default');
  const [annFontFamily, setAnnFontFamily] = useState('default');

  // Employee search dropdowns
  const [bdEmpSearch, setBdEmpSearch] = useState('');
  const [bdShowEmp, setBdShowEmp] = useState(false);
  const [annEmpSearch, setAnnEmpSearch] = useState('');
  const [annShowEmp, setAnnShowEmp] = useState(false);

  // Date picker open state
  const [bdDateOpen, setBdDateOpen] = useState(false);
  const [annDateOpen, setAnnDateOpen] = useState(false);

  // Dept audience search
  const [bdDeptSearch, setBdDeptSearch] = useState('');
  const [annDeptSearch, setAnnDeptSearch] = useState('');

  // Rich text helpers
  const execBdFormat = (cmd: string) => {
    document.execCommand(cmd, false);
    setBirthdayData(p => ({ ...p, message: bdEditorRef.current?.innerHTML || '' }));
  };
  const execAnnFormat = (cmd: string) => {
    document.execCommand(cmd, false);
    setAnniversaryData(p => ({ ...p, message: annEditorRef.current?.innerHTML || '' }));
  };
  const bdFontStyle = bdFontFamily === 'serif' ? 'Georgia, serif' : bdFontFamily === 'mono' ? 'Consolas, monospace' : bdFontFamily === 'sans' ? 'Arial, sans-serif' : 'inherit';
  const annFontStyle = annFontFamily === 'serif' ? 'Georgia, serif' : annFontFamily === 'mono' ? 'Consolas, monospace' : annFontFamily === 'sans' ? 'Arial, sans-serif' : 'inherit';

  const [birthdayData, setBirthdayData] = useState<BirthdayFormData>({
    employeeName: '',
    birthdayDate: '',
    title: '',
    message: '',
    layoutType: 'content-only',
    subLayout: 'left-image',
    bannerImage: null,
    category: 'recognition',
    isPinned: false,
    needsAcknowledgement: false,
    expiresIn: '7days',
    publishType: 'now',
    scheduleDate: '',
    scheduleTime: '',
    audience: 'all',
    selectedAudienceDepts: [],
    notifyByEmail: true,
  });

  const [anniversaryData, setAnniversaryData] = useState<AnniversaryFormData>({
    employeeName: '',
    joiningDate: '',
    yearsOfService: '',
    milestone: '',
    title: '',
    message: '',
    layoutType: 'content-only',
    subLayout: 'left-image',
    bannerImage: null,
    category: 'recognition',
    isPinned: false,
    needsAcknowledgement: false,
    expiresIn: '7days',
    publishType: 'now',
    scheduleDate: '',
    scheduleTime: '',
    audience: 'all',
    selectedAudienceDepts: [],
    notifyByEmail: true,
  });

  const handleBannerUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    tab: 'birthday' | 'anniversary'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 20MB' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (tab === 'birthday') setBirthdayData(prev => ({ ...prev, bannerImage: reader.result as string }));
      else setAnniversaryData(prev => ({ ...prev, bannerImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handlePublishBirthday = async () => {
    if (!birthdayData.employeeName.trim()) { toast.error('Employee name is required'); return; }
    if (!birthdayData.birthdayDate) { toast.error('Birthday date is required'); return; }
    if (birthdayData.layoutType !== 'image-only' && !getTextContent(birthdayData.message)) { toast.error('Message is required'); return; }
    if (birthdayData.layoutType !== 'content-only' && !birthdayData.bannerImage) { toast.error('Image is required for this layout'); return; }
    setIsPublishing(true);
    try {
      await new Promise(res => setTimeout(res, 800));
      // Save to recognition-post store (localStorage) for the HR Recognition & Celebrations page
      addPost({
        type: 'birthday',
        employeeName: birthdayData.employeeName,
        title: birthdayData.title,
        message: birthdayData.message,
        layoutType: birthdayData.layoutType,
        subLayout: birthdayData.subLayout,
        bannerImage: birthdayData.bannerImage,
        category: birthdayData.category,
        isPinned: birthdayData.isPinned,
        needsAcknowledgement: birthdayData.needsAcknowledgement,
        expiresIn: birthdayData.expiresIn,
        publishType: birthdayData.publishType,
        scheduleDate: birthdayData.scheduleDate,
        scheduleTime: birthdayData.scheduleTime,
        audience: birthdayData.audience,
        selectedAudienceDepts: birthdayData.selectedAudienceDepts,
        notifyByEmail: birthdayData.notifyByEmail,
        birthdayDate: birthdayData.birthdayDate,
        publishedBy: user?.name || 'HR Admin',
        status: birthdayData.publishType === 'later' ? 'scheduled' : 'published',
      });
      // Also persist to MongoDB so every employee sees it in Company Announcements
      if (birthdayData.publishType !== 'later') {
        const today = new Date();
        await addAnnouncement({
          title: birthdayData.title,
          description: birthdayData.message,
          author: user?.name || 'HR Admin',
          authorId: user?.id,
          employeeId: user?.employeeId,
          role: user?.role || 'HR',
          date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: 'Just now',
          avatar: getInitials(user?.name || 'HR'),
          priority: 'medium',
          imageUrl: birthdayData.bannerImage || undefined,
          category: 'celebration',
          isPinned: birthdayData.isPinned,
          views: 0,
          status: 'published',
          reactions: [],
        });
      }
      toast.success('Birthday recognition published!', {
        description: `Birthday wishes for ${birthdayData.employeeName} have been saved.`,
      });
      setTimeout(() => navigate('/hr/recognition-celebrations'), 1000);
    } catch {
      toast.error('Failed to publish', { description: 'Please try again later' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishAnniversary = async () => {
    if (!anniversaryData.employeeName.trim()) { toast.error('Employee name is required'); return; }
    if (!anniversaryData.joiningDate) { toast.error('Joining date is required'); return; }
    if (anniversaryData.layoutType !== 'image-only' && !getTextContent(anniversaryData.message)) { toast.error('Message is required'); return; }
    if (anniversaryData.layoutType !== 'content-only' && !anniversaryData.bannerImage) { toast.error('Image is required for this layout'); return; }
    setIsPublishing(true);
    try {
      await new Promise(res => setTimeout(res, 800));
      // Save to recognition-post store (localStorage) for the HR Recognition & Celebrations page
      addPost({
        type: 'anniversary',
        employeeName: anniversaryData.employeeName,
        title: anniversaryData.title,
        message: anniversaryData.message,
        layoutType: anniversaryData.layoutType,
        subLayout: anniversaryData.subLayout,
        bannerImage: anniversaryData.bannerImage,
        category: anniversaryData.category,
        isPinned: anniversaryData.isPinned,
        needsAcknowledgement: anniversaryData.needsAcknowledgement,
        expiresIn: anniversaryData.expiresIn,
        publishType: anniversaryData.publishType,
        scheduleDate: anniversaryData.scheduleDate,
        scheduleTime: anniversaryData.scheduleTime,
        audience: anniversaryData.audience,
        selectedAudienceDepts: anniversaryData.selectedAudienceDepts,
        notifyByEmail: anniversaryData.notifyByEmail,
        joiningDate: anniversaryData.joiningDate,
        yearsOfService: anniversaryData.yearsOfService,
        milestone: anniversaryData.milestone,
        publishedBy: user?.name || 'HR Admin',
        status: anniversaryData.publishType === 'later' ? 'scheduled' : 'published',
      });
      // Also persist to MongoDB so every employee sees it in Company Announcements
      if (anniversaryData.publishType !== 'later') {
        const today = new Date();
        await addAnnouncement({
          title: anniversaryData.title,
          description: anniversaryData.message,
          author: user?.name || 'HR Admin',
          authorId: user?.id,
          employeeId: user?.employeeId,
          role: user?.role || 'HR',
          date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: 'Just now',
          avatar: getInitials(user?.name || 'HR'),
          priority: 'medium',
          imageUrl: anniversaryData.bannerImage || undefined,
          category: 'achievement',
          isPinned: anniversaryData.isPinned,
          views: 0,
          status: 'published',
          reactions: [],
        });
      }
      toast.success('Anniversary recognition published!', {
        description: `Work anniversary for ${anniversaryData.employeeName} has been saved.`,
      });
      setTimeout(() => navigate('/hr/recognition-celebrations'), 1000);
    } catch {
      toast.error('Failed to publish', { description: 'Please try again later' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved', { description: 'Your draft has been saved successfully' });
  };

  const computedYears = (joining: string): number => {
    if (!joining) return 1;
    const diff = new Date().getFullYear() - new Date(joining).getFullYear();
    return diff > 0 ? diff : 1;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/hr/recognition-celebrations')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create Recognition</h1>
                <p className="text-sm text-muted-foreground">
                  Celebrate birthdays and work anniversaries for your team
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSaveDraft} disabled={isPublishing}>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={activeTab === 'birthday' ? handlePublishBirthday : handlePublishAnniversary}
                disabled={isPublishing}
              >
                <Send className="h-4 w-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="birthday" className="flex items-center gap-2">
              <Cake className="h-4 w-4" />
              Birthday
            </TabsTrigger>
            <TabsTrigger value="anniversary" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Anniversary
            </TabsTrigger>
          </TabsList>

          {/* ──────────── Birthday Tab ──────────── */}
          <TabsContent value="birthday">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              {/* Form */}
              <div className="space-y-4">

                {/* Content & Layout Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                      Content & Layout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Layout Style Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Layout Style *</label>
                      <Select
                        value={birthdayData.layoutType}
                        onValueChange={v => setBirthdayData(p => ({ ...p, layoutType: v as LayoutType }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Select layout style" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content-only"><div className="flex items-center gap-2"><FileText className="h-4 w-4" /><span>Content Only</span></div></SelectItem>
                          <SelectItem value="content-with-image"><div className="flex items-center gap-2"><FileImage className="h-4 w-4" /><span>Content + Image</span></div></SelectItem>
                          <SelectItem value="image-only"><div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /><span>Image Only</span></div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Image Position (only for content-with-image) */}
                    <div className="transition-all duration-200" style={{ maxHeight: birthdayData.layoutType === 'content-with-image' ? '200px' : '0', opacity: birthdayData.layoutType === 'content-with-image' ? 1 : 0, overflow: 'hidden', visibility: birthdayData.layoutType === 'content-with-image' ? 'visible' : 'hidden' }}>
                      <div className="pt-2 space-y-2">
                        <label className="text-sm font-medium">Image Position *</label>
                        <Select value={birthdayData.subLayout} onValueChange={v => setBirthdayData(p => ({ ...p, subLayout: v as SubLayout }))}>
                          <SelectTrigger><SelectValue placeholder="Select image position" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left-image"><div className="flex items-center gap-2"><span>🖼️|📝</span><span>Image on Left</span></div></SelectItem>
                            <SelectItem value="top-image"><div className="flex items-center gap-2"><span>🖼️/📝</span><span>Image on Top</span></div></SelectItem>
                            <SelectItem value="right-image"><div className="flex items-center gap-2"><span>📝|🖼️</span><span>Image on Right</span></div></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Banner Image Upload */}
                    <div className="transition-all duration-200" style={{ maxHeight: birthdayData.layoutType !== 'content-only' ? '400px' : '0', opacity: birthdayData.layoutType !== 'content-only' ? 1 : 0, overflow: 'hidden', visibility: birthdayData.layoutType !== 'content-only' ? 'visible' : 'hidden' }}>
                      <div className="pt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" />Image</label>
                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-medium">Required</span>
                        </div>
                        {birthdayData.bannerImage ? (
                          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted/30">
                            <img src={birthdayData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                            <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setBirthdayData(p => ({ ...p, bannerImage: null }))}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <div className="aspect-video border-2 border-dashed rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => bdFileRef.current?.click()}>
                            <div className="text-center p-6"><ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm font-medium mb-1">Upload Image</p><p className="text-xs text-muted-foreground">16:9 ratio recommended</p></div>
                          </div>
                        )}
                        <input ref={bdFileRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={e => handleBannerUpload(e, 'birthday')} className="hidden" />
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => bdFileRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Upload Image</Button>
                      </div>
                    </div>

                    {/* Content divider */}
                    <div className="transition-all duration-200" style={{ maxHeight: birthdayData.layoutType !== 'image-only' ? '60px' : '0', opacity: birthdayData.layoutType !== 'image-only' ? 1 : 0, overflow: 'hidden', visibility: birthdayData.layoutType !== 'image-only' ? 'visible' : 'hidden' }}>
                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />Content</span></div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="transition-all duration-200" style={{ maxHeight: birthdayData.layoutType !== 'image-only' ? '120px' : '0', opacity: birthdayData.layoutType !== 'image-only' ? 1 : 0, overflow: 'hidden', visibility: birthdayData.layoutType !== 'image-only' ? 'visible' : 'hidden' }}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="e.g., Happy Birthday Sarah! 🎂"
                          value={birthdayData.title}
                          onChange={e => setBirthdayData(p => ({ ...p, title: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Rich-text message editor */}
                    <div className="transition-all duration-200" style={{ maxHeight: birthdayData.layoutType !== 'image-only' ? '400px' : '0', opacity: birthdayData.layoutType !== 'image-only' ? 1 : 0, overflow: 'hidden', visibility: birthdayData.layoutType !== 'image-only' ? 'visible' : 'hidden' }}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Greeting Message *</label>
                        <div className="border rounded-lg bg-background">
                          <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
                            <Select value={bdFontFamily} onValueChange={setBdFontFamily}>
                              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Font" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="serif">Serif</SelectItem>
                                <SelectItem value="mono">Monospace</SelectItem>
                                <SelectItem value="sans">Sans Serif</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="w-px h-6 bg-border mx-1" />
                            <Button type="button" variant="ghost" size="sm" title="Bold"
                              onMouseDown={e => { e.preventDefault(); execBdFormat('bold'); }}>
                              <Bold className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" title="Italic"
                              onMouseDown={e => { e.preventDefault(); execBdFormat('italic'); }}>
                              <Italic className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-6 bg-border mx-1" />
                            <Button type="button" variant="ghost" size="sm" title="Bullet List"
                              onMouseDown={e => { e.preventDefault(); execBdFormat('insertUnorderedList'); }}>
                              <List className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" title="Numbered List"
                              onMouseDown={e => { e.preventDefault(); execBdFormat('insertOrderedList'); }}>
                              <ListOrdered className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="relative">
                            {!getTextContent(birthdayData.message) && (
                              <span className="absolute top-3 left-3 text-sm text-muted-foreground pointer-events-none select-none">
                                Write a warm birthday message for the employee...
                              </span>
                            )}
                            <div
                              ref={bdEditorRef}
                              contentEditable
                              suppressContentEditableWarning
                              onInput={() => setBirthdayData(p => ({ ...p, message: bdEditorRef.current?.innerHTML || '' }))}
                              className="min-h-[150px] p-3 text-sm outline-none [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-0.5 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic"
                              style={{ fontFamily: bdFontStyle }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{getTextContent(birthdayData.message).length} characters</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Cake className="h-5 w-5 text-pink-500" />
                      Birthday Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Searchable Employee Dropdown */}
                    <div className="space-y-2">
                      <Label>Employee *</Label>
                      <div className="relative">
                        <div
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:border-input transition-colors"
                          onClick={() => { setBdShowEmp(v => !v); setBdEmpSearch(''); }}
                        >
                          <span className={birthdayData.employeeName ? '' : 'text-muted-foreground'}>
                            {birthdayData.employeeName || 'Search and select employee...'}
                          </span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {bdShowEmp && (
                          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                            <div className="flex items-center gap-2 px-3 py-2 border-b">
                              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                              <input
                                autoFocus
                                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                                placeholder="Type to search..."
                                value={bdEmpSearch}
                                onChange={e => setBdEmpSearch(e.target.value)}
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto py-1">
                              {EMPLOYEES.filter(e => e.toLowerCase().includes(bdEmpSearch.toLowerCase())).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-3">No employees found</p>
                              ) : (
                                EMPLOYEES.filter(e => e.toLowerCase().includes(bdEmpSearch.toLowerCase())).map(emp => (
                                  <div
                                    key={emp}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors ${birthdayData.employeeName === emp ? 'bg-muted font-medium' : ''}`}
                                    onClick={() => { setBirthdayData(p => ({ ...p, employeeName: emp })); setBdShowEmp(false); }}
                                  >
                                    <div className={`w-7 h-7 rounded-full ${getAvatarGradient(emp)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>{getInitials(emp)}</div>
                                    {emp}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Birthday Date Picker */}
                    <div className="space-y-2">
                      <Label>Birthday Date *</Label>
                      <Popover open={bdDateOpen} onOpenChange={setBdDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {birthdayData.birthdayDate
                              ? format(new Date(birthdayData.birthdayDate + 'T00:00:00'), 'PPP')
                              : 'Select birthday date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            selected={birthdayData.birthdayDate ? new Date(birthdayData.birthdayDate + 'T00:00:00') : undefined}
                            onSelect={(date) => {
                              setBirthdayData(p => ({ ...p, birthdayDate: date ? format(date, 'yyyy-MM-dd') : '' }));
                              setBdDateOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings — Birthday */}
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
                      <Label className="text-sm font-medium">Category</Label>
                      <Select value={birthdayData.category} onValueChange={v => setBirthdayData(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recognition">Recognition</SelectItem>
                          <SelectItem value="birthday">Birthday</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                          <SelectItem value="appreciation">Appreciation</SelectItem>
                          <SelectItem value="hr-update">HR Update</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pin */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2 text-sm font-medium"><Pin className="h-4 w-4 text-amber-600 dark:text-amber-500" />Pin Recognition</Label>
                        <p className="text-xs text-muted-foreground">Show at the top of feed</p>
                      </div>
                      <Switch checked={birthdayData.isPinned} onCheckedChange={v => setBirthdayData(p => ({ ...p, isPinned: v }))} />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium"><Clock className="h-4 w-4 text-blue-600 dark:text-blue-500" />Duration</Label>
                      <Select value={birthdayData.expiresIn} onValueChange={v => setBirthdayData(p => ({ ...p, expiresIn: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
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

                    {/* Acknowledgement */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />Require Acknowledgement</Label>
                        <p className="text-xs text-muted-foreground">Users must confirm they've read this</p>
                      </div>
                      <Switch checked={birthdayData.needsAcknowledgement} onCheckedChange={v => setBirthdayData(p => ({ ...p, needsAcknowledgement: v }))} />
                    </div>

                    {/* Publish Timing */}
                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-3 space-y-3">
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium"><CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-500" />Publish Timing</Label>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">Choose when this recognition goes live</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setBirthdayData(p => ({ ...p, publishType: 'now', scheduleDate: '', scheduleTime: '' }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${birthdayData.publishType === 'now' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600'}`}>
                          <Send className="h-3.5 w-3.5" />Publish Now
                        </button>
                        <button type="button" onClick={() => setBirthdayData(p => ({ ...p, publishType: 'later' }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${birthdayData.publishType === 'later' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600'}`}>
                          <Clock className="h-3.5 w-3.5" />Publish Later
                        </button>
                      </div>
                      {birthdayData.publishType === 'later' && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200 dark:border-blue-800">
                          <div className="space-y-1.5 pt-2">
                            <Label className="text-xs font-medium text-blue-700 dark:text-blue-400">Date</Label>
                            <Input type="date" value={birthdayData.scheduleDate} min={new Date().toISOString().split('T')[0]}
                              onChange={e => setBirthdayData(p => ({ ...p, scheduleDate: e.target.value }))} className="text-sm bg-white dark:bg-background h-9" />
                          </div>
                          <div className="space-y-1.5 pt-2">
                            <Label className="text-xs font-medium text-blue-700 dark:text-blue-400">Time</Label>
                            <Input type="time" value={birthdayData.scheduleTime}
                              onChange={e => setBirthdayData(p => ({ ...p, scheduleTime: e.target.value }))} className="text-sm bg-white dark:bg-background h-9" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Audience */}
                    <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 p-3 space-y-3">
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-violet-600 dark:text-violet-500" />Audience</Label>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">Who can see this recognition</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setBirthdayData(p => ({ ...p, audience: 'all', selectedAudienceDepts: [] }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${birthdayData.audience === 'all' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-violet-400 hover:text-violet-600'}`}>
                          <Users className="h-3.5 w-3.5" />All Employees
                        </button>
                        <button type="button" onClick={() => setBirthdayData(p => ({ ...p, audience: 'departments' }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${birthdayData.audience === 'departments' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-violet-400 hover:text-violet-600'}`}>
                          <Building2 className="h-3.5 w-3.5" />Select Groups
                        </button>
                      </div>
                      {birthdayData.audience === 'departments' && (
                        <div className="rounded-md border border-violet-200 dark:border-violet-700 bg-white dark:bg-background p-2 space-y-2">
                          <Input placeholder="Search departments..." value={bdDeptSearch} onChange={e => setBdDeptSearch(e.target.value)}
                            className="text-sm h-8 border-0 border-b rounded-none focus-visible:ring-0 px-1" />
                          <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
                            {DEPARTMENTS.filter(d => d.toLowerCase().includes(bdDeptSearch.toLowerCase())).map(dept => {
                              const isSel = birthdayData.selectedAudienceDepts.includes(dept);
                              return (
                                <div key={dept}
                                  onClick={() => setBirthdayData(p => ({ ...p, selectedAudienceDepts: isSel ? p.selectedAudienceDepts.filter(x => x !== dept) : [...p.selectedAudienceDepts, dept] }))}
                                  className={`flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm select-none transition-colors ${isSel ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-medium' : 'hover:bg-muted/50'}`}>
                                  <Checkbox checked={isSel} onCheckedChange={() => {}} onClick={e => e.stopPropagation()} className="pointer-events-none" />
                                  {dept}
                                </div>
                              );
                            })}
                          </div>
                          {birthdayData.selectedAudienceDepts.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1 border-t">
                              {birthdayData.selectedAudienceDepts.map(d => (
                                <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium">
                                  {d}
                                  <button type="button" onClick={() => setBirthdayData(p => ({ ...p, selectedAudienceDepts: p.selectedAudienceDepts.filter(x => x !== d) }))} className="hover:text-violet-900"><X className="h-3 w-3" /></button>
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
                        <Label className="flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4 text-sky-600 dark:text-sky-500" />Notify employees with email</Label>
                        <p className="text-xs text-muted-foreground">Send an email notification when published</p>
                      </div>
                      <Switch checked={birthdayData.notifyByEmail} onCheckedChange={v => setBirthdayData(p => ({ ...p, notifyByEmail: v }))} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-500" />Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg min-h-[300px] bg-muted/20 overflow-hidden">
                      {!(birthdayData.employeeName || birthdayData.title || birthdayData.message || birthdayData.bannerImage) ? (
                        /* Empty state placeholder */
                        <div className="flex flex-col items-center justify-center h-[300px] gap-3 text-muted-foreground">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Eye className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Preview will appear here</p>
                            <p className="text-xs text-muted-foreground/70 mt-0.5">Select an employee or add content to see a preview</p>
                          </div>
                        </div>
                      ) : birthdayData.layoutType === 'image-only' ? (
                        <div className="p-4">
                          {birthdayData.bannerImage ? (
                            <div className="w-full overflow-hidden rounded-lg">
                              <img src={birthdayData.bannerImage} alt="Preview" className="w-full h-auto object-contain max-h-96" />
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
                      ) : birthdayData.layoutType === 'content-with-image' ? (
                        <div className="p-4">
                          {birthdayData.subLayout === 'left-image' ? (
                            <div className="flex gap-4">
                              <div className="w-2/5 flex-shrink-0">
                                {birthdayData.bannerImage ? (
                                  <img src={birthdayData.bannerImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                ) : (
                                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 space-y-3">
                                <h3 className="font-semibold text-lg line-clamp-2">{birthdayData.title || 'Recognition Title'}</h3>
                                <div className="text-sm text-muted-foreground line-clamp-3 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" dangerouslySetInnerHTML={{ __html: birthdayData.message || 'Your birthday message...' }} />
                              </div>
                            </div>
                          ) : birthdayData.subLayout === 'right-image' ? (
                            <div className="flex gap-4">
                              <div className="flex-1 space-y-3">
                                <h3 className="font-semibold text-lg line-clamp-2">{birthdayData.title || 'Recognition Title'}</h3>
                                <div className="text-sm text-muted-foreground line-clamp-3 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" dangerouslySetInnerHTML={{ __html: birthdayData.message || 'Your birthday message...' }} />
                              </div>
                              <div className="w-2/5 flex-shrink-0">
                                {birthdayData.bannerImage ? (
                                  <img src={birthdayData.bannerImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                ) : (
                                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {birthdayData.bannerImage ? (
                                <img src={birthdayData.bannerImage} alt="Preview" className="w-full h-auto object-cover rounded-lg max-h-64" />
                              ) : (
                                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                              <h3 className="font-semibold text-lg line-clamp-2">{birthdayData.title || 'Recognition Title'}</h3>
                              <div className="text-sm text-muted-foreground [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" dangerouslySetInnerHTML={{ __html: birthdayData.message || 'Your birthday message...' }} />
                            </div>
                          )}
                          {birthdayData.needsAcknowledgement && (
                            <Badge variant="outline" className="text-xs mt-3">Acknowledgement Required</Badge>
                          )}
                          <div className="flex items-center gap-4 pt-3 mt-3 border-t">
                            <div className="flex items-center gap-2 text-muted-foreground"><Heart className="h-4 w-4" /><span className="text-sm">0</span></div>
                            <div className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="h-4 w-4" /><span className="text-sm">0</span></div>
                            <div className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4" /><span className="text-sm">0</span></div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-lg line-clamp-2">{birthdayData.title || 'Recognition Title'}</h3>
                          <div className="text-sm text-muted-foreground [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" dangerouslySetInnerHTML={{ __html: birthdayData.message || 'Your birthday message will appear here...' }} />
                          {birthdayData.needsAcknowledgement && (
                            <Badge variant="outline" className="text-xs">Acknowledgement Required</Badge>
                          )}
                          <div className="flex items-center gap-4 pt-2 border-t">
                            <div className="flex items-center gap-2 text-muted-foreground"><Heart className="h-4 w-4" /><span className="text-sm">0</span></div>
                            <div className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="h-4 w-4" /><span className="text-sm">0</span></div>
                            <div className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4" /><span className="text-sm">0</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      {birthdayData.publishType === 'later' && birthdayData.scheduleDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          Scheduled: {birthdayData.scheduleDate}{birthdayData.scheduleTime ? ` at ${birthdayData.scheduleTime}` : ''}
                        </div>
                      )}
                      {birthdayData.notifyByEmail && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
                          <Mail className="h-3.5 w-3.5" />Email notification enabled
                        </div>
                      )}
                      {birthdayData.isPinned && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
                          <Pin className="h-3.5 w-3.5" />Pinned to top of feed
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ──────────── Anniversary Tab ──────────── */}
          <TabsContent value="anniversary">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              {/* Form */}
              <div className="space-y-4">

                {/* Content & Layout Card */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                      Content & Layout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Layout Style *</label>
                      <Select
                        value={anniversaryData.layoutType}
                        onValueChange={v => setAnniversaryData(p => ({ ...p, layoutType: v as LayoutType }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Select layout style" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content-only"><div className="flex items-center gap-2"><FileText className="h-4 w-4" /><span>Content Only</span></div></SelectItem>
                          <SelectItem value="content-with-image"><div className="flex items-center gap-2"><FileImage className="h-4 w-4" /><span>Content + Image</span></div></SelectItem>
                          <SelectItem value="image-only"><div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /><span>Image Only</span></div></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="transition-all duration-200" style={{ maxHeight: anniversaryData.layoutType === 'content-with-image' ? '200px' : '0', opacity: anniversaryData.layoutType === 'content-with-image' ? 1 : 0, overflow: 'hidden', visibility: anniversaryData.layoutType === 'content-with-image' ? 'visible' : 'hidden' }}>
                      <div className="pt-2 space-y-2">
                        <label className="text-sm font-medium">Image Position *</label>
                        <Select value={anniversaryData.subLayout} onValueChange={v => setAnniversaryData(p => ({ ...p, subLayout: v as SubLayout }))}>
                          <SelectTrigger><SelectValue placeholder="Select image position" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left-image"><div className="flex items-center gap-2"><span>🖼️|📝</span><span>Image on Left</span></div></SelectItem>
                            <SelectItem value="top-image"><div className="flex items-center gap-2"><span>🖼️/📝</span><span>Image on Top</span></div></SelectItem>
                            <SelectItem value="right-image"><div className="flex items-center gap-2"><span>📝|🖼️</span><span>Image on Right</span></div></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="transition-all duration-200" style={{ maxHeight: anniversaryData.layoutType !== 'content-only' ? '400px' : '0', opacity: anniversaryData.layoutType !== 'content-only' ? 1 : 0, overflow: 'hidden', visibility: anniversaryData.layoutType !== 'content-only' ? 'visible' : 'hidden' }}>
                      <div className="pt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" />Image</label>
                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-medium">Required</span>
                        </div>
                        {anniversaryData.bannerImage ? (
                          <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted/30">
                            <img src={anniversaryData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                            <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setAnniversaryData(p => ({ ...p, bannerImage: null }))}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <div className="aspect-video border-2 border-dashed rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => annFileRef.current?.click()}>
                            <div className="text-center p-6"><ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm font-medium mb-1">Upload Image</p><p className="text-xs text-muted-foreground">16:9 ratio recommended</p></div>
                          </div>
                        )}
                        <input ref={annFileRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={e => handleBannerUpload(e, 'anniversary')} className="hidden" />
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => annFileRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Upload Image</Button>
                      </div>
                    </div>

                    <div className="transition-all duration-200" style={{ maxHeight: anniversaryData.layoutType !== 'image-only' ? '60px' : '0', opacity: anniversaryData.layoutType !== 'image-only' ? 1 : 0, overflow: 'hidden', visibility: anniversaryData.layoutType !== 'image-only' ? 'visible' : 'hidden' }}>
                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />Content</span></div>
                      </div>
                    </div>

                    <div className="transition-all duration-200" style={{ maxHeight: anniversaryData.layoutType !== 'image-only' ? '120px' : '0', opacity: anniversaryData.layoutType !== 'image-only' ? 1 : 0, overflow: 'hidden', visibility: anniversaryData.layoutType !== 'image-only' ? 'visible' : 'hidden' }}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          placeholder="e.g., Celebrating 5 Years with Alex! 🏆"
                          value={anniversaryData.title}
                          onChange={e => setAnniversaryData(p => ({ ...p, title: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="transition-all duration-200" style={{ maxHeight: anniversaryData.layoutType !== 'image-only' ? '400px' : '0', opacity: anniversaryData.layoutType !== 'image-only' ? 1 : 0, overflow: 'hidden', visibility: anniversaryData.layoutType !== 'image-only' ? 'visible' : 'hidden' }}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Recognition Message *</label>
                        <div className="border rounded-lg bg-background">
                          <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
                            <Select value={annFontFamily} onValueChange={setAnnFontFamily}>
                              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Font" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="serif">Serif</SelectItem>
                                <SelectItem value="mono">Monospace</SelectItem>
                                <SelectItem value="sans">Sans Serif</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="w-px h-6 bg-border mx-1" />
                            <Button type="button" variant="ghost" size="sm" title="Bold"
                              onMouseDown={e => { e.preventDefault(); execAnnFormat('bold'); }}>
                              <Bold className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" title="Italic"
                              onMouseDown={e => { e.preventDefault(); execAnnFormat('italic'); }}>
                              <Italic className="h-4 w-4" />
                            </Button>
                            <div className="w-px h-6 bg-border mx-1" />
                            <Button type="button" variant="ghost" size="sm" title="Bullet List"
                              onMouseDown={e => { e.preventDefault(); execAnnFormat('insertUnorderedList'); }}>
                              <List className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" title="Numbered List"
                              onMouseDown={e => { e.preventDefault(); execAnnFormat('insertOrderedList'); }}>
                              <ListOrdered className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="relative">
                            {!getTextContent(anniversaryData.message) && (
                              <span className="absolute top-3 left-3 text-sm text-muted-foreground pointer-events-none select-none">
                                Write a heartfelt message celebrating this milestone...
                              </span>
                            )}
                            <div
                              ref={annEditorRef}
                              contentEditable
                              suppressContentEditableWarning
                              onInput={() => setAnniversaryData(p => ({ ...p, message: annEditorRef.current?.innerHTML || '' }))}
                              className="min-h-[150px] p-3 text-sm outline-none [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-0.5 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic"
                              style={{ fontFamily: annFontStyle }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{getTextContent(anniversaryData.message).length} characters</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      Anniversary Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Searchable Employee Dropdown */}
                    <div className="space-y-2">
                      <Label>Employee *</Label>
                      <div className="relative">
                        <div
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:border-input transition-colors"
                          onClick={() => { setAnnShowEmp(v => !v); setAnnEmpSearch(''); }}
                        >
                          <span className={anniversaryData.employeeName ? '' : 'text-muted-foreground'}>
                            {anniversaryData.employeeName || 'Search and select employee...'}
                          </span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {annShowEmp && (
                          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                            <div className="flex items-center gap-2 px-3 py-2 border-b">
                              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                              <input
                                autoFocus
                                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                                placeholder="Type to search..."
                                value={annEmpSearch}
                                onChange={e => setAnnEmpSearch(e.target.value)}
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto py-1">
                              {EMPLOYEES.filter(e => e.toLowerCase().includes(annEmpSearch.toLowerCase())).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-3">No employees found</p>
                              ) : (
                                EMPLOYEES.filter(e => e.toLowerCase().includes(annEmpSearch.toLowerCase())).map(emp => (
                                  <div
                                    key={emp}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors ${anniversaryData.employeeName === emp ? 'bg-muted font-medium' : ''}`}
                                    onClick={() => { setAnniversaryData(p => ({ ...p, employeeName: emp })); setAnnShowEmp(false); }}
                                  >
                                    <div className={`w-7 h-7 rounded-full ${getAvatarGradient(emp)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>{getInitials(emp)}</div>
                                    {emp}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Joining Date *</Label>
                        <Popover open={annDateOpen} onOpenChange={setAnnDateOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {anniversaryData.joiningDate
                                ? format(new Date(anniversaryData.joiningDate + 'T00:00:00'), 'PPP')
                                : 'Select joining date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              selected={anniversaryData.joiningDate ? new Date(anniversaryData.joiningDate + 'T00:00:00') : undefined}
                              onSelect={(date) => {
                                const jd = date ? format(date, 'yyyy-MM-dd') : '';
                                setAnniversaryData(p => ({ ...p, joiningDate: jd, yearsOfService: computedYears(jd) }));
                                setAnnDateOpen(false);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Years of Service</Label>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Auto-calculated"
                          value={anniversaryData.yearsOfService}
                          onChange={e => setAnniversaryData(p => ({ ...p, yearsOfService: Number(e.target.value) || '' }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Milestone</Label>
                      <Select
                        value={anniversaryData.milestone}
                        onValueChange={v => setAnniversaryData(p => ({ ...p, milestone: v }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Select milestone" /></SelectTrigger>
                        <SelectContent>
                          {['1-year','2-year','3-year','5-year','10-year','15-year','20-year','25-year','30-year'].map(m => (
                            <SelectItem key={m} value={m}>{m.replace('-year', ' Year')}{m === '30-year' ? '+' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings — Anniversary */}
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
                      <Label className="text-sm font-medium">Category</Label>
                      <Select value={anniversaryData.category} onValueChange={v => setAnniversaryData(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recognition">Recognition</SelectItem>
                          <SelectItem value="anniversary">Work Anniversary</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                          <SelectItem value="appreciation">Appreciation</SelectItem>
                          <SelectItem value="hr-update">HR Update</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pin */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2 text-sm font-medium"><Pin className="h-4 w-4 text-amber-600 dark:text-amber-500" />Pin Recognition</Label>
                        <p className="text-xs text-muted-foreground">Show at the top of feed</p>
                      </div>
                      <Switch checked={anniversaryData.isPinned} onCheckedChange={v => setAnniversaryData(p => ({ ...p, isPinned: v }))} />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium"><Clock className="h-4 w-4 text-blue-600 dark:text-blue-500" />Duration</Label>
                      <Select value={anniversaryData.expiresIn} onValueChange={v => setAnniversaryData(p => ({ ...p, expiresIn: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
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

                    {/* Acknowledgement */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />Require Acknowledgement</Label>
                        <p className="text-xs text-muted-foreground">Users must confirm they've read this</p>
                      </div>
                      <Switch checked={anniversaryData.needsAcknowledgement} onCheckedChange={v => setAnniversaryData(p => ({ ...p, needsAcknowledgement: v }))} />
                    </div>

                    {/* Publish Timing */}
                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-3 space-y-3">
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium"><CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-500" />Publish Timing</Label>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">Choose when this recognition goes live</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setAnniversaryData(p => ({ ...p, publishType: 'now', scheduleDate: '', scheduleTime: '' }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${anniversaryData.publishType === 'now' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600'}`}>
                          <Send className="h-3.5 w-3.5" />Publish Now
                        </button>
                        <button type="button" onClick={() => setAnniversaryData(p => ({ ...p, publishType: 'later' }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${anniversaryData.publishType === 'later' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-blue-400 hover:text-blue-600'}`}>
                          <Clock className="h-3.5 w-3.5" />Publish Later
                        </button>
                      </div>
                      {anniversaryData.publishType === 'later' && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200 dark:border-blue-800">
                          <div className="space-y-1.5 pt-2">
                            <Label className="text-xs font-medium text-blue-700 dark:text-blue-400">Date</Label>
                            <Input type="date" value={anniversaryData.scheduleDate} min={new Date().toISOString().split('T')[0]}
                              onChange={e => setAnniversaryData(p => ({ ...p, scheduleDate: e.target.value }))} className="text-sm bg-white dark:bg-background h-9" />
                          </div>
                          <div className="space-y-1.5 pt-2">
                            <Label className="text-xs font-medium text-blue-700 dark:text-blue-400">Time</Label>
                            <Input type="time" value={anniversaryData.scheduleTime}
                              onChange={e => setAnniversaryData(p => ({ ...p, scheduleTime: e.target.value }))} className="text-sm bg-white dark:bg-background h-9" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Audience */}
                    <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 p-3 space-y-3">
                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-violet-600 dark:text-violet-500" />Audience</Label>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">Who can see this recognition</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setAnniversaryData(p => ({ ...p, audience: 'all', selectedAudienceDepts: [] }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${anniversaryData.audience === 'all' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-violet-400 hover:text-violet-600'}`}>
                          <Users className="h-3.5 w-3.5" />All Employees
                        </button>
                        <button type="button" onClick={() => setAnniversaryData(p => ({ ...p, audience: 'departments' }))}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all ${anniversaryData.audience === 'departments' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white dark:bg-background border-border text-muted-foreground hover:border-violet-400 hover:text-violet-600'}`}>
                          <Building2 className="h-3.5 w-3.5" />Select Groups
                        </button>
                      </div>
                      {anniversaryData.audience === 'departments' && (
                        <div className="rounded-md border border-violet-200 dark:border-violet-700 bg-white dark:bg-background p-2 space-y-2">
                          <Input placeholder="Search departments..." value={annDeptSearch} onChange={e => setAnnDeptSearch(e.target.value)}
                            className="text-sm h-8 border-0 border-b rounded-none focus-visible:ring-0 px-1" />
                          <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
                            {DEPARTMENTS.filter(d => d.toLowerCase().includes(annDeptSearch.toLowerCase())).map(dept => {
                              const isSel = anniversaryData.selectedAudienceDepts.includes(dept);
                              return (
                                <div key={dept}
                                  onClick={() => setAnniversaryData(p => ({ ...p, selectedAudienceDepts: isSel ? p.selectedAudienceDepts.filter(x => x !== dept) : [...p.selectedAudienceDepts, dept] }))}
                                  className={`flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm select-none transition-colors ${isSel ? 'bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-medium' : 'hover:bg-muted/50'}`}>
                                  <Checkbox checked={isSel} onCheckedChange={() => {}} onClick={e => e.stopPropagation()} className="pointer-events-none" />
                                  {dept}
                                </div>
                              );
                            })}
                          </div>
                          {anniversaryData.selectedAudienceDepts.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1 border-t">
                              {anniversaryData.selectedAudienceDepts.map(d => (
                                <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-medium">
                                  {d}
                                  <button type="button" onClick={() => setAnniversaryData(p => ({ ...p, selectedAudienceDepts: p.selectedAudienceDepts.filter(x => x !== d) }))} className="hover:text-violet-900"><X className="h-3 w-3" /></button>
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
                        <Label className="flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4 text-sky-600 dark:text-sky-500" />Notify employees with email</Label>
                        <p className="text-xs text-muted-foreground">Send an email notification when published</p>
                      </div>
                      <Switch checked={anniversaryData.notifyByEmail} onCheckedChange={v => setAnniversaryData(p => ({ ...p, notifyByEmail: v }))} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-500" />Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg min-h-[300px] bg-muted/20 overflow-hidden">
                      {!(anniversaryData.employeeName || anniversaryData.title || anniversaryData.message || anniversaryData.bannerImage) ? (
                        /* Empty state placeholder */
                        <div className="flex flex-col items-center justify-center h-[300px] gap-3 text-muted-foreground">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Eye className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">Preview will appear here</p>
                            <p className="text-xs text-muted-foreground/70 mt-0.5">Select an employee or add content to see a preview</p>
                          </div>
                        </div>
                      ) : anniversaryData.layoutType === 'image-only' ? (
                        <div className="p-4">
                          {anniversaryData.bannerImage ? (
                            <div className="w-full overflow-hidden rounded-lg">
                              <img src={anniversaryData.bannerImage} alt="Preview" className="w-full h-auto object-contain max-h-96" />
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
                      ) : anniversaryData.layoutType === 'content-with-image' ? (
                        <div className="p-4">
                          {anniversaryData.subLayout === 'left-image' ? (
                            <div className="flex gap-4">
                              <div className="w-2/5 flex-shrink-0">
                                {anniversaryData.bannerImage ? (
                                  <img src={anniversaryData.bannerImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                ) : (
                                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 space-y-3">
                                <h3 className="font-semibold text-lg line-clamp-2">{anniversaryData.title || 'Recognition Title'}</h3>
                                <div className="text-sm text-muted-foreground line-clamp-3 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" dangerouslySetInnerHTML={{ __html: anniversaryData.message || 'Your anniversary message...' }} />
                              </div>
                            </div>
                          ) : anniversaryData.subLayout === 'right-image' ? (
                            <div className="flex gap-4">
                              <div className="flex-1 space-y-3">
                                <h3 className="font-semibold text-lg line-clamp-2">{anniversaryData.title || 'Recognition Title'}</h3>
                                <div className="text-sm text-muted-foreground line-clamp-3 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" dangerouslySetInnerHTML={{ __html: anniversaryData.message || 'Your anniversary message...' }} />
                              </div>
                              <div className="w-2/5 flex-shrink-0">
                                {anniversaryData.bannerImage ? (
                                  <img src={anniversaryData.bannerImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                ) : (
                                  <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {anniversaryData.bannerImage ? (
                                <img src={anniversaryData.bannerImage} alt="Preview" className="w-full h-auto object-cover rounded-lg max-h-64" />
                              ) : (
                                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                              <h3 className="font-semibold text-lg line-clamp-2">{anniversaryData.title || 'Recognition Title'}</h3>
                              <div className="text-sm text-muted-foreground [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" dangerouslySetInnerHTML={{ __html: anniversaryData.message || 'Your anniversary message...' }} />
                            </div>
                          )}
                          {anniversaryData.needsAcknowledgement && (
                            <Badge variant="outline" className="text-xs mt-3">Acknowledgement Required</Badge>
                          )}
                          <div className="flex items-center gap-4 pt-3 mt-3 border-t">
                            <div className="flex items-center gap-2 text-muted-foreground"><Heart className="h-4 w-4" /><span className="text-sm">0</span></div>
                            <div className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="h-4 w-4" /><span className="text-sm">0</span></div>
                            <div className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4" /><span className="text-sm">0</span></div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-lg line-clamp-2">{anniversaryData.title || 'Recognition Title'}</h3>
                          <div className="text-sm text-muted-foreground [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" dangerouslySetInnerHTML={{ __html: anniversaryData.message || 'Your anniversary message will appear here...' }} />
                          {anniversaryData.needsAcknowledgement && (
                            <Badge variant="outline" className="text-xs">Acknowledgement Required</Badge>
                          )}
                          <div className="flex items-center gap-4 pt-2 border-t">
                            <div className="flex items-center gap-2 text-muted-foreground"><Heart className="h-4 w-4" /><span className="text-sm">0</span></div>
                            <div className="flex items-center gap-2 text-muted-foreground"><MessageCircle className="h-4 w-4" /><span className="text-sm">0</span></div>
                            <div className="flex items-center gap-2 text-muted-foreground"><Eye className="h-4 w-4" /><span className="text-sm">0</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      {anniversaryData.publishType === 'later' && anniversaryData.scheduleDate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          Scheduled: {anniversaryData.scheduleDate}{anniversaryData.scheduleTime ? ` at ${anniversaryData.scheduleTime}` : ''}
                        </div>
                      )}
                      {anniversaryData.notifyByEmail && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
                          <Mail className="h-3.5 w-3.5" />Email notification enabled
                        </div>
                      )}
                      {anniversaryData.isPinned && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
                          <Pin className="h-3.5 w-3.5" />Pinned to top of feed
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

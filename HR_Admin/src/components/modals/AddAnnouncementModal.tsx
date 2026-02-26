import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { useAnnouncementStore } from '@/store/announcementStore';
import { toast } from 'sonner';
import { FileText, Image as ImageIcon, FileImage, Eye, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddAnnouncementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type LayoutType = 'content-only' | 'content-with-image' | 'image-only';
type SubLayout = 'left-image' | 'top-image' | 'right-image';

export function AddAnnouncementModal({ open, onOpenChange }: AddAnnouncementModalProps) {
  const addAnnouncement = useAnnouncementStore(state => state.addAnnouncement);
  const fetchAnnouncements = useAnnouncementStore(state => state.fetchAnnouncements);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('announcements');
  const [showPreview, setShowPreview] = useState(false);
  
  // Announcement form state
  const [layoutType, setLayoutType] = useState<LayoutType>('content-only');
  const [subLayout, setSubLayout] = useState<SubLayout>('left-image');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage('');
    setUploadedFileName('');
  };

  const handleReset = () => {
    setFormData({ title: '', description: '', priority: 'medium' });
    setLayoutType('content-only');
    setSubLayout('left-image');
    setUploadedImage('');
    setUploadedFileName('');
    setActiveTab('announcements');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate image upload for specific layouts
    if (layoutType === 'content-with-image' && !uploadedImage) {
      toast.error('Please upload an image for this layout');
      return;
    }

    if (layoutType === 'image-only' && !uploadedImage) {
      toast.error('Please upload an image');
      return;
    }

    setIsLoading(true);

    try {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      await addAnnouncement({
        title: formData.title,
        description: formData.description,
        author: 'Admin',
        role: 'Administrator',
        date: dateStr,
        time: 'Just now',
        avatar: 'AD',
        priority: formData.priority as 'high' | 'medium' | 'low',
        imageUrl: uploadedImage || undefined,
        layoutType,
        subLayout: layoutType === 'content-with-image' ? subLayout : undefined,
      });

      // Refetch announcements to ensure UI is in sync
      await fetchAnnouncements();

      toast.success('Announcement created successfully!');
      handleReset();
      onOpenChange(false);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Error creating announcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => {
    const priorityColors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    };

    return (
      <Card className="w-full">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn('h-2 w-2 rounded-full', priorityColors[formData.priority])} />
              <span className="text-xs font-medium capitalize">{formData.priority} Priority</span>
            </div>
          </div>

          {/* Content based on layout */}
          {layoutType === 'content-only' && (
            <>
              <h3 className="font-bold text-lg mb-2">{formData.title || 'Announcement Title'}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {formData.description || 'Description will appear here...'}
              </p>
            </>
          )}

          {layoutType === 'content-with-image' && subLayout === 'left-image' && (
            <div className="flex gap-3">
              <div className="w-2/5 flex-shrink-0">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                ) : (
                  <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">{formData.title || 'Title'}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {formData.description || 'Description...'}
                </p>
              </div>
            </div>
          )}

          {layoutType === 'content-with-image' && subLayout === 'top-image' && (
            <>
              {uploadedImage ? (
                <img src={uploadedImage} alt="Preview" className="w-full h-40 object-cover rounded-md mb-3" />
              ) : (
                <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center mb-3">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <h3 className="font-bold text-lg mb-2">{formData.title || 'Title'}</h3>
              <p className="text-sm text-muted-foreground">
                {formData.description || 'Description...'}
              </p>
            </>
          )}

          {layoutType === 'content-with-image' && subLayout === 'right-image' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">{formData.title || 'Title'}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {formData.description || 'Description...'}
                </p>
              </div>
              <div className="w-2/5 flex-shrink-0">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                ) : (
                  <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}

          {layoutType === 'image-only' && (
            <>
              {uploadedImage ? (
                <img src={uploadedImage} alt="Preview" className="w-full h-48 object-cover rounded-md" />
              ) : (
                <div className="w-full h-48 bg-muted rounded-md flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              {formData.title && (
                <p className="text-sm font-medium mt-2 text-center">{formData.title}</p>
              )}
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <span className="text-xs text-muted-foreground">Admin • Just now</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) handleReset(); onOpenChange(value); }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Create announcements, polls, surveys, or events for your team.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="polls">Polls</TabsTrigger>
            <TabsTrigger value="surveys">Surveys</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Layout Type Selector */}
              <div className="space-y-3">
                <Label>Layout Type *</Label>
                <RadioGroup value={layoutType} onValueChange={(value) => setLayoutType(value as LayoutType)}>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <RadioGroupItem value="content-only" id="content-only" className="peer sr-only" />
                      <Label
                        htmlFor="content-only"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        <FileText className="mb-2 h-6 w-6" />
                        <span className="text-xs font-medium">Content Only</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="content-with-image" id="content-with-image" className="peer sr-only" />
                      <Label
                        htmlFor="content-with-image"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        <FileImage className="mb-2 h-6 w-6" />
                        <span className="text-xs font-medium">Content + Image</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="image-only" id="image-only" className="peer sr-only" />
                      <Label
                        htmlFor="image-only"
                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        <ImageIcon className="mb-2 h-6 w-6" />
                        <span className="text-xs font-medium">Image Only</span>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Sub-layout for Content with Image */}
              {layoutType === 'content-with-image' && (
                <div className="space-y-3">
                  <Label>Image Position *</Label>
                  <RadioGroup value={subLayout} onValueChange={(value) => setSubLayout(value as SubLayout)}>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <RadioGroupItem value="left-image" id="left-image" className="peer sr-only" />
                        <Label
                          htmlFor="left-image"
                          className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          <div className="text-2xl mb-1">🖼️ |📝</div>
                          <span className="text-xs font-medium">Left Image</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="top-image" id="top-image" className="peer sr-only" />
                        <Label
                          htmlFor="top-image"
                          className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          <div className="text-2xl mb-1">
                            <div>🖼️</div>
                            <div className="text-xs">📝</div>
                          </div>
                          <span className="text-xs font-medium">Top Image</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="right-image" id="right-image" className="peer sr-only" />
                        <Label
                          htmlFor="right-image"
                          className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          <div className="text-2xl mb-1">📝| 🖼️</div>
                          <span className="text-xs font-medium">Right Image</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Image Upload */}
              {(layoutType === 'content-with-image' || layoutType === 'image-only') && (
                <div className="space-y-2">
                  <Label htmlFor="image">Image {layoutType === 'content-with-image' || layoutType === 'image-only' ? '*' : ''}</Label>
                  {!uploadedImage ? (
                    <div className="border-2 border-dashed rounded-md p-6 text-center hover:border-primary transition-colors">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload image</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG, GIF or WebP (Max 5MB)
                        </p>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative border rounded-md p-2">
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-48 object-cover rounded-md" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">{uploadedFileName}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  disabled={isLoading}
                  required
                  maxLength={100}
                />
              </div>

              {/* Description */}
              {layoutType !== 'image-only' && (
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter announcement details"
                    rows={4}
                    disabled={isLoading}
                    required
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.description.length}/2000
                  </p>
                </div>
              )}

              {layoutType === 'image-only' && (
                <div className="space-y-2">
                  <Label htmlFor="description">Caption (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add a caption (optional)"
                    rows={2}
                    disabled={isLoading}
                    maxLength={200}
                  />
                </div>
              )}

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value: string) => setFormData({ ...formData, priority: value as 'high' | 'medium' | 'low' })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Preview</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                </div>
                {showPreview && renderPreview()}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { handleReset(); onOpenChange(false); }} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Publishing...' : 'Publish Announcement'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Polls Tab */}
          <TabsContent value="polls" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <p>Polls feature coming soon...</p>
            </div>
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <p>Surveys feature coming soon...</p>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <p>Events feature coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

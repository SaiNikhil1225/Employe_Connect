import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Video, Link as LinkIcon, Download, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Training {
  id: string;
  name: string;
  materials: any[];
}

interface MaterialsModalProps {
  training: Training;
  open: boolean;
  onClose: () => void;
}

export function MaterialsModal({ training, open, onClose }: MaterialsModalProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const documentMaterials = training.materials.filter(m => m.type === 'document');
  const videoMaterials = training.materials.filter(m => m.type === 'video');
  const linkMaterials = training.materials.filter(m => m.type === 'link');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Training Materials - {training.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {training.materials.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No materials available yet</p>
            </div>
          ) : (
            <>
              {/* Documents */}
              {documentMaterials.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Documents
                  </h3>
                  <div className="space-y-2">
                    {documentMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{material.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Size: {formatFileSize(material.size)}</span>
                              <span>•</span>
                              <span>Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="default">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {videoMaterials.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-600" />
                    Videos
                  </h3>
                  <div className="space-y-2">
                    {videoMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{material.name}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Duration: {formatDuration(material.duration)}</span>
                              <span>•</span>
                              <span>Views: {material.views}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="default">
                            <Video className="h-3 w-3 mr-1" />
                            Watch Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              {linkMaterials.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-orange-600" />
                    External Resources
                  </h3>
                  <div className="space-y-2">
                    {linkMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">{material.name}</p>
                            <p className="text-xs text-muted-foreground">{material.url}</p>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <a href={material.url} target="_blank" rel="noopener noreferrer">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              Open Link
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, Download, Share2, CheckCircle, Copy, Linkedin, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  id: string;
  trainingId: string;
  trainingName: string;
  recipientName: string;
  completionDate: string;
  score: number;
  grade: string;
  trainerName: string;
  duration: number;
  pdfUrl: string;
  verificationUrl: string;
  issuedBy: string;
  issuedDate: string;
}

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'very good':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'good':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleDownload = () => {
    toast.success('Certificate download started');
    // Implement actual download logic
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificate.verificationUrl);
    toast.success('Verification link copied to clipboard');
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-2">
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 p-6 text-center">
            <Award className="h-12 w-12 mx-auto text-white mb-2" />
            <h3 className="text-white font-bold text-lg">Certificate of Completion</h3>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Training Name */}
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {certificate.trainingName}
              </h4>
              <Badge className={getGradeColor(certificate.grade)}>
                {certificate.grade}
              </Badge>
            </div>

            <hr className="border-muted" />

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Awarded to</span>
                <span className="font-semibold">{certificate.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{formatDate(certificate.completionDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {certificate.score}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trainer</span>
                <span className="font-medium">{certificate.trainerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{certificate.duration} hours</span>
              </div>
            </div>

            <hr className="border-muted" />

            {/* Certificate ID */}
            <div className="bg-muted/30 p-3 rounded text-center">
              <p className="text-xs text-muted-foreground">Certificate ID</p>
              <p className="text-sm font-mono font-semibold mt-1">{certificate.id}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                className="w-full"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareDialogOpen(true)}
                className="w-full"
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVerifyDialogOpen(true)}
                className="w-full"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Verify
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Certificate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Copy Link */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>

            {/* LinkedIn */}
            <Button
              variant="outline"
              className="w-full justify-start text-blue-600"
              onClick={() => {
                toast.success('Opening LinkedIn...');
                setShareDialogOpen(false);
              }}
            >
              <Linkedin className="h-4 w-4 mr-2" />
              Share on LinkedIn
            </Button>

            {/* Email */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                toast.success('Opening email client...');
                setShareDialogOpen(false);
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send via Email
            </Button>

            {/* Public Link Display */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Public Link:</p>
              <p className="text-xs font-mono break-all">{certificate.verificationUrl}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Certificate Verification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Verification Status */}
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 dark:text-green-200 font-semibold">
                This certificate is AUTHENTIC
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-muted p-8 rounded-lg flex items-center justify-center">
              <div className="w-32 h-32 bg-white p-2 rounded">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  QR Code
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate ID</span>
                <span className="font-mono font-semibold">{certificate.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{certificate.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Training</span>
                <span className="font-medium">{certificate.trainingName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{formatDate(certificate.completionDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued By</span>
                <span className="font-medium">{certificate.issuedBy}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
                <Copy className="h-3 w-3 mr-1" />
                Copy Link
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleDownload}>
                <Download className="h-3 w-3 mr-1" />
                Download QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

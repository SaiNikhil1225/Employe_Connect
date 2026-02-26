import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EnableLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  employeeName: string;
  isEnabling: boolean;
}

export default function EnableLoginModal({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
  isEnabling,
}: EnableLoginModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">
            Enable User
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p className="text-base font-medium text-gray-900">
              Are you sure you want to enable this user?
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The user will be able to log in and will be available for role assignments.
            </p>
            {employeeName && (
              <p className="text-sm text-gray-500 mt-2">
                User: <span className="font-medium text-gray-700">{employeeName}</span>
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel 
            disabled={isEnabling}
            className="h-10 min-w-24"
          >
            No
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isEnabling}
            className="h-10 min-w-24 bg-green-600 hover:bg-green-700 focus:ring-green-600"
          >
            {isEnabling ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Enabling...</span>
              </div>
            ) : (
              'Yes, Enable'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

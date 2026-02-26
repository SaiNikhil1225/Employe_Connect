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

interface DisableLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  employeeName: string;
  isDisabling: boolean;
}

export default function DisableLoginModal({
  isOpen,
  onClose,
  onConfirm,
  employeeName,
  isDisabling,
}: DisableLoginModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">
            Disable User
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p className="text-base font-medium text-gray-900">
              Are you sure you want to disable this user?
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              The user won't be available for assignment to any roles once disabled.
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
            disabled={isDisabling}
            className="h-10 min-w-24"
          >
            No
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDisabling}
            className="h-10 min-w-24 bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDisabling ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Disabling...</span>
              </div>
            ) : (
              'Yes, Disable'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

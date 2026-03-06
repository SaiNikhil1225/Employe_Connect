import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CreditCard,
  FileText,
  MessageSquare,
  MoreVertical,
  KeyRound,
  LogOut,
  Ban,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning';
  onClick: () => void;
}

interface ContextualActionMenuProps {
  actions: ActionItem[];
  className?: string;
}

const defaultActions: ActionItem[] = [
  {
    id: 'id-card',
    label: 'Download ID Card',
    icon: <CreditCard className="h-4 w-4" />,
    onClick: () => {},
  },
  {
    id: 'write-note',
    label: 'Write Note',
    icon: <FileText className="h-4 w-4" />,
    onClick: () => {},
  },
  {
    id: 'request-feedback',
    label: 'Request Feedback',
    icon: <MessageSquare className="h-4 w-4" />,
    onClick: () => {},
  },
  {
    id: 'reset-password',
    label: 'Reset Password',
    icon: <KeyRound className="h-4 w-4" />,
    onClick: () => {},
  },
  {
    id: 'initiate-exit',
    label: 'Initiate Exit',
    icon: <LogOut className="h-4 w-4" />,
    variant: 'warning' as const,
    onClick: () => {},
  },
  {
    id: 'disable-login',
    label: 'Disable Login',
    icon: <Ban className="h-4 w-4" />,
    variant: 'destructive' as const,
    onClick: () => {},
  },
  {
    id: 'enable-login',
    label: 'Enable Login',
    icon: <UserCheck className="h-4 w-4" />,
    onClick: () => {},
  },
  {
    id: 'add-to-pip',
    label: 'Add Employee to PIP',
    icon: <AlertTriangle className="h-4 w-4" />,
    variant: 'warning' as const,
    onClick: () => {},
  },
];

export default function ContextualActionMenu({ actions, className }: ContextualActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-10 w-10 rounded-full hover:bg-white/80 bg-white shadow-sm border border-gray-200', className)}
        >
          <MoreVertical className="h-5 w-5 text-gray-700" />
          <span className="sr-only">Quick actions menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {actions.map((action) => {
          const isWarning = action.variant === 'warning';
          const isDestructive = action.variant === 'destructive';
          
          return (
            <DropdownMenuItem
              key={action.id}
              onClick={action.onClick}
              className={cn(
                'gap-3 cursor-pointer',
                isWarning && 'text-amber-600 focus:text-amber-700 focus:bg-amber-50',
                isDestructive && 'text-red-600 focus:text-red-700 focus:bg-red-50'
              )}
            >
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center',
                isWarning && 'bg-amber-50 text-amber-600',
                isDestructive && 'bg-red-50 text-red-600',
                !isWarning && !isDestructive && 'bg-blue-50 text-blue-600'
              )}>
                {action.icon}
              </div>
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { defaultActions };
export type { ActionItem };

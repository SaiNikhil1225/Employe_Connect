import { cn } from '@/lib/utils';
import {
  User,
  Briefcase,
  Clock,
  FileText,
  DollarSign,
  Users,
} from 'lucide-react';

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: TabConfig[];
}

export const defaultTabs: TabConfig[] = [
  { id: 'about', label: 'About', icon: <User className="h-4 w-4" /> },
  { id: 'profile', label: 'Profile', icon: <Users className="h-4 w-4" /> },
  { id: 'job', label: 'Job', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'time', label: 'Timeline', icon: <Clock className="h-4 w-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
  { id: 'finances', label: 'Finances', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'assets', label: 'Assets', icon: <Briefcase className="h-4 w-4" /> },
];

export default function TabNavigation({ activeTab, onTabChange, tabs }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex gap-1 px-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all relative',
              'hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-t-lg',
              activeTab === tab.id
                ? 'text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            
            {/* Pill-style indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

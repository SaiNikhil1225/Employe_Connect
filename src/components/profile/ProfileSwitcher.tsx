import { CheckCircle2, ChevronDown } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function ProfileSwitcher() {
  const { activeProfile, availableProfiles, switchProfile } = useProfile();

  // Don't show switcher if user has no profiles to switch to
  if (availableProfiles.length <= 1) {
    return null;
  }

  const currentProfile = availableProfiles.find(p => p.value === activeProfile);

  if (!currentProfile) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-2 hover:bg-accent transition-all duration-200"
          aria-label="Switch profile view"
        >
          <span className="font-medium text-sm">{currentProfile.label}</span>
          <ChevronDown className="h-4 w-4 opacity-70" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 p-1">
        <div className="space-y-0.5">
          {availableProfiles.map((profile) => {
            const isActive = activeProfile === profile.value;
            
            return (
              <DropdownMenuItem
                key={profile.value}
                onClick={() => switchProfile(profile.value)}
                className={`cursor-pointer py-1.5 px-2 rounded transition-all text-foreground hover:text-foreground ${
                  isActive 
                    ? 'bg-accent font-medium' 
                    : 'hover:bg-accent/50'
                }`}
              >
                <span className="text-sm flex items-center justify-between w-full">
                  {profile.label}
                  {isActive && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 ml-2" aria-label="Currently active" />
                  )}
                </span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { CheckCircle2, ChevronDown } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
        <button
          className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Switch profile view"
        >
          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
          <span className="font-medium text-sm text-primary">{currentProfile.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-primary/60" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 p-1.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-2 pb-1">Switch View</p>
        <div className="space-y-0.5">
          {availableProfiles.map((profile) => {
            const isActive = activeProfile === profile.value;

            return (
              <DropdownMenuItem
                key={profile.value}
                onClick={() => switchProfile(profile.value)}
                className={`cursor-pointer py-2 px-2.5 rounded-md transition-all text-sm ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium focus:bg-primary focus:text-primary-foreground'
                    : 'text-foreground hover:bg-accent/50 focus:bg-accent/50'
                }`}
              >
                <span className="flex items-center justify-between w-full">
                  {profile.label}
                  {isActive && (
                    <CheckCircle2 className="h-3.5 w-3.5 ml-2 flex-shrink-0" aria-label="Currently active" />
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

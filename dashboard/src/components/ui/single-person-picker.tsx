import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { useEmployeeStore } from '@/store/employeeStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface Person {
  id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
}

interface SinglePersonPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SinglePersonPicker({
  value,
  onChange,
  placeholder = 'Select person...',
  className,
  disabled = false,
}: SinglePersonPickerProps) {
  const [open, setOpen] = useState(false);
  const { activeEmployees, fetchActiveEmployees, isLoading } = useEmployeeStore();

  // Fetch active employees on mount
  useEffect(() => {
    fetchActiveEmployees();
  }, [fetchActiveEmployees]);

  // Convert employees to Person format
  const people: Person[] = activeEmployees.map(emp => ({
    id: emp._id || emp.employeeId,
    name: emp.name,
    email: emp.email,
    role: emp.designation,
    department: emp.department,
  }));

  const selectedPerson = people.find((person) => person.name === value);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open && !disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            disabled && 'cursor-not-allowed',
            className
          )}
          disabled={disabled}
        >
          {selectedPerson ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(selectedPerson.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedPerson.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{isLoading ? 'Loading employees...' : placeholder}</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput placeholder="Search people..." />
          <CommandList>
            <CommandEmpty>{people.length === 0 ? 'No employees found. Please add employees first.' : 'No person found.'}</CommandEmpty>
            <CommandGroup>
              {people.map((person) => (
                <CommandItem
                  key={person.id}
                  value={person.name}
                  onSelect={() => {
                    onChange(person.name);
                    setOpen(false);
                  }}
                  disabled={false}
                  className="cursor-pointer hover:bg-accent !opacity-100 !pointer-events-auto"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{person.name}</span>
                      {person.role && (
                        <span className="text-xs text-muted-foreground">
                          {person.role} {person.department && `• ${person.department}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === person.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

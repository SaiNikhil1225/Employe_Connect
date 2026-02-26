import { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Users, TrendingUp } from 'lucide-react';
import { helpdeskService } from '@/services/helpdeskService';
import { toast } from 'sonner';

interface ITEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  specializations: string[];
  team: string;
  status: string;
  activeTicketCount: number;
  maxCapacity: number;
  designation: string;
}

interface ITEmployeeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  specialization?: string;
  disabled?: boolean;
}

export function ITEmployeeSelect({
  value,
  onValueChange,
  specialization,
  disabled = false,
}: ITEmployeeSelectProps) {
  const [employees, setEmployees] = useState<ITEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      let allEmployees = await helpdeskService.getITSpecialists();
      
      // Filter by specialization if provided
      if (specialization) {
        allEmployees = allEmployees.filter((emp: ITEmployee) =>
          emp.specializations.includes(specialization)
        );
      }

      // Sort by workload (ascending) - show less busy employees first
      allEmployees.sort((a: ITEmployee, b: ITEmployee) => {
        const aUtilization = a.activeTicketCount / a.maxCapacity;
        const bUtilization = b.activeTicketCount / b.maxCapacity;
        return aUtilization - bUtilization;
      });

      setEmployees(allEmployees);
    } catch (error) {
      console.error('Failed to load IT employees:', error);
      toast.error('Failed to load IT employees. Please try again.');
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [specialization]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const getWorkloadColor = (activeCount: number, maxCapacity: number) => {
    const utilization = activeCount / maxCapacity;
    if (utilization >= 0.8) return 'text-red-600 dark:text-red-400';
    if (utilization >= 0.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getWorkloadBadge = (activeCount: number, maxCapacity: number) => {
    const utilization = activeCount / maxCapacity;
    if (utilization >= 0.8) return <Badge variant="destructive" className="text-xs">High Load</Badge>;
    if (utilization >= 0.5) return <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">Medium</Badge>;
    return <Badge variant="outline" className="text-xs border-green-500 text-green-600">Available</Badge>;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="it-employee" className="text-sm font-medium">
        Assign to IT Employee
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
        <SelectTrigger id="it-employee" className="w-full">
          <SelectValue placeholder={isLoading ? 'Loading employees...' : 'Select IT employee'} />
        </SelectTrigger>
        <SelectContent>
          {employees.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No available IT employees found
            </div>
          )}
          {employees.map((employee) => (
            <SelectItem key={employee.id} value={employee.id}>
              <div className="flex items-start justify-between gap-3 py-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-brand-green" />
                    <span className="font-medium">{employee.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{employee.team}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{employee.designation}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getWorkloadBadge(employee.activeTicketCount, employee.maxCapacity)}
                  <div className={`text-xs font-medium flex items-center gap-1 ${getWorkloadColor(employee.activeTicketCount, employee.maxCapacity)}`}>
                    <TrendingUp className="h-3 w-3" />
                    <span>{employee.activeTicketCount}/{employee.maxCapacity}</span>
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && employees.find(e => e.id === value) && (
        <p className="text-xs text-muted-foreground">
          Selected: {employees.find(e => e.id === value)?.name} • {employees.find(e => e.id === value)?.team}
        </p>
      )}
    </div>
  );
}

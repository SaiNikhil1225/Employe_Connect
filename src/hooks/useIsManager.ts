import { useMemo, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';

/**
 * Dynamically detects if the current user is a Reporting Manager.
 *
 * A user is a Manager if any employee in the system has
 * `reportingManagerId === currentUser.employeeId`.
 *
 * This check is purely data-driven — no hardcoded role required.
 */
export function useIsManager() {
  const { user } = useAuthStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  // Ensure employees are loaded
  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees();
    }
  }, [employees.length, fetchEmployees]);

  /** True if this user is the reporting manager for at least one employee */
  const isManager = useMemo(() => {
    if (!user?.employeeId || employees.length === 0) return false;
    return employees.some((emp) => emp.reportingManagerId === user.employeeId);
  }, [employees, user?.employeeId]);

  /** All employees who directly report to the current user */
  const reportingEmployees = useMemo(() => {
    if (!user?.employeeId || !isManager) return [];
    return employees.filter((emp) => emp.reportingManagerId === user.employeeId);
  }, [employees, user?.employeeId, isManager]);

  /** Set of employeeIds of direct reports (for fast lookups) */
  const reportingIds = useMemo(
    () => new Set(reportingEmployees.map((emp) => emp.employeeId)),
    [reportingEmployees]
  );

  return { isManager, reportingEmployees, reportingIds };
}

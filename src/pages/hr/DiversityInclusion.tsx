import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Users,
  Calendar,
  Crown,
  Search,
  Download,
  Filter,
  X,
  ChevronDown,
  Sparkles,
  UserPlus,
  FileSpreadsheet,
  FileText,
  FileDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Columns3,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  gender: string;
  age: number;
  department: string;
  location: string;
  grade: string;
  employmentType: string;
  role: string;
  isLeadership: boolean;
  joiningDate: string;
  tenure: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function DiversityInclusion() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters] = useState({
    department: 'all',
    location: 'all',
    grade: 'all',
    employmentType: 'all',
    gender: 'all',
    leadership: 'all',
  });
  
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  
  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/employees`);
      const result = await response.json();

      // Handle different response formats
      let employeeData = [];
      if (Array.isArray(result)) {
        employeeData = result;
      } else if (result.data && Array.isArray(result.data)) {
        employeeData = result.data;
      } else if (result.employees && Array.isArray(result.employees)) {
        employeeData = result.employees;
      }

      // Transform employee data to match the required format
      const formattedEmployees = employeeData
        .filter((emp: any) => emp.status === 'active')
        .map((emp: any) => {
          // Calculate age from date of birth
          let age = 30; // Default age
          if (emp.dateOfBirth) {
            const birthDate = new Date(emp.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }

          // Calculate tenure from joining date
          let tenure = 0;
          if (emp.dateOfJoining) {
            const joinDate = new Date(emp.dateOfJoining);
            const today = new Date();
            tenure = (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          }

          // Determine if employee is in leadership based on role
          const leadershipRoles = ['manager', 'director', 'head', 'lead', 'ceo', 'cto', 'cfo', 'vp'];
          const isLeadership = emp.role === 'MANAGER' || emp.role === 'HR' || emp.role === 'RMG' ||
            (emp.designation && leadershipRoles.some(role => emp.designation.toLowerCase().includes(role)));

          return {
            id: emp.employeeId || emp.id || '',
            name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
            gender: emp.gender || 'Not Specified',
            age: age,
            department: emp.department || 'N/A',
            location: emp.location || 'N/A',
            grade: emp.grade || emp.band || 'N/A',
            employmentType: emp.employmentType || 'Permanent',
            role: emp.designation || emp.role || 'N/A',
            isLeadership: isLeadership,
            joiningDate: emp.dateOfJoining || '',
            tenure: parseFloat(tenure.toFixed(1)),
          };
        });

      setEmployees(formattedEmployees);
      console.log('Loaded employees:', formattedEmployees.length);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Date & Gender filter states
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [filterApplied, setFilterApplied] = useState(false);
  
  // Apply filters
  // Filter employees by date range and gender
  const dateFilteredEmployees = useMemo(() => {
    if (!filterApplied || (!fromDate && !toDate && genderFilter === 'all')) {
      return employees;
    }
    
    return employees.filter(emp => {
      // Gender filter
      const genderMatch = genderFilter === 'all' || emp.gender === genderFilter;
      
      // Date filter
      if (!fromDate && !toDate) {
        return genderMatch;
      }
      
      if (!emp.joiningDate) return genderMatch && !fromDate && !toDate;
      
      try {
        const joinDate = parseISO(emp.joiningDate);
        
        let dateMatch = true;
        if (fromDate && toDate) {
          dateMatch = isWithinInterval(joinDate, {
            start: startOfDay(fromDate),
            end: endOfDay(toDate)
          });
        } else if (fromDate) {
          dateMatch = joinDate >= startOfDay(fromDate);
        } else if (toDate) {
          dateMatch = joinDate <= endOfDay(toDate);
        }
        
        return genderMatch && dateMatch;
      } catch {
        return genderMatch && (!fromDate && !toDate);
      }
    });
  }, [filterApplied, fromDate, toDate, genderFilter, employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return dateFilteredEmployees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = filters.department === 'all' || employee.department === filters.department;
      const matchesLocation = filters.location === 'all' || employee.location === filters.location;
      const matchesGrade = filters.grade === 'all' || employee.grade === filters.grade;
      const matchesEmpType = filters.employmentType === 'all' || employee.employmentType === filters.employmentType;
      const matchesGender = filters.gender === 'all' || employee.gender === filters.gender;
      const matchesLeadership = filters.leadership === 'all' || 
                                (filters.leadership === 'yes' && employee.isLeadership) ||
                                (filters.leadership === 'no' && !employee.isLeadership);
      
      return matchesSearch && matchesDept && matchesLocation && matchesGrade && 
             matchesEmpType && matchesGender && matchesLeadership;
    });
  }, [dateFilteredEmployees, searchQuery, filters]);

  // Calculate KPIs - now based on all filtered employees (date, gender, department, location, etc.)
  const kpis = useMemo(() => {
    const employees = filteredEmployees;
    const total = employees.length;
    
    // Handle empty employee list
    if (total === 0) {
      return {
        total: 0,
        maleCount: 0,
        femaleCount: 0,
        otherCount: 0,
        malePercent: '0',
        femalePercent: '0',
        otherPercent: '0',
        ageGroups: { '18-24': 0, '25-30': 0, '31-40': 0, '41-50': 0, '51+': 0 },
        avgAge: 0,
        leadershipCount: 0,
        womenInLeadership: 0,
        womenInLeadershipPercent: '0',
        departmentStats: [],
      };
    }
    
    // Gender Ratio
    const maleCount = employees.filter(e => e.gender === 'Male').length;
    const femaleCount = employees.filter(e => e.gender === 'Female').length;
    const otherCount = employees.filter(e => e.gender === 'Non-Binary').length;
    
    // Age Distribution
    const ageGroups = {
      '18-24': employees.filter(e => e.age >= 18 && e.age <= 24).length,
      '25-30': employees.filter(e => e.age >= 25 && e.age <= 30).length,
      '31-40': employees.filter(e => e.age >= 31 && e.age <= 40).length,
      '41-50': employees.filter(e => e.age >= 41 && e.age <= 50).length,
      '51+': employees.filter(e => e.age >= 51).length,
    };
    const avgAge = Math.round(employees.reduce((sum, e) => sum + e.age, 0) / total);
    
    // Leadership
    const leadershipCount = employees.filter(e => e.isLeadership).length;
    const womenInLeadership = employees.filter(e => e.isLeadership && e.gender === 'Female').length;
    const womenInLeadershipPercent = leadershipCount > 0 ? ((womenInLeadership / leadershipCount) * 100).toFixed(1) : '0';
    
    // Department Diversity
    const departments = Array.from(new Set(employees.map(e => e.department)));
    const departmentStats = departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptMale = deptEmployees.filter(e => e.gender === 'Male').length;
      const deptFemale = deptEmployees.filter(e => e.gender === 'Female').length;
      const deptOther = deptEmployees.filter(e => e.gender === 'Non-Binary').length;
      
      // Calculate diversity score (0-100)
      // Perfect balance would be 50/50, deviation from 50 reduces score
      const femalePercent = (deptFemale / deptEmployees.length) * 100;
      const deviation = Math.abs(50 - femalePercent);
      const diversityScore = Math.max(0, 100 - (deviation * 2));
      
      return {
        department: dept,
        total: deptEmployees.length,
        male: deptMale,
        female: deptFemale,
        other: deptOther,
        femalePercent: ((deptFemale / deptEmployees.length) * 100).toFixed(1),
        diversityScore: diversityScore.toFixed(1),
      };
    });
    
    return {
      total,
      maleCount,
      femaleCount,
      otherCount,
      malePercent: ((maleCount / total) * 100).toFixed(1),
      femalePercent: ((femaleCount / total) * 100).toFixed(1),
      otherPercent: ((otherCount / total) * 100).toFixed(1),
      ageGroups,
      avgAge,
      leadershipCount,
      womenInLeadership,
      womenInLeadershipPercent,
      departmentStats,
    };
  }, [filteredEmployees]);

  const hasActiveFilters = Object.values(filters).some(f => f !== 'all') || searchQuery;
  
  // Toggle column visibility
  const toggleColumnVisibility = (key: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  // Column definitions for DataTable
  const employeeTableColumns: DataTableColumn<any>[] = [
    {
      key: 'id',
      label: 'Employee ID',
      sortable: true,
      align: 'left',
      width: '130px',
      sticky: 'left',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      align: 'left',
      width: '180px',
      sticky: 'left',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true,
      align: 'left',
      width: '100px',
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true,
      align: 'left',
      width: '80px',
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      align: 'left',
      width: '140px',
      render: (value) => <Badge variant="outline" className="font-normal">{value}</Badge>,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      align: 'left',
      width: '120px',
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: 'grade',
      label: 'Grade',
      sortable: true,
      align: 'left',
      width: '110px',
      render: (value) => <Badge variant="secondary" className="font-normal">{value}</Badge>,
    },
    {
      key: 'employmentType',
      label: 'Employment Type',
      sortable: true,
      align: 'left',
      width: '150px',
      render: (value) => (
        <Badge variant={value === 'Permanent' ? 'default' : 'outline'} className="font-normal">
          {value}
        </Badge>
      ),
    },
    {
      key: 'holidayPlan',
      label: 'Holiday Plan',
      sortable: true,
      align: 'left',
      width: '130px',
      render: (value) => (
        <Badge variant="secondary" className="text-xs font-normal">
          {value || 'India'}
        </Badge>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      align: 'left',
      width: '180px',
      render: (value) => <span className="text-sm truncate block" title={value}>{value}</span>,
    },
    {
      key: 'joiningDate',
      label: 'Date of Joining',
      sortable: true,
      align: 'left',
      width: '140px',
      render: (value) => <span className="text-sm font-medium">{formatDate(value, 'dd MMM yyyy')}</span>,
    },
    {
      key: 'tenure',
      label: 'Tenure (Years)',
      sortable: true,
      align: 'left',
      width: '130px',
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: 'isLeadership',
      label: 'Leadership',
      sortable: true,
      align: 'left',
      width: '120px',
      render: (value) => (
        value ? (
          <Badge className="bg-amber-600 font-normal">
            <Crown className="h-3 w-3 mr-1" />
            Yes
          </Badge>
        ) : (
          <span className="text-gray-500 text-sm">No</span>
        )
      ),
    },
  ];
  
  // Date formatting helper
  const formatDate = (dateString: string | undefined | null, formatStr: string = 'dd MMM yyyy'): string => {
    try {
      if (!dateString || dateString.trim() === '') {
        return 'N/A';
      }
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return format(date, formatStr);
    } catch {
      return 'N/A';
    }
  };

  // Export full diversity report - CSV format
  const exportFullReportCSV = () => {
    const dateRange = filterApplied && (fromDate || toDate)
      ? `${fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Start'} - ${toDate ? format(toDate, 'MMM dd, yyyy') : 'End'}`
      : 'All Time';
    const genderFilterText = genderFilter !== 'all' ? genderFilter : 'All Genders';

    let csvContent = 'Diversity & Inclusion Report\n';
    csvContent += `Report Date:,${format(new Date(), 'MMM dd, yyyy')}\n`;
    csvContent += `Date Range:,${dateRange}\n`;
    csvContent += `Gender Filter:,${genderFilterText}\n`;
    csvContent += `Total Employees:,${kpis.total}\n\n`;
    
    csvContent += 'GENDER DISTRIBUTION\n';
    csvContent += `Male,${kpis.maleCount},${kpis.malePercent}%\n`;
    csvContent += `Female,${kpis.femaleCount},${kpis.femalePercent}%\n`;
    csvContent += `Other,${kpis.otherCount},${kpis.otherPercent}%\n\n`;
    
    csvContent += 'LEADERSHIP\n';
    csvContent += `Total Leaders,${kpis.leadershipCount}\n`;
    csvContent += `Women in Leadership,${kpis.womenInLeadership},${kpis.womenInLeadershipPercent}%\n\n`;
    
    csvContent += 'AGE DISTRIBUTION\n';
    Object.entries(kpis.ageGroups).forEach(([range, count]) => {
      csvContent += `${range} years,${count}\n`;
    });
    csvContent += `Average Age,${kpis.avgAge}\n\n`;
    
    csvContent += 'EMPLOYEE DETAILS\n';
    csvContent += 'Employee ID,Name,Gender,Age,Department,Location,Grade,Employment Type,Role,Date of Joining,Tenure (Years),Leadership\n';
    
    dateFilteredEmployees.forEach(emp => {
      csvContent += `${emp.id},${emp.name},${emp.gender},${emp.age},${emp.department},${emp.location},${emp.grade},${emp.employmentType},"${emp.role}",${formatDate(emp.joiningDate)},${emp.tenure},${emp.isLeadership ? 'Yes' : 'No'}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `diversity-inclusion-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Export full diversity report - Excel format
  const exportFullReportExcel = () => {
    const dateRange = filterApplied && (fromDate || toDate)
      ? `${fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Start'} - ${toDate ? format(toDate, 'MMM dd, yyyy') : 'End'}`
      : 'All Time';
    const genderFilterText = genderFilter !== 'all' ? genderFilter : 'All Genders';

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Diversity & Inclusion Report'],
      ['Report Date:', format(new Date(), 'MMM dd, yyyy')],
      ['Date Range:', dateRange],
      ['Gender Filter:', genderFilterText],
      ['Total Employees:', kpis.total],
      [],
      ['GENDER DISTRIBUTION'],
      ['Gender', 'Count', 'Percentage'],
      ['Male', kpis.maleCount, `${kpis.malePercent}%`],
      ['Female', kpis.femaleCount, `${kpis.femalePercent}%`],
      ['Other', kpis.otherCount, `${kpis.otherPercent}%`],
      [],
      ['LEADERSHIP'],
      ['Metric', 'Value'],
      ['Total Leaders', kpis.leadershipCount],
      ['Women in Leadership', kpis.womenInLeadership],
      ['Women in Leadership %', `${kpis.womenInLeadershipPercent}%`],
      [],
      ['AGE DISTRIBUTION'],
      ['Age Range', 'Count'],
      ...Object.entries(kpis.ageGroups).map(([range, count]) => [`${range} years`, count]),
      ['Average Age', kpis.avgAge],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Employee details sheet
    const employeeData = [
      ['Employee ID', 'Name', 'Gender', 'Age', 'Department', 'Location', 'Grade', 'Employment Type', 'Role', 'Date of Joining', 'Tenure (Years)', 'Leadership'],
      ...dateFilteredEmployees.map(emp => [
        emp.id,
        emp.name,
        emp.gender,
        emp.age,
        emp.department,
        emp.location,
        emp.grade,
        emp.employmentType,
        emp.role,
        formatDate(emp.joiningDate),
        emp.tenure,
        emp.isLeadership ? 'Yes' : 'No'
      ])
    ];
    const employeeSheet = XLSX.utils.aoa_to_sheet(employeeData);
    XLSX.utils.book_append_sheet(wb, employeeSheet, 'Employee Details');

    XLSX.writeFile(wb, `diversity-inclusion-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  // Export full diversity report - PDF format
  const exportFullReportPDF = () => {
    const dateRange = filterApplied && (fromDate || toDate)
      ? `${fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Start'} - ${toDate ? format(toDate, 'MMM dd, yyyy') : 'End'}`
      : 'All Time';
    const genderFilterText = genderFilter !== 'all' ? genderFilter : 'All Genders';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Diversity & Inclusion Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
          h2 { color: #4f46e5; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4f46e5; color: white; }
          .info { margin: 5px 0; }
          .section { margin: 20px 0; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">Print / Save as PDF</button>
        <h1>Diversity & Inclusion Report</h1>
        <div class="info"><strong>Report Date:</strong> ${format(new Date(), 'MMM dd, yyyy')}</div>
        <div class="info"><strong>Date Range:</strong> ${dateRange}</div>
        <div class="info"><strong>Gender Filter:</strong> ${genderFilterText}</div>
        <div class="info"><strong>Total Employees:</strong> ${kpis.total}</div>
        
        <div class="section">
          <h2>Gender Distribution</h2>
          <table>
            <thead><tr><th>Gender</th><th>Count</th><th>Percentage</th></tr></thead>
            <tbody>
              <tr><td>Male</td><td>${kpis.maleCount}</td><td>${kpis.malePercent}%</td></tr>
              <tr><td>Female</td><td>${kpis.femaleCount}</td><td>${kpis.femalePercent}%</td></tr>
              <tr><td>Other</td><td>${kpis.otherCount}</td><td>${kpis.otherPercent}%</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Leadership</h2>
          <table>
            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td>Total Leaders</td><td>${kpis.leadershipCount}</td></tr>
              <tr><td>Women in Leadership</td><td>${kpis.womenInLeadership}</td></tr>
              <tr><td>Women in Leadership %</td><td>${kpis.womenInLeadershipPercent}%</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Age Distribution</h2>
          <table>
            <thead><tr><th>Age Range</th><th>Count</th></tr></thead>
            <tbody>
              ${Object.entries(kpis.ageGroups).map(([range, count]) => 
                `<tr><td>${range} years</td><td>${count}</td></tr>`
              ).join('')}
              <tr><td><strong>Average Age</strong></td><td><strong>${kpis.avgAge}</strong></td></tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Employee Details</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Gender</th><th>Age</th><th>Department</th>
                <th>Location</th><th>Grade</th><th>Type</th><th>Role</th>
                <th>Joining Date</th><th>Tenure</th><th>Leadership</th>
              </tr>
            </thead>
            <tbody>
              ${dateFilteredEmployees.map(emp => `
                <tr>
                  <td>${emp.id}</td>
                  <td>${emp.name}</td>
                  <td>${emp.gender}</td>
                  <td>${emp.age}</td>
                  <td>${emp.department}</td>
                  <td>${emp.location}</td>
                  <td>${emp.grade}</td>
                  <td>${emp.employmentType}</td>
                  <td>${emp.role}</td>
                  <td>${formatDate(emp.joiningDate)}</td>
                  <td>${emp.tenure}</td>
                  <td>${emp.isLeadership ? 'Yes' : 'No'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Export employee table - CSV format
  const exportEmployeeTableCSV = () => {
    const dateRange = filterApplied && (fromDate || toDate)
      ? ` (${fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Start'} - ${toDate ? format(toDate, 'MMM dd, yyyy') : 'End'})`
      : '';
    const genderFilterText = genderFilter !== 'all' ? ` - ${genderFilter}` : '';
    
    let csvContent = `Employee Directory${dateRange}${genderFilterText}\n`;
    csvContent += `Export Date:,${format(new Date(), 'MMM dd, yyyy')}\n`;
    csvContent += `Total Records:,${filteredEmployees.length}\n\n`;
    csvContent += 'Employee ID,Name,Gender,Age,Department,Location,Grade,Employment Type,Role,Date of Joining,Tenure (Years),Leadership\n';
    
    filteredEmployees.forEach(emp => {
      csvContent += `${emp.id},${emp.name},${emp.gender},${emp.age},${emp.department},${emp.location},${emp.grade},${emp.employmentType},"${emp.role}",${formatDate(emp.joiningDate)},${emp.tenure},${emp.isLeadership ? 'Yes' : 'No'}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employee-directory-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Export employee table - Excel format
  const exportEmployeeTableExcel = () => {
    const dateRange = filterApplied && (fromDate || toDate)
      ? ` (${fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Start'} - ${toDate ? format(toDate, 'MMM dd, yyyy') : 'End'})`
      : '';
    const genderFilterText = genderFilter !== 'all' ? ` - ${genderFilter}` : '';

    const wb = XLSX.utils.book_new();
    const wsData = [
      [`Employee Directory${dateRange}${genderFilterText}`],
      [`Export Date: ${format(new Date(), 'MMM dd, yyyy')}`],
      [`Total Records: ${filteredEmployees.length}`],
      [],
      ['Employee ID', 'Name', 'Gender', 'Age', 'Department', 'Location', 'Grade', 'Employment Type', 'Role', 'Date of Joining', 'Tenure (Years)', 'Leadership'],
      ...filteredEmployees.map(emp => [
        emp.id,
        emp.name,
        emp.gender,
        emp.age,
        emp.department,
        emp.location,
        emp.grade,
        emp.employmentType,
        emp.role,
        formatDate(emp.joiningDate),
        emp.tenure,
        emp.isLeadership ? 'Yes' : 'No'
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Directory');
    XLSX.writeFile(wb, `employee-directory-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  // Export employee table - PDF format
  const exportEmployeeTablePDF = () => {
    const dateRange = filterApplied && (fromDate || toDate)
      ? ` (${fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Start'} - ${toDate ? format(toDate, 'MMM dd, yyyy') : 'End'})`
      : '';
    const genderFilterText = genderFilter !== 'all' ? ` - ${genderFilter}` : '';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Employee Directory</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #4f46e5; color: white; }
          .info { margin: 5px 0; }
          @media print {
            button { display: none; }
            body { padding: 10px; }
            table { font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">Print / Save as PDF</button>
        <h1>Employee Directory${dateRange}${genderFilterText}</h1>
        <div class="info"><strong>Export Date:</strong> ${format(new Date(), 'MMM dd, yyyy')}</div>
        <div class="info"><strong>Total Records:</strong> ${filteredEmployees.length}</div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Gender</th><th>Age</th><th>Department</th>
              <th>Location</th><th>Grade</th><th>Type</th><th>Role</th>
              <th>Joining Date</th><th>Tenure</th><th>Leader</th>
            </tr>
          </thead>
          <tbody>
            ${filteredEmployees.map(emp => `
              <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${emp.gender}</td>
                <td>${emp.age}</td>
                <td>${emp.department}</td>
                <td>${emp.location}</td>
                <td>${emp.grade}</td>
                <td>${emp.employmentType}</td>
                <td>${emp.role}</td>
                <td>${formatDate(emp.joiningDate)}</td>
                <td>${emp.tenure}</td>
                <td>${emp.isLeadership ? 'Yes' : 'No'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Stats data for dashboard-style stat cards
  const stats = [
    {
      label: filterApplied ? 'New Joiners' : 'Gender Balance',
      value: filterApplied ? `${kpis.total}` : `${kpis.femalePercent}%`,
      subValue: filterApplied ? `In selected period` : `Female representation`,
      icon: filterApplied ? UserPlus : Users,
      color: 'text-pink-600 dark:text-pink-400',
      trend: filterApplied ? undefined : 2.5,
    },
    {
      label: filterApplied ? 'Male Joined' : 'Average Age',
      value: filterApplied ? `${kpis.maleCount}` : `${kpis.avgAge}`,
      subValue: filterApplied ? `${kpis.malePercent}% of new joiners` : `${kpis.total} employees`,
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: filterApplied ? 'Female Joined' : 'Women in Leadership',
      value: filterApplied ? `${kpis.femaleCount}` : `${kpis.womenInLeadershipPercent}%`,
      subValue: filterApplied ? `${kpis.femalePercent}% of new joiners` : `${kpis.womenInLeadership} of ${kpis.leadershipCount} leaders`,
      icon: Crown,
      color: 'text-amber-600 dark:text-amber-400',
      trend: filterApplied ? undefined : (parseFloat(kpis.womenInLeadershipPercent) >= 40 ? 1.2 : -0.8),
    },
    {
      label: 'Diversity Score',
      value: '68.5',
      subValue: filterApplied ? `${kpis.total} total in period` : 'Company-wide metric',
      icon: Sparkles,
      color: 'text-indigo-600 dark:text-indigo-400',
      trend: filterApplied ? undefined : 5.2,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading diversity data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diversity Management Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">Diversity Analytics</h2>
            <p className="text-sm text-muted-foreground">Filter by gender and date range to analyze diversity metrics
              {filterApplied && (
                <span className="ml-2 text-orange-600 font-medium">
                  (Filtered: 
                  {genderFilter !== 'all' && (
                    <span> Gender: {genderFilter}</span>
                  )}
                  {genderFilter !== 'all' && (fromDate || toDate) && ' • '}
                  {fromDate && toDate 
                    ? `${format(fromDate, 'MMM dd, yyyy')} → ${format(toDate, 'MMM dd, yyyy')}`
                    : fromDate 
                    ? `From ${format(fromDate, 'MMM dd, yyyy')}`
                    : toDate ? `Until ${format(toDate, 'MMM dd, yyyy')}` : ''})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <Button 
            variant="outline" 
            className="h-10"
            onClick={() => setShowFilterPopover(!showFilterPopover)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilterPopover ? 'Hide Filters' : 'Show Filters'}
            {filterApplied && (
              <span className="ml-2 flex h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2">
                <Download className="h-4 w-4" />
                Export Report
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportFullReportExcel} className="gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportFullReportCSV} className="gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                CSV (.csv)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportFullReportPDF} className="gap-2">
                <FileDown className="h-4 w-4 text-red-600" />
                PDF (Print)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Expandable Filter Section */}
      {showFilterPopover && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Filter Options</h4>
              <Button variant="ghost" size="sm" onClick={() => {
                setGenderFilter('all');
                setFromDate(undefined);
                setToDate(undefined);
                setFilterApplied(false);
              }} className="h-7 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Gender Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</label>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Non-Binary">Non-Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* From Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">From Date</label>
                <Popover open={showFromCalendar} onOpenChange={setShowFromCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'MMM dd, yyyy') : 'Select from date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      selected={fromDate}
                      onSelect={(date) => {
                        setFromDate(date);
                        setShowFromCalendar(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">To Date</label>
                <Popover open={showToCalendar} onOpenChange={setShowToCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, 'MMM dd, yyyy') : 'Select to date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      selected={toDate}
                      onSelect={(date) => {
                        setToDate(date);
                        setShowToCalendar(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Selected Filters Display */}
            {(fromDate || toDate || genderFilter !== 'all') && (
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {genderFilter !== 'all' && (
                    <span className="font-medium">
                      Gender: {genderFilter}
                      {(fromDate || toDate) && ' • '}
                    </span>
                  )}
                  {(fromDate || toDate) && (
                    <span>
                      {fromDate && toDate
                        ? `${format(fromDate, 'MMM dd, yyyy')} → ${format(toDate, 'MMM dd, yyyy')}`
                        : fromDate
                        ? `From ${format(fromDate, 'MMM dd, yyyy')}`
                        : `Until ${format(toDate!, 'MMM dd, yyyy')}`}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={() => {
                  setFilterApplied(true);
                  setShowFilterPopover(false);
                }}
                className="flex-1"
                size="sm"
              >
                <Filter className="h-3 w-3 mr-2" />
                Apply Filters
              </Button>
              <Button
                onClick={() => {
                  setGenderFilter('all');
                  setFromDate(undefined);
                  setToDate(undefined);
                  setFilterApplied(false);
                  setShowFilterPopover(false);
                }}
                variant="outline"
                size="sm"
               className="flex-1"
              >
                Clear All
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          // Define card styling per metric
          const cardStyles = [
            'border-l-4 border-l-pink-500',
            'border-l-4 border-l-green-500',
            'border-l-4 border-l-amber-500',
            'border-l-4 border-l-indigo-500'
          ];
          
          const iconStyles = [
            'bg-pink-100 dark:bg-pink-900/30',
            'bg-green-100 dark:bg-green-900/30',
            'bg-amber-100 dark:bg-amber-900/30',
            'bg-indigo-100 dark:bg-indigo-900/30'
          ];
          
          return (
            <Card key={stat.label} className={`hover:shadow-md transition-shadow rounded-xl shadow-sm ${cardStyles[index]}`}>
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                {Icon && (
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconStyles[index]}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.trend !== undefined && stat.trend !== 0 && (
                      <div className={`flex items-center text-xs font-medium ${
                        stat.trend > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : stat.trend < 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-muted-foreground'
                      }`}>
                        {stat.trend > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : stat.trend < 0 ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        <span>{Math.abs(stat.trend)}</span>
                      </div>
                    )}
                  </div>
                  {stat.subValue && (
                    <div className="text-xs text-muted-foreground mt-1">{stat.subValue}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Employee Directory Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Employee Directory</CardTitle>
              <CardDescription className="mt-1">
                {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
                {hasActiveFilters && ' (filtered)'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Search Bar */}
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Column Visibility Toggle */}
              <DropdownMenu open={showColumnToggle} onOpenChange={setShowColumnToggle}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9">
                    <Columns3 className="h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Toggle Columns</div>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    {employeeTableColumns.map((column) => (
                      <DropdownMenuItem
                        key={column.key}
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer py-1.5 px-2"
                      >
                        <div className="flex items-center gap-2 w-full" onClick={() => toggleColumnVisibility(column.key)}>
                          <Checkbox
                            checked={columnVisibility[column.key] !== false}
                            onCheckedChange={() => toggleColumnVisibility(column.key)}
                            className="h-3.5 w-3.5"
                          />
                          <span className="flex-1 text-xs">{column.label}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportEmployeeTableExcel} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportEmployeeTableCSV} className="gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    CSV (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportEmployeeTablePDF} className="gap-2">
                    <FileDown className="h-4 w-4 text-red-600" />
                    PDF (Print)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* DataTable */}
          <DataTable
            data={filteredEmployees}
            columns={employeeTableColumns.map(col => ({ 
              ...col, 
              hidden: columnVisibility[col.key] === false 
            }))}
            searchable={false}
            hideColumnToggle={true}
            pageSize={15}
            emptyMessage={hasActiveFilters 
              ? 'No employees found. Try adjusting your search filters to see more results.'
              : 'No employees in the system yet.'}
          />
        </CardContent>
      </Card>
    </div>
  );
}

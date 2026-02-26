import * as XLSX from 'xlsx';
import { getExperienceBreakdown } from '@/lib/experienceUtils';

export interface EmployeeExportData {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  location?: string;
  email: string;
  phone: string;
  dateOfJoining?: string;
  status: string;
  previousExperience?: {
    years?: number;
    months?: number;
  };
}

/**
 * Export employees to Excel with selected columns
 */
export function exportToExcel(
  employees: EmployeeExportData[], 
  filename: string = 'employees',
  selectedColumns?: string[]
) {
  // Prepare data for export
  const exportData = employees.map(emp => {
    const experienceData = getExperienceBreakdown(emp.previousExperience, emp.dateOfJoining);
    
    const allData: Record<string, any> = {
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Designation': emp.designation,
      'Department': emp.department,
      'Location': emp.location || 'Not specified',
      'Email': emp.email || 'Not specified',
      'Mobile': emp.phone || 'Not specified',
      'Date of Joining': emp.dateOfJoining 
        ? new Date(emp.dateOfJoining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Not specified',
      'Previous Experience': experienceData.previousExperience.formatted,
      'Previous Exp (Years)': experienceData.previousExperience.years,
      'Previous Exp (Months)': experienceData.previousExperience.months,
      'Acuvate Experience': experienceData.acuvateExperience.formatted,
      'Acuvate Exp (Months)': experienceData.acuvateExperience.totalMonths,
      'Total Experience': experienceData.totalExperience.formatted,
      'Total Exp (Months)': experienceData.totalExperience.totalMonths,
      'Status': emp.status,
    };

    // Filter by selected columns if provided
    if (selectedColumns && selectedColumns.length > 0) {
      const columnMap: Record<string, string> = {
        'employeeId': 'Employee ID',
        'name': 'Name',
        'designation': 'Designation',
        'department': 'Department',
        'location': 'Location',
        'email': 'Email',
        'phone': 'Mobile',
        'dateOfJoining': 'Date of Joining',
        'previousExp': 'Previous Experience',
        'previousExpYears': 'Previous Exp (Years)',
        'previousExpMonths': 'Previous Exp (Months)',
        'acuvateExp': 'Acuvate Experience',
        'acuvateExpMonths': 'Acuvate Exp (Months)',
        'totalExp': 'Total Experience',
        'totalExpMonths': 'Total Exp (Months)',
        'status': 'Status',
      };

      const filtered: Record<string, any> = {};
      selectedColumns.forEach(colId => {
        const columnName = columnMap[colId];
        if (columnName && allData[columnName] !== undefined) {
          filtered[columnName] = allData[columnName];
        }
      });
      return filtered;
    }
    
    return allData;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Employee ID
    { wch: 25 }, // Name
    { wch: 20 }, // Designation
    { wch: 20 }, // Department
    { wch: 15 }, // Location
    { wch: 30 }, // Email
    { wch: 15 }, // Mobile
    { wch: 15 }, // Date of Joining
    { wch: 20 }, // Previous Experience
    { wch: 15 }, // Previous Exp (Years)
    { wch: 15 }, // Previous Exp (Months)
    { wch: 20 }, // Acuvate Experience
    { wch: 15 }, // Acuvate Exp (Months)
    { wch: 20 }, // Total Experience
    { wch: 15 }, // Total Exp (Months)
    { wch: 12 }, // Status
  ];
  worksheet['!cols'] = columnWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  // Download
  XLSX.writeFile(workbook, fullFilename);
}

/**
 * Export employees to CSV with selected columns
 */
export function exportToCSV(
  employees: EmployeeExportData[], 
  filename: string = 'employees',
  selectedColumns?: string[]
) {
  // Prepare data for export
  const exportData = employees.map(emp => {
    const experienceData = getExperienceBreakdown(emp.previousExperience, emp.dateOfJoining);
    
    const allData: Record<string, any> = {
      'Employee ID': emp.employeeId,
      'Name': emp.name,
      'Designation': emp.designation,
      'Department': emp.department,
      'Location': emp.location || 'Not specified',
      'Email': emp.email || 'Not specified',
      'Mobile': emp.phone || 'Not specified',
      'Date of Joining': emp.dateOfJoining 
        ? new Date(emp.dateOfJoining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Not specified',
      'Previous Experience': experienceData.previousExperience.formatted,
      'Previous Exp (Years)': experienceData.previousExperience.years,
      'Previous Exp (Months)': experienceData.previousExperience.months,
      'Acuvate Experience': experienceData.acuvateExperience.formatted,
      'Acuvate Exp (Months)': experienceData.acuvateExperience.totalMonths,
      'Total Experience': experienceData.totalExperience.formatted,
      'Total Exp (Months)': experienceData.totalExperience.totalMonths,
      'Status': emp.status,
    };

    // Filter by selected columns if provided
    if (selectedColumns && selectedColumns.length > 0) {
      const columnMap: Record<string, string> = {
        'employeeId': 'Employee ID',
        'name': 'Name',
        'designation': 'Designation',
        'department': 'Department',
        'location': 'Location',
        'email': 'Email',
        'phone': 'Mobile',
        'dateOfJoining': 'Date of Joining',
        'previousExp': 'Previous Experience',
        'previousExpYears': 'Previous Exp (Years)',
        'previousExpMonths': 'Previous Exp (Months)',
        'acuvateExp': 'Acuvate Experience',
        'acuvateExpMonths': 'Acuvate Exp (Months)',
        'totalExp': 'Total Experience',
        'totalExpMonths': 'Total Exp (Months)',
        'status': 'Status',
      };

      const filtered: Record<string, any> = {};
      selectedColumns.forEach(colId => {
        const columnName = columnMap[colId];
        if (columnName && allData[columnName] !== undefined) {
          filtered[columnName] = allData[columnName];
        }
      });
      return filtered;
    }
    
    return allData;
  });

  // Convert to CSV format
  const headers = Object.keys(exportData[0]);
  const csvContent = [
    headers.join(','), // Header row
    ...exportData.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        const escapedValue = String(value).replace(/"/g, '""');
        return `"${escapedValue}"`;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${timestamp}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export employees to PDF with selected columns
 */
export function exportToPDF(employees: EmployeeExportData[], selectedColumns?: string[]) {
  // For PDF export, we'll create a simple HTML table and use print functionality
  const exportData = employees.map(emp => {
    const experienceData = getExperienceBreakdown(emp.previousExperience, emp.dateOfJoining);
    
    const allData: Record<string, any> = {
      employeeId: emp.employeeId,
      name: emp.name,
      designation: emp.designation,
      department: emp.department,
      location: emp.location || 'Not specified',
      email: emp.email || 'Not specified',
      phone: emp.phone || 'Not specified',
      dateOfJoining: emp.dateOfJoining 
        ? new Date(emp.dateOfJoining).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Not specified',
      previousExp: experienceData.previousExperience.formatted,
      previousExpYears: experienceData.previousExperience.years,
      previousExpMonths: experienceData.previousExperience.months,
      acuvateExp: experienceData.acuvateExperience.formatted,
      acuvateExpMonths: experienceData.acuvateExperience.totalMonths,
      totalExp: experienceData.totalExperience.formatted,
      totalExpMonths: experienceData.totalExperience.totalMonths,
      status: emp.status,
    };

    // Filter by selected columns if provided
    if (selectedColumns && selectedColumns.length > 0) {
      const filtered: Record<string, any> = {};
      selectedColumns.forEach(colId => {
        if (allData[colId] !== undefined) {
          filtered[colId] = allData[colId];
        }
      });
      return filtered;
    }
    
    return allData;
  });

  // Define column headers with labels
  const columnLabels: Record<string, string> = {
    employeeId: 'Employee ID',
    name: 'Name',
    designation: 'Designation',
    department: 'Department',
    location: 'Location',
    email: 'Email',
    phone: 'Mobile',
    dateOfJoining: 'Date of Joining',
    previousExp: 'Previous Experience',
    previousExpYears: 'Previous Exp (Years)',
    previousExpMonths: 'Previous Exp (Months)',
    acuvateExp: 'Acuvate Experience',
    acuvateExpMonths: 'Acuvate Exp (Months)',
    totalExp: 'Total Experience',
    totalExpMonths: 'Total Exp (Months)',
    status: 'Status',
  };

  // Get columns to display
  const columnsToShow = selectedColumns && selectedColumns.length > 0 
    ? selectedColumns 
    : Object.keys(exportData[0]);

  // Create HTML table
  const headers = columnsToShow.map(col => columnLabels[col] || col).join('</th><th>');
  
  const rows = exportData.map(row => {
    const cells = columnsToShow.map(col => row[col] || '').join('</td><td>');
    return `<tr><td>${cells}</td></tr>`;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Employee Directory</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #4f46e5; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h1 { color: #333; }
        @media print {
          @page { size: landscape; margin: 0.5cm; }
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <h1>Employee Directory</h1>
      <p>Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      <table>
        <thead>
          <tr><th>${headers}</th></tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
}

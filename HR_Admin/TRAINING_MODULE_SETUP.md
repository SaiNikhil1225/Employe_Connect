# Training & Development Module - Setup Guide

## Overview
The Training & Development module uses **actual employee data** from your portal. All departments, locations, grades, and employment types are dynamically fetched from existing employees in the database.

## Quick Start

### 1. Ensure Employee Data Exists
Before using the Training module, make sure you have employees in the system with the following fields populated:
- Department
- Location
- Grade/Band
- Employment Type

### 2. Seed Sample Training Data (Optional)
To populate the system with sample training programs based on your actual employees:

```bash
# Run the training data seeder
node seed-training.cjs
```

This will:
- Create 5 sample training programs
- Enroll 20-40% of eligible employees in each program
- Generate skill gap analyses for sample employees
- Use actual departments, locations, and employee data from your system

### 3. Access the Module
Navigate to: **Training & Development** from the HR menu

## Features Using Actual Data

### 📊 Real-Time Metrics
All metrics are calculated from actual data:
- **Training Hours per Employee**: Calculated from completed training enrollments
- **Training Cost per Employee**: Actual costs from training programs
- **Certification Completion %**: Real certification tracking
- **Training Completion Rate**: Actual completion statistics

### 🔍 Dynamic Filters
All filters populate from actual employee data:
- **Departments**: Unique departments from active employees
- **Locations**: Unique locations from employee records
- **Grades/Bands**: Actual grades from employee hierarchy
- **Employment Types**: Real employment types (Permanent, Contract, Intern, etc.)

### 👥 Employee Integration
When creating training programs, the system:
- Pulls actual employee data for enrollment
- Validates employees against target criteria
- Updates employee records with training history
- Tracks real employee progress and certifications

## Adding New Training Programs

### Using Actual Data
1. Go to Training & Development Dashboard
2. Click "Add New Training"
3. Fill in training details
4. **Target Audience**: Select from actual departments, locations, grades, and employment types in your organization
5. System will show available options based on current employees

### Example: Creating a Technical Training
```
Training Name: React Advanced Development
Category: Technical
Target Departments: [Your actual departments like "Engineering", "IT", etc.]
Target Locations: [Your actual locations like "Bangalore", "Mumbai", etc.]
Target Grades: Mid Level, Senior, Lead (from your actual grade structure)
Target Employment Types: Permanent, Contract (from your actual types)
```

## Enrolling Employees

### Manual Enrollment
Use the API or backend to enroll employees:

```bash
# Enroll employee in training
POST http://localhost:5000/api/training/:trainingId/enroll
Body: {
  "employeeId": "actual_employee_id_from_database",
  "nominatedBy": "manager_name",
  "approvedBy": "hr_name"
}
```

### Automatic Enrollment (via Seeder)
The seeder automatically enrolls eligible employees based on:
- Department match
- Location match
- Employment type match
- Grade/level match

## Tracking Employee Progress

### Viewing Training Records
The Training Records tab shows:
- Actual employee names and IDs
- Real departments and locations
- Actual training enrollment dates
- Current completion status
- Real certification statuses

### Updating Progress
```bash
PUT http://localhost:5000/api/training/enrollments/:enrollmentId
Body: {
  "completionStatus": "Completed",
  "hoursCompleted": 40,
  "certificationStatus": "Certified"
}
```

## Skill Gap Analysis

### Creating Skill Gaps
Based on actual employees:

```bash
POST http://localhost:5000/api/training/skill-gaps
Body: {
  "employeeId": "actual_employee_id",
  "employeeName": "actual_employee_name",
  "department": "actual_department",
  "currentSkills": [...],
  "requiredSkills": [...],
  "assessedBy": "manager_name"
}
```

### Viewing Skill Gaps
- Dashboard shows skill gaps aggregated by actual departments
- Priority levels (Critical, High, Medium, Low)
- Number of employees affected per skill
- Recommendations based on available training programs

## Reports and Analytics

### Exporting Data
All exports include actual employee data:
- Employee IDs and names
- Real departments and locations
- Actual training dates and costs
- Current completion statuses

### Analytics Queries
Use filters to analyze:
- Training hours by actual department
- Costs by actual location
- Completion rates by actual grade level
- Certification status by employment type

## API Endpoints

### Get All Trainings
```bash
GET http://localhost:5000/api/training
```

### Get Training Metrics (Filtered by Actual Data)
```bash
GET http://localhost:5000/api/training/analytics/metrics?department=Engineering&location=Bangalore
```

### Get Enrollments (Filtered)
```bash
GET http://localhost:5000/api/training/enrollments/all?department=Engineering
```

### Get Skill Gaps (Filtered)
```bash
GET http://localhost:5000/api/training/skill-gaps/all?department=Engineering&priority=Critical
```

## Data Validation

The system ensures data integrity by:
✅ Validating employee IDs against actual employee records
✅ Checking department/location matches
✅ Verifying grade and employment type compatibility
✅ Tracking real training completion dates
✅ Maintaining accurate cost calculations

## Best Practices

1. **Keep Employee Data Updated**
   - Ensure employee departments, locations, and grades are current
   - Update employment types when employees transition

2. **Regular Skill Gap Assessments**
   - Conduct periodic assessments based on actual job requirements
   - Update skill gaps as employees complete training

3. **Training Program Planning**
   - Create programs targeting actual gaps in your organization
   - Use real department and location data for logistics

4. **Track ROI**
   - Monitor actual costs vs. employee performance improvements
   - Use real completion rates to measure program effectiveness

## Troubleshooting

### No Departments/Locations Showing
**Issue**: Dropdown menus are empty
**Solution**: Ensure employees in the database have these fields populated:
```sql
Check: db.employees.find({ department: { $exists: true, $ne: null } })
```

### Enrollment Fails
**Issue**: Cannot enroll employee
**Solution**: Verify:
- Employee exists in database
- Training has available capacity
- Employee meets target criteria

### Metrics Show Zero
**Issue**: All metrics show 0
**Solution**: 
- Run the seeder to create sample data
- Or manually create enrollments with completion status

## Support

For issues or questions:
1. Check employee data is properly populated
2. Verify backend server is running
3. Check browser console for API errors
4. Review seeder script output for data creation issues

---

**Remember**: This module works entirely with your actual employee data. No dummy or hardcoded values are used for departments, locations, grades, or employee information.

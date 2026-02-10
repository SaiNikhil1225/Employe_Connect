# Project Overview KPI Fix

## Issue
The Project Overview page was displaying hardcoded mock data for KPIs instead of calculating real values from actual project data.

## Changes Made

### File: `src/pages/rmg/projects/ProjectListPage.tsx`

#### 1. Replaced Mock Data with Real Calculations

**Before:**
```typescript
const avgHealthScore = 87; // Mock data
const criticalRisks = projects.filter(p => p.status === 'At Risk').length;
const budgetUtilization = 70.2; // Mock data
```

**After:**
```typescript
// Calculate average health score based on project utilization
const projectsWithUtilization = projects.filter(p => p.utilization !== undefined && p.utilization !== null);
const avgHealthScore = projectsWithUtilization.length > 0
  ? Math.round(projectsWithUtilization.reduce((sum, p) => sum + (p.utilization || 0), 0) / projectsWithUtilization.length)
  : 0;

// Critical risks are projects on hold or with low utilization
const criticalRisks = projects.filter(p => 
  p.status === 'On Hold' || (p.utilization !== undefined && p.utilization < 50)
).length;

// Calculate budget utilization: projects with budget data
const projectsWithBudget = projects.filter(p => p.budget && p.budget > 0 && p.estimatedValue);
const budgetUtilization = projectsWithBudget.length > 0
  ? Math.round(
      (projectsWithBudget.reduce((sum, p) => sum + ((p.estimatedValue || 0) / (p.budget || 1)), 0) / projectsWithBudget.length) * 100 * 10
    ) / 10
  : 0;
```

#### 2. Updated KPI Badge Texts with Real Data

**Before:**
- Total Projects: `"+3 New this month"` (hardcoded)
- Active Projects: `"+3 New this month"` (hardcoded)
- Avg. Health Score: `"+4% vs last quarter"` (hardcoded)
- Critical Risks: `"Action Req · High Priority"` (static)
- Budget Utilization: `"68% New this month"` (hardcoded)

**After:**
- Total Projects: Shows `"X Draft"` if draft projects exist, otherwise `"All Tracked"`
- Active Projects: Shows `"X% of Total"` (calculated percentage)
- Avg. Health Score: Shows `"Healthy"` (≥70%), `"Fair"` (≥50%), or `"Needs Attention"` (<50%)
- Critical Risks: Shows `"Action Required"` if risks exist, otherwise `"No Issues"`
- Budget Utilization: Shows `"X Projects Tracked"` (count of projects with budget data)

#### 3. Added Dynamic Badge Variants

Badge colors now change based on actual data:
- Health Score: Green (≥70%), Gray (≥50%), Red (<50%)
- Critical Risks: Red (>0), Green (0)
- Total Projects: Gray (has drafts), Green (no drafts)

## KPI Calculation Logic

### 1. **Avg. Health Score**
- Calculates average of `utilization` field across all projects that have utilization data
- Falls back to 0% if no projects have utilization data
- Based on resource utilization percentage per project

### 2. **Critical Risks**
- Counts projects with status "On Hold" OR utilization < 50%
- Provides early warning for underperforming or stalled projects

### 3. **Budget Utilization**
- Calculates: `(Estimated Value / Budget) * 100` for each project
- Averages across all projects that have both budget and estimated value
- Shows % of budget being utilized across portfolio

### 4. **Active Projects**
- Filters projects by status === "Active"
- Shows percentage relative to total projects

### 5. **Total Projects**
- Simple count of all projects
- Badge shows draft count for visibility

## Testing

To verify the fix works correctly:

1. **Projects with Utilization Data:**
   - Create/edit projects with utilization values
   - Verify Avg. Health Score calculates correctly
   - Check badge shows "Healthy", "Fair", or "Needs Attention" based on score

2. **Projects at Risk:**
   - Set a project status to "On Hold"
   - Set a project utilization < 50%
   - Verify Critical Risks count increases
   - Check badge shows "Action Required"

3. **Budget Tracking:**
   - Add projects with budget and estimatedValue fields
   - Verify Budget Utilization calculates correctly
   - Check badge shows "X Projects Tracked"

4. **Active Projects:**
   - Change project statuses between Draft/Active/On Hold/Closed
   - Verify counts update correctly
   - Check percentage calculation in badge

## Benefits

✅ **Real-time Accuracy**: KPIs now reflect actual project data  
✅ **Dynamic Insights**: Badge texts provide contextual information  
✅ **Visual Indicators**: Color-coded badges help identify issues quickly  
✅ **Transparent Metrics**: Clear calculation logic for all KPIs  
✅ **No More Mock Data**: All values come from real project records  

## Future Enhancements

Potential improvements for more advanced KPI tracking:

1. **Historical Trends**: Track month-over-month changes
2. **Predictive Analytics**: Project completion forecasts based on current velocity
3. **Team Performance**: Individual PM/DM performance metrics
4. **Financial Metrics**: Revenue vs. cost analysis
5. **Client Satisfaction**: NPS or CSAT scores per project
6. **Resource Allocation**: Over/under-allocated team members

## Related Files

- `src/pages/rmg/projects/ProjectListPage.tsx` - Main dashboard with KPIs
- `src/types/project.ts` - Project interface definitions
- `server/src/models/Project.ts` - MongoDB Project schema
- `src/stores/projectStore.ts` - Zustand state management for projects

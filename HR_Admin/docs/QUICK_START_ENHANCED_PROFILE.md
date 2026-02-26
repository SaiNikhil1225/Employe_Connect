# Enhanced My Profile UI - Quick Start Guide

## 🎨 What's New?

The My Profile page has been completely redesigned with a **modern, minimal, and professional interface** featuring:

✅ Clean header with avatar and status badge  
✅ Compact quick info bar with icons  
✅ Pill-style tab navigation  
✅ 9 comprehensive sections  
✅ Sticky contextual action menu  
✅ Soft color palette (no harsh colors)  
✅ Card-based layouts with ample white space  
✅ Responsive design for all devices  

## 📁 New Files Created

### Core Components
```
src/components/profile/
├── ProfileHeader.tsx           # Avatar, name, designation, status badge
├── QuickInfoBar.tsx            # Email, phone, location, employee ID
├── TabNavigation.tsx           # Pill-style tabs with icons
└── ContextualActionMenu.tsx    # Sticky action panel (6 actions)
```

### Tab Components
```
src/components/profile/tabs/
├── AboutTab.tsx                # Summary & quick stats
├── ProfileTab.tsx              # Personal info & medical details
├── JobTab.tsx                  # Job details & reporting structure
├── TimeTab.tsx                 # Tenure & leave balances
├── DocumentsTab.tsx            # Document upload alerts & list
├── OnboardingTab.tsx           # Onboarding progress & tasks
├── FinancesTab.tsx             # Salary & bank details
├── ExpensesTab.tsx             # Expense tracking
└── PerformanceTab.tsx          # Performance ratings & reviews
```

### Main Page
```
src/pages/employee/
├── EnhancedMyProfile.tsx       # New main component (ACTIVE)
├── Profile.tsx                 # Updated to use EnhancedMyProfile
├── EnhancedProfile.tsx         # Old version (reference)
└── Profile.old.tsx             # Legacy version (reference)
```

## 🎯 Key Features

### 1. Minimal Header
- **Gradient Background**: Subtle blue-to-purple gradient
- **Avatar**: 24x24 rounded with hover-based upload button
- **Status Badge**: Color-coded (Active=Green, Inactive=Gray, On Leave=Amber, Probation=Blue)

### 2. Quick Info Bar
- **4 Essential Details**: Email, Phone, Location, Employee ID
- **Icon-Text Layout**: Icons in colored backgrounds with hover effects
- **Responsive Grid**: 4 columns → 2 columns → 1 column

### 3. Tab Navigation
- **9 Tabs**: About, Profile, Job, Time, Documents, Onboarding, Finances, Expenses, Performance
- **Active Indicator**: Pill-style underline (rounded top)
- **Icons**: Each tab has a relevant icon
- **Scrollable**: Horizontal scroll on mobile

### 4. Documents Section
- **Soft Alert**: Amber background (not harsh red)
- **Pending Count**: Shows number of pending uploads
- **Upload Buttons**: Inline upload for each pending document
- **Verification Badges**: Green for verified, blue for uploaded

### 5. Contextual Actions (Sticky Sidebar)
```
• Download ID Card    (Blue icon)
• Write Note          (Blue icon)
• Request Feedback    (Blue icon)
• Initiate Exit       (Red icon)
• Disable Login       (Red icon)
• Reset Password      (Blue icon)
```

## 🎨 Design System

### Colors Used
```css
/* Primary */
Blue:    50-600 (Primary actions, info)
Purple:  50-600 (Accent, secondary elements)

/* Status */
Emerald: 50-700 (Success, active, verified)
Amber:   50-700 (Warning, pending - SOFT)
Red:     50-700 (Destructive actions)

/* Neutral */
Gray:    50-900 (Text, borders, backgrounds)
```

### Typography
```css
Headings:    text-2xl, text-lg, text-base (font-semibold/bold)
Body:        text-base, text-sm (font-medium/normal)
Labels:      text-xs uppercase (font-medium, tracking-wide)
```

### Spacing
```css
Cards:       p-6, p-8
Gaps:        gap-4, gap-6
Margins:     mb-6, mt-6
Borders:     rounded-lg, rounded-xl
Shadows:     shadow-sm (subtle)
```

## 📱 Responsive Layout

### Desktop (1024px+)
```
┌────────────────────────────────────┐
│  Header + Quick Info               │
│  Tab Navigation                    │
├─────────────────────┬──────────────┤
│  Content (9 cols)   │ Actions (3)  │
│                     │ [Sticky]     │
└─────────────────────┴──────────────┘
```

### Tablet (768px - 1023px)
```
┌────────────────────────────────────┐
│  Header + Quick Info (2 cols)      │
│  Tab Navigation (scrollable)       │
├────────────────────────────────────┤
│  Content (full width)              │
│  Actions (below content)           │
└────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────┐
│  Header          │
│  Quick Info      │
│  (stacked)       │
│  Tabs (scroll→)  │
├──────────────────┤
│  Content         │
│  Actions         │
└──────────────────┘
```

## 🚀 Usage

### Basic (Own Profile)
```tsx
import { Profile } from '@/pages/employee/Profile';

function MyProfilePage() {
  return <Profile />;
}
```

### View Another Employee
```tsx
import { Profile } from '@/pages/employee/Profile';

function ViewEmployeePage() {
  return <Profile employeeId="ACUA0001" />;
}
```

### Direct Component
```tsx
import EnhancedMyProfile from '@/pages/employee/EnhancedMyProfile';

function CustomPage() {
  return <EnhancedMyProfile employeeId="ACUA0001" />;
}
```

## 🔧 Customization

### Change Tab Order
Edit `src/components/profile/TabNavigation.tsx`:
```tsx
export const defaultTabs: TabConfig[] = [
  { id: 'about', label: 'About', icon: <User /> },
  { id: 'profile', label: 'Profile', icon: <Users /> },
  // Add/remove/reorder tabs here
];
```

### Add Custom Action
Edit `src/pages/employee/EnhancedMyProfile.tsx`:
```tsx
const actions: ActionItem[] = [
  ...defaultActions,
  {
    id: 'custom-action',
    label: 'Custom Action',
    icon: <YourIcon className="h-4 w-4" />,
    onClick: () => handleCustomAction(),
  },
];
```

### Modify Colors
Update Tailwind classes in component files:
```tsx
// Change from blue to green
className="bg-blue-50 text-blue-600"
// to
className="bg-green-50 text-green-600"
```

## ✨ Features Per Tab

| Tab | Features |
|-----|----------|
| **About** | Summary, joining date, department, business unit |
| **Profile** | Personal info, medical, emergency contacts, family, education |
| **Job** | Designation, department, employment type, reporting manager |
| **Time** | Tenure, leave balances (annual/sick/casual), working hours |
| **Documents** | Pending alerts, uploaded list, verification status |
| **Onboarding** | Progress bar, task completion, status badges |
| **Finances** | Salary, bank account, IFSC code, payroll info |
| **Expenses** | Total expenses, pending approvals, expense list |
| **Performance** | Rating, review dates, performance goals |

## 📊 Data Requirements

The component expects this data structure:
```typescript
{
  employee: {
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    location: string;
    status: 'active' | 'inactive';
    photo?: string;
    dateOfJoining: string;
    businessUnit?: string;
    reportingManager?: { name: string };
    // ... other fields
  },
  documents: Array<Document>,
  onboarding?: {
    status: 'pending' | 'in-progress' | 'completed';
    progressPercentage: number;
    tasks: Array<Task>;
  }
}
```

## 🐛 Troubleshooting

### Avatar not showing
- Check if `employee.photo` or `employee.profilePhoto` exists
- Verify image URL is accessible
- Fallback to initials is automatic

### Tabs not switching
- Verify `activeTab` state is updating
- Check tab IDs match in TabNavigation and content rendering

### Sidebar not sticky
- Ensure parent has `position: relative`
- Check `sticky top-6` class is applied
- Verify no CSS conflicts

### Data not loading
- Check `employeeManagementService.getEmployeeProfile()` is working
- Verify employee ID is correct
- Check browser console for API errors

## 📚 Documentation

- **Full Implementation**: [ENHANCED_PROFILE_UI.md](./ENHANCED_PROFILE_UI.md)
- **Component Hierarchy**: [PROFILE_UI_COMPONENT_HIERARCHY.md](./PROFILE_UI_COMPONENT_HIERARCHY.md)
- **API Integration**: Check existing employee service documentation

## 🎓 Best Practices

1. **Always use type-safe imports** for TypeScript
2. **Maintain color consistency** across all tabs
3. **Use existing UI components** from `@/components/ui`
4. **Keep animations subtle** (200-300ms transitions)
5. **Test responsive layouts** on mobile/tablet/desktop
6. **Handle loading states** gracefully
7. **Provide fallback data** when values are missing
8. **Use toast notifications** for user feedback

## 🔐 Security Considerations

- Photo uploads should validate file types
- Sensitive data (salary, bank details) should be role-protected
- Action permissions should be checked server-side
- Document uploads should be scanned for malware

## 🚦 Testing

Run these tests after making changes:
```bash
# Type checking
npm run type-check

# Build test
npm run build

# Dev server
npm run dev
```

Visit: `http://localhost:5173/employee/profile`

---

**Status**: ✅ Complete  
**Version**: 1.0.0  
**Last Updated**: February 2, 2026

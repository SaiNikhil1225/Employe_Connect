# Hiring Requests Notification Badge Implementation

## Overview
Added a notification badge to the sidebar navigation for HR users to display the count of pending hiring requests that need attention.

## Implementation Date
December 2024

## Changes Made

### 1. Modified Sidebar Component
**File:** [src/layouts/Sidebar.tsx](src/layouts/Sidebar.tsx)

#### Imports Added
- `useHiringStore` - Access to hiring statistics
- `Badge` component from `@/components/ui/badge`

#### State Management
```typescript
// Hiring statistics for notification badge (HR users only)
const statistics = useHiringStore((state) => state.statistics);
const fetchStatistics = useHiringStore((state) => state.fetchStatistics);
```

#### Statistics Fetching
Added useEffect hook to fetch hiring statistics for HR and SUPER_ADMIN users:
```typescript
useEffect(() => {
  if (user?.role === 'HR' || user?.role === 'SUPER_ADMIN') {
    fetchStatistics();
    
    // Refresh statistics every 2 minutes
    const interval = setInterval(() => {
      fetchStatistics();
    }, 120000);
    
    return () => clearInterval(interval);
  }
}, [user?.role, fetchStatistics]);
```

#### Badge Count Calculation
```typescript
// Calculate pending hiring requests for HR users
const pendingHiringCount = 
  (user.role === 'HR' || user.role === 'SUPER_ADMIN') && statistics
    ? (statistics.byStatus.submitted || 0) + (statistics.byStatus.open || 0)
    : 0;
```

#### Badge Display Logic

**For Expanded Sidebar:**
- Red badge with count appears to the right of "Hiring Requests" menu item
- Shows actual count up to 99, then displays "99+"
- Uses `destructive` variant with custom red styling

```tsx
{item.path === '/hiring/all-requests' && pendingHiringCount > 0 && (
  <Badge 
    variant="destructive" 
    className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-semibold bg-red-500 hover:bg-red-600"
  >
    {pendingHiringCount > 99 ? '99+' : pendingHiringCount}
  </Badge>
)}
```

**For Collapsed Sidebar:**
- Small red dot indicator with count in top-right corner of icon
- Shows actual count up to 9, then displays "9+"
- Positioned absolutely for compact display

```tsx
{isCollapsed && item.path === '/hiring/all-requests' && pendingHiringCount > 0 && (
  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
    <span className="text-[10px] text-white font-bold">
      {pendingHiringCount > 9 ? '9+' : pendingHiringCount}
    </span>
  </div>
)}
```

## Features

### Real-Time Updates
- Statistics refresh automatically every 2 minutes
- Immediate update when user logs in
- Only active for HR and SUPER_ADMIN roles

### Status Tracking
Badge shows total count of:
- **Submitted** requests (newly submitted by managers)
- **Open** requests (acknowledged by HR, awaiting action)

### Responsive Design
- Works seamlessly with sidebar collapse/expand animation
- Different badge styles for collapsed vs expanded states
- Maintains visibility and readability in both modes

### Performance Optimized
- Only fetches statistics for authorized roles (HR/SUPER_ADMIN)
- Cleanup of interval on component unmount
- No unnecessary re-renders

## User Experience

### For HR Users
1. **Visual Indicator:** Red badge immediately shows pending work
2. **At-a-Glance Count:** See exact number of requests needing attention
3. **Always Visible:** Badge persists in both sidebar states
4. **Auto-Updates:** No manual refresh needed to see new requests

### For Other Roles
- No badge displayed for MANAGER, EMPLOYEE, or other roles
- No performance impact from statistics fetching
- Clean navigation experience

## Technical Details

### Dependencies
- Zustand store (`useHiringStore`)
- Hiring statistics API endpoint
- Badge component from shadcn/ui

### Data Source
```typescript
interface HiringStatistics {
  total: number;
  byStatus: {
    draft: number;
    submitted: number;    // ← Counted in badge
    open: number;         // ← Counted in badge
    inProgress: number;
    closed: number;
  };
  // ... other fields
}
```

### Styling
- Red badge color (`bg-red-500`) for urgency
- Consistent with design system
- Smooth transitions and animations
- Accessible contrast ratios

## Testing Checklist

- [ ] Badge appears for HR users when requests are submitted
- [ ] Badge shows correct count (Submitted + Open)
- [ ] Badge updates every 2 minutes automatically
- [ ] Badge displays in expanded sidebar mode
- [ ] Badge displays in collapsed sidebar mode (as dot)
- [ ] Badge hidden when count is 0
- [ ] Badge hidden for non-HR users
- [ ] No console errors or performance issues
- [ ] Count updates when new request is submitted
- [ ] Count decreases when status changes to "In Progress" or "Closed"

## Future Enhancements

1. **Click Action:** Navigate directly to filtered view of pending requests
2. **Animation:** Pulse or bounce effect when new requests arrive
3. **Sound:** Optional notification sound for new requests
4. **Filters:** Separate badges for different urgency levels
5. **WebSocket:** Real-time updates instead of polling
6. **Customization:** User preference for notification frequency

## Related Files

- [src/layouts/Sidebar.tsx](src/layouts/Sidebar.tsx) - Main implementation
- [src/store/hiringStore.ts](src/store/hiringStore.ts) - Statistics state management
- [src/types/hiring.ts](src/types/hiring.ts) - HiringStatistics interface
- [src/router/roleConfig.ts](src/router/roleConfig.ts) - Navigation configuration
- [src/components/ui/badge.tsx](src/components/ui/badge.tsx) - Badge component

## Summary

The notification badge provides immediate visibility into pending hiring requests for HR users, improving workflow efficiency and ensuring timely response to manager requests. The implementation is role-based, performance-optimized, and seamlessly integrated into the existing sidebar navigation.

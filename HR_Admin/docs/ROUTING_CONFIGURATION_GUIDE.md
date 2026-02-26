# Routing Configuration Guide - Employee Management Module

## 📍 Routes to Add

Add these routes to your application's router configuration:

### Employee Routes (Self-Service)

```typescript
// In your router configuration (e.g., App.tsx or routes.tsx)

import EnhancedProfile from '@/pages/employee/EnhancedProfile';
import OnboardingDashboard from '@/pages/employee/OnboardingDashboard';
import OffboardingDashboard from '@/pages/employee/OffboardingDashboard';

// Employee routes
{
  path: '/employee/profile',
  element: <EnhancedProfile />,
  meta: { requiresAuth: true, role: 'employee' }
},
{
  path: '/employee/onboarding',
  element: <OnboardingDashboard />,
  meta: { requiresAuth: true, role: 'employee' }
},
{
  path: '/employee/offboarding',
  element: <OffboardingDashboard />,
  meta: { requiresAuth: true, role: 'employee' }
}
```

### HR Admin Routes

```typescript
import EmployeeLifecycleDashboard from '@/pages/hr/EmployeeLifecycleDashboard';

// HR routes
{
  path: '/hr/employee-lifecycle',
  element: <EmployeeLifecycleDashboard />,
  meta: { requiresAuth: true, role: 'hr' }
}
```

---

## 🧭 Navigation Links

### Sidebar Menu - Employee Section

```typescript
// For employee users
const employeeMenuItems = [
  {
    label: 'My Profile',
    icon: User,
    path: '/employee/profile',
    description: 'View and manage your profile information'
  },
  {
    label: 'Onboarding',
    icon: Rocket,
    path: '/employee/onboarding',
    description: 'Complete your onboarding tasks',
    badge: 'In Progress' // Show if onboarding active
  },
  {
    label: 'Exit Process',
    icon: LogOut,
    path: '/employee/offboarding',
    description: 'Track your exit clearance',
    badge: 'Active' // Show if offboarding active
  }
];
```

### Sidebar Menu - HR Admin Section

```typescript
// For HR users
const hrMenuItems = [
  {
    label: 'Employee Lifecycle',
    icon: Users,
    path: '/hr/employee-lifecycle',
    description: 'Manage onboarding, offboarding & documents',
    badge: pendingCount // Show count of pending items
  }
];
```

---

## 🔐 Route Protection

### Auth Guard Example

```typescript
// AuthGuard.tsx or ProtectedRoute.tsx
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Usage
<Route
  path="/employee/profile"
  element={
    <ProtectedRoute allowedRoles={['employee', 'hr', 'admin']}>
      <EnhancedProfile />
    </ProtectedRoute>
  }
/>
```

---

## 📂 Example React Router v6 Configuration

```typescript
// src/routes.tsx or src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layout
import MainLayout from '@/layouts/MainLayout';

// Employee pages
import EnhancedProfile from '@/pages/employee/EnhancedProfile';
import OnboardingDashboard from '@/pages/employee/OnboardingDashboard';
import OffboardingDashboard from '@/pages/employee/OffboardingDashboard';

// HR pages
import EmployeeLifecycleDashboard from '@/pages/hr/EmployeeLifecycleDashboard';

// Auth pages
import Login from '@/pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Employee self-service routes */}
          <Route path="/employee">
            <Route path="profile" element={<EnhancedProfile />} />
            <Route path="onboarding" element={<OnboardingDashboard />} />
            <Route path="offboarding" element={<OffboardingDashboard />} />
          </Route>

          {/* HR admin routes */}
          <Route path="/hr">
            <Route 
              path="employee-lifecycle" 
              element={
                <ProtectedRoute allowedRoles={['hr', 'admin']}>
                  <EmployeeLifecycleDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🔔 Conditional Rendering

### Show Onboarding Link Only If Active

```typescript
// In your Sidebar or Navigation component

import { useEffect, useState } from 'react';
import { onboardingService } from '@/services/employeeManagementService';
import { useAuthStore } from '@/store/authStore';

function Navigation() {
  const { user } = useAuthStore();
  const [hasActiveOnboarding, setHasActiveOnboarding] = useState(false);
  const [hasActiveOffboarding, setHasActiveOffboarding] = useState(false);

  useEffect(() => {
    checkActiveProcesses();
  }, []);

  const checkActiveProcesses = async () => {
    try {
      // Check onboarding
      const onboarding = await onboardingService.getEmployeeChecklist(user?.id || '');
      setHasActiveOnboarding(onboarding.success && onboarding.data);

      // Check offboarding
      const offboarding = await offboardingService.getEmployeeChecklist(user?.id || '');
      setHasActiveOffboarding(offboarding.success && offboarding.data);
    } catch (error) {
      console.error('Error checking processes:', error);
    }
  };

  return (
    <nav>
      {/* Always show profile */}
      <NavLink to="/employee/profile">My Profile</NavLink>

      {/* Conditional links */}
      {hasActiveOnboarding && (
        <NavLink to="/employee/onboarding">
          Onboarding <Badge>Active</Badge>
        </NavLink>
      )}

      {hasActiveOffboarding && (
        <NavLink to="/employee/offboarding">
          Exit Process <Badge variant="destructive">Active</Badge>
        </NavLink>
      )}
    </nav>
  );
}
```

---

## 🎨 Breadcrumb Navigation

```typescript
// Breadcrumb component example

const breadcrumbs = {
  '/employee/profile': ['Home', 'Employee', 'My Profile'],
  '/employee/onboarding': ['Home', 'Employee', 'Onboarding'],
  '/employee/offboarding': ['Home', 'Employee', 'Exit Process'],
  '/hr/employee-lifecycle': ['Home', 'HR Admin', 'Employee Lifecycle'],
};

// Usage in layout
<Breadcrumbs items={breadcrumbs[pathname]} />
```

---

## 📱 Mobile Navigation

```typescript
// Mobile menu configuration

const mobileMenu = [
  {
    section: 'Employee',
    items: [
      { label: 'Profile', path: '/employee/profile', icon: User },
      { label: 'Onboarding', path: '/employee/onboarding', icon: Rocket },
      { label: 'Exit', path: '/employee/offboarding', icon: LogOut },
    ]
  },
  {
    section: 'HR Admin',
    items: [
      { label: 'Lifecycle', path: '/hr/employee-lifecycle', icon: Users },
    ],
    requiresRole: ['hr', 'admin']
  }
];
```

---

## 🚦 Route Transitions

```typescript
// Add transitions between routes

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          {/* Your routes here */}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 📊 Route Analytics

```typescript
// Track page views

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    analytics.pageView(location.pathname);
  }, [location]);

  return null;
}

// Add to App component
<RouteTracker />
```

---

## 🔗 Deep Linking

### Link to Specific Tabs

```typescript
// Link directly to a specific tab in Enhanced Profile

// From another component
<Link to="/employee/profile?tab=documents">
  View My Documents
</Link>

// In EnhancedProfile.tsx
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const defaultTab = searchParams.get('tab') || 'medical';

<Tabs defaultValue={defaultTab}>
  {/* tabs content */}
</Tabs>
```

---

## 🎯 Quick Implementation Checklist

- [ ] Import route components
- [ ] Add routes to router configuration
- [ ] Implement route protection
- [ ] Add navigation links to sidebar
- [ ] Add breadcrumbs (optional)
- [ ] Configure mobile navigation
- [ ] Test all routes
- [ ] Add 404 handler
- [ ] Test role-based access
- [ ] Add route transitions (optional)

---

## 📝 Example Sidebar Component

```typescript
// Sidebar.tsx with employee management routes

import { Link, useLocation } from 'react-router-dom';
import { User, Rocket, LogOut, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-card border-r">
      <nav className="p-4 space-y-2">
        {/* Employee Section */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">
            EMPLOYEE
          </h3>
          
          <Link
            to="/employee/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive('/employee/profile')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </Link>

          <Link
            to="/employee/onboarding"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive('/employee/onboarding')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <Rocket className="h-4 w-4" />
            <span>Onboarding</span>
          </Link>

          <Link
            to="/employee/offboarding"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive('/employee/offboarding')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Process</span>
          </Link>
        </div>

        {/* HR Admin Section */}
        {['hr', 'admin'].includes(user?.role || '') && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2">
              HR ADMIN
            </h3>
            
            <Link
              to="/hr/employee-lifecycle"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                isActive('/hr/employee-lifecycle')
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Employee Lifecycle</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
```

---

## 🎉 Ready to Use!

Simply add the routes to your existing router configuration and update your navigation menu. All components are self-contained and ready for integration.

For any route-specific customization, refer to your router library's documentation:
- React Router v6: https://reactrouter.com/
- TanStack Router: https://tanstack.com/router
- Wouter: https://github.com/molefrog/wouter

# My Profile UI Component Hierarchy

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Enhanced My Profile Page                         │
│                     (EnhancedMyProfile.tsx)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════════════╗  │
│  ║           Profile Header (ProfileHeader.tsx)                      ║  │
│  ║  ┌────────┐                                                        ║  │
│  ║  │ Avatar │  John Doe                            [Active Badge]   ║  │
│  ║  │ Photo  │  Senior Software Engineer                             ║  │
│  ║  └────────┘                                                        ║  │
│  ╚═══════════════════════════════════════════════════════════════════╝  │
│                                                                           │
│  ╔═══════════════════════════════════════════════════════════════════╗  │
│  ║         Quick Info Bar (QuickInfoBar.tsx)                         ║  │
│  ║  ┌────────────┬────────────┬────────────┬────────────┐           ║  │
│  ║  │ [📧] Email │ [📱] Phone │ [📍] Loc   │ [#] EmpID  │           ║  │
│  ║  └────────────┴────────────┴────────────┴────────────┘           ║  │
│  ╚═══════════════════════════════════════════════════════════════════╝  │
│                                                                           │
│  ╔═══════════════════════════════════════════════════════════════════╗  │
│  ║         Tab Navigation (TabNavigation.tsx)                        ║  │
│  ║  [About] [Profile] [Job] [Time] [Documents] [Onboarding]...      ║  │
│  ║  ───────                                                          ║  │
│  ╚═══════════════════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────────┐       ┌──────────────────────┐
        │   Main Content Area   │       │   Sidebar (Sticky)   │
        │   (9 columns)         │       │   (3 columns)        │
        └───────────────────────┘       └──────────────────────┘
                    │                               │
        ┌───────────┴───────────┐                   │
        ▼                       ▼                   ▼
┌──────────────┐      ┌──────────────┐   ┌────────────────────┐
│  About Tab   │      │  Profile Tab │   │ Contextual Action  │
│              │      │              │   │      Menu          │
│ ┌──────────┐ │      │ ┌──────────┐ │   │                    │
│ │ Summary  │ │      │ │ Personal │ │   │ • Download ID Card │
│ └──────────┘ │      │ │   Info   │ │   │ • Write Note       │
│              │      │ └──────────┘ │   │ • Request Feedback │
│ ┌──────────┐ │      │              │   │ • Initiate Exit    │
│ │ Stats    │ │      │ ┌──────────┐ │   │ • Disable Login    │
│ │ Cards    │ │      │ │ Medical  │ │   │ • Reset Password   │
│ └──────────┘ │      │ └──────────┘ │   │                    │
└──────────────┘      └──────────────┘   └────────────────────┘

        ┌──────────────┐      ┌──────────────┐
        │   Job Tab    │      │   Time Tab   │
        │              │      │              │
        │ ┌──────────┐ │      │ ┌──────────┐ │
        │ │   Job    │ │      │ │  Tenure  │ │
        │ │  Details │ │      │ └──────────┘ │
        │ └──────────┘ │      │              │
        │              │      │ ┌──────────┐ │
        │ ┌──────────┐ │      │ │  Leave   │ │
        │ │Reporting │ │      │ │ Balances │ │
        │ │Structure │ │      │ └──────────┘ │
        │ └──────────┘ │      │              │
        └──────────────┘      └──────────────┘

        ┌──────────────┐      ┌──────────────┐
        │Documents Tab │      │Onboarding Tab│
        │              │      │              │
        │ ┌──────────┐ │      │ ┌──────────┐ │
        │ │ Pending  │ │      │ │ Progress │ │
        │ │  Alert   │ │      │ │   Bar    │ │
        │ └──────────┘ │      │ └──────────┘ │
        │              │      │              │
        │ ┌──────────┐ │      │ ┌──────────┐ │
        │ │Uploaded  │ │      │ │  Tasks   │ │
        │ │   List   │ │      │ │   List   │ │
        │ └──────────┘ │      │ └──────────┘ │
        └──────────────┘      └──────────────┘

        ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
        │Finances Tab  │      │ Expenses Tab │      │Performance   │
        │              │      │              │      │     Tab      │
        │ ┌──────────┐ │      │ ┌──────────┐ │      │ ┌──────────┐ │
        │ │  Salary  │ │      │ │ Summary  │ │      │ │  Rating  │ │
        │ └──────────┘ │      │ │  Cards   │ │      │ └──────────┘ │
        │              │      │ └──────────┘ │      │              │
        │ ┌──────────┐ │      │              │      │ ┌──────────┐ │
        │ │   Bank   │ │      │ ┌──────────┐ │      │ │ Reviews  │ │
        │ │ Details  │ │      │ │ Expenses │ │      │ └──────────┘ │
        │ └──────────┘ │      │ │   List   │ │      │              │
        └──────────────┘      │ └──────────┘ │      └──────────────┘
                              └──────────────┘
```

## Component Breakdown

### 1. ProfileHeader
```
┌─────────────────────────────────────────────────────┐
│ Gradient Background (Blue → Purple)                 │
│                                                     │
│  ┌─────┐                                           │
│  │     │  John Doe              [Active]           │
│  │ 👤  │  Senior Software Engineer                 │
│  │     │                                           │
│  └─────┘  [📷 Upload on hover]                     │
└─────────────────────────────────────────────────────┘
```

### 2. QuickInfoBar
```
┌────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ 📧           │  │ 📱           │  │ 📍           │    │
│  │ Email        │  │ Phone        │  │ Location     │    │
│  │ john@...     │  │ +91 9876...  │  │ Bangalore    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### 3. TabNavigation (Pill-style)
```
┌────────────────────────────────────────────────────────┐
│  About   Profile   Job   Time   Documents   ...        │
│  ─────                                                 │
│  (active indicator)                                    │
└────────────────────────────────────────────────────────┘
```

### 4. Documents Alert (Soft Amber)
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  2 Documents Pending Upload                      │
│                                                     │
│  ┌────────────────────────────────────────────────┐│
│  │ 📄 Aadhar Card            [Upload Button]     ││
│  └────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────┐│
│  │ 📄 PAN Card               [Upload Button]     ││
│  └────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 5. Contextual Action Menu (Sticky)
```
┌────────────────────────────┐
│ Quick Actions              │
│                            │
│ ┌────────────────────────┐ │
│ │ 💳  Download ID Card   │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 📝  Write Note         │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 💬  Request Feedback   │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 🚪  Initiate Exit      │ │ (Red)
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 🚫  Disable Login      │ │ (Red)
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ 🔑  Reset Password     │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

## Color Scheme Reference

### Status Badges
- **Active**: Emerald (bg-emerald-50, text-emerald-700)
- **Inactive**: Gray (bg-gray-100, text-gray-700)
- **On Leave**: Amber (bg-amber-50, text-amber-700)
- **Probation**: Blue (bg-blue-50, text-blue-700)

### Card Gradients
- **Tenure**: Indigo (from-indigo-50 to-indigo-100)
- **Salary**: Green/Emerald (from-green-50 to-emerald-50)
- **Department**: Purple (from-purple-50 to-purple-100)
- **Joining**: Blue (from-blue-50 to-blue-100)

### Leave Balances
- **Annual**: Blue system
- **Sick**: Emerald system
- **Casual**: Purple system

### Action Icons Background
- **Default Actions**: Blue (bg-blue-50, text-blue-600)
- **Destructive Actions**: Red (bg-red-50, text-red-600)

## Responsive Breakpoints

- **Mobile** (< 768px): Single column, horizontal scroll tabs
- **Tablet** (768px - 1024px): 2-column grids
- **Desktop** (> 1024px): Full 12-column grid with sidebar

## Animation & Transitions

- **Hover**: Background color transitions (200ms)
- **Tab Switch**: Instant content swap
- **Card Hover**: Subtle scale (hover:scale-105)
- **Loading**: Spin animation on loader

## Accessibility

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Readers**: Proper ARIA labels
- **Focus Indicators**: Visible focus rings
- **Color Contrast**: WCAG AA compliant

---

This hierarchy provides a clear visual understanding of how components are structured and interact within the enhanced My Profile UI.


# 📦 Reusable UI Specification  
## Framework: ShadCN UI + TailwindCSS  
## Architecture: Fully Dynamic, Schema-Driven, Enterprise Ready  

This document is segregated into four major reusable components for better clarity:

1. Table  
2. KPI  
3. Right Drawer  
4. Filter System  

All components must:

- Be reusable
- Accept dynamic configuration
- Contain no hardcoded values
- Be compatible with ShadCN UI
- Use TailwindCSS utility classes

---

# 🧩 1️⃣ TABLE (GenericDataTable)

## 1.1 Objective

Create a fully reusable, schema-driven data table component that supports:

- Dynamic columns
- Dynamic data
- Sorting
- Pagination
- Row selection
- Custom rendering
- Loading & empty states

---

## 1.2 Component Name

`GenericDataTable`

---

## 1.3 Props

```ts
columns: ColumnConfig[]
data: any[]
loading?: boolean
totalCount?: number
page?: number
pageSize?: number
onPageChange?: (page: number) => void
onSortChange?: (field: string, direction: "asc" | "desc") => void
onRowSelect?: (rows: any[]) => void
```

---

## 1.4 Column Schema

```ts
type ColumnConfig = {
  key: string
  label: string
  sortable?: boolean
  align?: "left" | "center" | "right"
  width?: string
  render?: (row: any) => ReactNode
  hidden?: boolean
}
```

---

## 1.5 Table Wrapper

Wrap inside:

- `<Card>`
- `rounded-xl`
- `shadow-sm`
- `overflow-hidden`

---

## 1.6 Features

### Row Selection
- Header checkbox (Select All)
- Row checkbox
- Emit selected rows

Row hover:
- `hover:bg-muted/50`
- `transition-colors`

---

### Sorting
If column.sortable:

- Show sorting icon
- Toggle asc/desc/none
- Highlight active column
- Trigger `onSortChange`

---

### Custom Cell Rendering
Support:

- Avatar + text
- Status badge
- Progress bar
- Currency formatting
- Date formatting
- Dropdown actions

All dynamic.

---

### Status Badge Mapping

```ts
const statusStyles = {
  default: "bg-muted text-muted-foreground",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700"
}
```

---

### Pagination

Layout:

- `flex items-center justify-between`
- `p-4`
- `border-t`

Left:
- Rows per page selector

Right:
- First
- Previous
- Page indicator
- Next
- Last

Disable appropriately.

---

### Loading State
- 5 skeleton rows
- `<Skeleton>`
- `animate-pulse`

---

### Empty State
Centered layout:

- Icon
- Title
- Optional description
- Optional CTA

Styling:
- `flex flex-col items-center justify-center py-16 text-center`

---

---

# 📊 2️⃣ KPI (KPIGrid)

## 2.1 Objective

Reusable KPI summary cards component.

---

## 2.2 Component Name

`KPIGrid`

---

## 2.3 Props

```ts
type KPI = {
  label: string
  value: string | number
  trend?: {
    value: number
    direction: "up" | "down"
  }
  icon?: ReactNode
}
```

---

## 2.4 Layout

- `grid`
- `grid-cols-1`
- `sm:grid-cols-2`
- `lg:grid-cols-5`
- `gap-4`

---

## 2.5 Card Style

Use:

- `<Card>`
- `p-4`
- `rounded-xl`
- `shadow-sm`
- `flex justify-between items-center`

Trend colors:

- Up → `text-green-600`
- Down → `text-red-600`

All values must be dynamic.

---

---

# 📂 3️⃣ RIGHT DRAWER (Sheet Component)

## 3.1 Objective

Reusable right-side drawer for:

- View Details
- Create Form
- Edit Form
- Advanced Filters

---

## 3.2 Component

Use ShadCN `<Sheet>`:

- `side="right"`

---

## 3.3 Drawer Structure

### Header
- Title
- Optional description
- Close button

Styling:
- `p-4`
- `border-b`

---

### Scrollable Body

Use:

- `overflow-y-auto`
- `p-4`
- `space-y-6`

Supports:

- Forms
- Tabs
- Read-only details
- Dynamic content

---

### Sticky Footer

Use:

- `sticky bottom-0`
- `bg-background`
- `border-t`
- `p-4`
- `flex justify-end gap-2`

Buttons:

- Cancel
- Primary Action
- Optional Secondary Action

---

## 3.4 Animations

Use ShadCN default:

- Slide-in from right
- Overlay fade
- Smooth transitions

Drawer must be fully reusable and dynamic.

---

---

# 🔎 4️⃣ FILTER SYSTEM

## 4.1 Objective

Advanced filter showcase system with:

- Filter button
- Popover
- Multi-type filters
- Active filter chips

---

## 4.2 Filter Showcase Button

Use:

- `<Button variant="outline" size="sm">`
- Filter icon

If filters active:

- Show filter count badge
- Highlight button (`text-primary`)

---

## 4.3 Filter Popover

Use:

- `<Popover>`
- `w-80`
- `space-y-4`
- Scrollable if overflow

---

### Supported Filter Types

- Text input (search)
- Single select dropdown
- Multi-select checkbox
- Date range picker
- Numeric range (min/max)
- Boolean toggle

All filters must be schema-driven.

---

## 4.4 Popover Footer

Layout:

- `flex`
- `justify-between`
- `pt-4`
- `border-t`

Buttons:

- Reset
- Apply

---

## 4.5 Active Filter Chips

Display below controls.

Use:

- `flex flex-wrap gap-2`
- `<Badge variant="secondary">`

Each chip:

- Filter label + value
- Remove icon
- Removes filter on click

Include:

- Clear All Filters button

---

---

# 🎨 Global Design Tokens

Use only theme-based classes:

- `bg-background`
- `text-muted-foreground`
- `border-border`
- `text-primary`
- `rounded-xl`
- `shadow-sm`
- `hover:bg-muted/50`

Avoid hardcoded values except status mapping.

---

# ✅ Final Outcome

A cleanly segregated, enterprise-grade UI system consisting of:

- Reusable Table
- Reusable KPI Grid
- Reusable Right Drawer
- Advanced Filter System

All fully dynamic.  
All schema-driven.  
No hardcoded values.  
ShadCN compatible.  
TailwindCSS styled.  

---

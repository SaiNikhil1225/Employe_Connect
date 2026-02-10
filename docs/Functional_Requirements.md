## Create Project FL (Financial Line) — UI + Functional Requirements (Copilot Prompt)

### Screen: Create Project FL
Build a **Stepper-based Financial Line (FL) creation flow** using:
- React + TypeScript + Vite
- TailwindCSS + ShadCN UI
- Zustand for state
- Static JSON as data source
- Zod validation
- Day.js for date handling

This FL creation must be launched inside a selected **Project** context.

---

# Stepper Structure (4 Steps)

Stepper tabs:
1. Form
2. Funding
3. Planned / Expected Revenue
4. Payment Milestone

Stepper navigation:
- Show `Next` button on top-right (as in screenshot)
- Allow step navigation only if previous step is valid
- Maintain form state across steps (do not reset values)

---

# Step 1: Form (Basic Details + Revenue Details)

## UI Layout
Show two collapsible sections:
1. Basic Details
2. Revenue Details

---

## 1. Basic Details Section

### Fields

#### Auto-Filled + Disabled Fields (Read-only)
- **FL No** *(auto-generated, disabled)*
- **Execution Entity** *(auto-filled from Project legal entity, disabled)*
- **Currency** *(auto-filled from Project currency, disabled)*

#### Editable Fields
- **FL Name** *(required text input)*
- **Timesheet Approver** *(required dropdown - user list)*
- **Location Type** *(required dropdown: Onsite, Offshore, Hybrid)*
- **Contract Type** *(required dropdown, default from project billing type: T&M / Fixed Bid / Fixed Monthly / License)*
- **Schedule Start** *(required date picker)*
- **Schedule Finish** *(required date picker)*

---

## 2. Revenue Details Section

### Fields
- **Billing Rate** *(required numeric input)*
- **Rate UOM** *(required dropdown: Hr / Day / Month)*
- **Effort** *(required numeric input)*
- **Effort UOM** *(required dropdown: Hr / Day / Month)*
- **Revenue Amount** *(calculated, read-only)*
- **Expected Revenue** *(calculated, read-only)*

### Calculation Rules
Revenue Amount must be auto-calculated:

evenueAmount = billingRate * effort
expectedRevenue = revenueAmount


Both fields must be displayed but disabled.

---

## Step 1 Validations (Zod)

- FL Name is required
- Location Type is required
- Contract Type is required
- Timesheet Approver is required
- Schedule Start is required
- Schedule Finish is required
- Schedule Finish must be >= Schedule Start
- Billing Rate must be > 0
- Effort must be > 0
- Rate UOM is required
- Effort UOM is required
- Schedule Start/Finish must fall within project start/end date

---

# Step 2: Funding

## UI Requirements
Display a grid/table where user can allocate PO funding to this FL.

Top summary:
- `Total Funding: <calculated total>`

---

## Funding Table Columns (as per screenshot)

Each row represents a selected PO allocation.

Columns:
- S.No
- PO No (dropdown / selection)
- Contract No (auto-filled based on PO selection)
- Project Currency (read-only)
- PO Currency (read-only)
- Unit Rate (Project) (auto-filled from billing rate)
- Funding Units (editable numeric)
- Units UOM (dropdown Hr/Day/Month)
- Funding Value (Project) (calculated)
- Funding Amount in PO Currency (calculated)
- Available PO Line in PO (read-only)
- Available PO Line in Project (read-only)

---

## Funding Calculation Rules

### Funding Value (Project Currency)

fundingValueProject = unitRate * fundingUnits

### Total Funding

totalFunding = sum(all fundingValueProject)


---

## Business Rules

- Unit Rate must default from Step 1 Billing Rate.
- User must select at least one PO from available POs.
- Funding Units must be > 0.
- Funding cannot exceed available PO balance.
- If multiple POs are selected, total funding is sum of all selected PO allocations.

---

## Step 2 Validations

- At least one PO row must exist
- PO No is required per row
- Funding Units required and must be > 0
- UOM required
- Total Funding must be > 0
- Total Funding must be <= PO Available Balance

---

# Step 3: Planned / Expected Revenue

## UI Requirements
Display a grid/table for monthly planning similar to the screenshot.

The table must show:

### Left side columns (FL Data)
- FL Name (read-only)
- FL Type (read-only, from Contract Type)
- Bill Rate (read-only)
- Rate UOM (read-only)
- Funded Amount (read-only from Step 2 Total Funding)
- Expected Revenue (read-only from Step 1)
- Amount (editable at row level)
- Actions (icons: add/edit/delete)

### Monthly Columns
For each month (based on project duration):
- Planned Units (editable)
- Revenue (calculated)

---

## Row Types
The grid must have 3 expandable sub rows:
1. Planned
2. Actual (read-only)
3. Forecasted

Only **Planned** row should be editable.

---

## Planned Revenue Calculation

For each month:

monthlyRevenue = plannedUnits * billRate

Total planned revenue:

totalPlannedRevenue = sum(monthlyRevenue)


---

## Step 3 Validations

- Planned Units cannot be negative
- Total planned revenue must be <= Total Funding
- If planned revenue exceeds funding, show inline error + disable Next

---

# Step 4: Payment Milestone

## UI Requirements
Provide a table/grid for milestone creation.

Columns:
- Milestone Name (required)
- Due Date (required)
- Amount (required numeric)
- Notes (optional)
- Actions (add/remove row)

---

## Milestone Rules

- Total milestone amount must equal Total Funding.
- Due dates must fall within FL schedule start and finish.

### Total Milestone Validation

sum(milestoneAmount) == totalFunding

If mismatch:
- show error message
- disable Save/Complete

---

# Save / Complete Behavior

When user completes Step 4:
- Create new FL record in Zustand store
- Save FL into `financialLines.json` mock service
- Update PO allocated amounts in store
- Close modal and refresh FL list view

---

# Global Date Bug Fix Requirement

All date fields must store date as `YYYY-MM-DD` string (local format).
Never store using `toISOString()` to avoid timezone shifting issue.

Use:
```ts
dayjs(date).format("YYYY-MM-DD")

Zustand Store Requirement

Create store slice:

financialLines: FinancialLine[]

addFinancialLine(fl: FinancialLine)

updateFinancialLine(flId, data)

getFinancialLinesByProject(projectId)

Also store:

contractsPO: ContractPO[]

getPOsByProject(projectId)

updatePOAllocation(poNo, allocatedAmount)

export type FinancialLine = {
  flId: string;
  flNo: string;
  projectId: string;

  flName: string;
  contractType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
  locationType: "Onsite" | "Offshore" | "Hybrid";

  executionEntity: string;
  currency: string;

  timesheetApprover: string;

  scheduleStart: string; // YYYY-MM-DD
  scheduleFinish: string; // YYYY-MM-DD

  billingRate: number;
  rateUom: "Hr" | "Day" | "Month";

  effort: number;
  effortUom: "Hr" | "Day" | "Month";

  revenueAmount: number;
  expectedRevenue: number;

  funding: {
    poNo: string;
    contractNo: string;
    unitRate: number;
    fundingUnits: number;
    uom: "Hr" | "Day" | "Month";
    fundingValueProject: number;
    fundingAmountPoCurrency?: number;
  }[];

  plannedRevenue: {
    month: string; // ex: 2024-04
    plannedUnits: number;
    revenue: number;
  }[];

  milestones: {
    milestoneName: string;
    dueDate: string; // YYYY-MM-DD
    amount: number;
    notes?: string;
  }[];

  totalFunding: number;
  totalPlannedRevenue: number;
};

UX Notes

Disable step navigation unless validation passes

Show toast notifications on save success/failure

Use loading spinner on save

Use ShadCN Dialog for modal view

Use ShadCN Table or TanStack table for grids

Maintain the same layout style as screenshot (enterprise UI)

Expected Output

After successful completion:

FL appears in Financials → FLs list

PO allocated amount updates in Financials → Customer PO

Monthly planned revenue is visible in analytics later
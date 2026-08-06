# Expense Budget Visualization — Design

## Tech Stack

- **Framework**: Vanilla HTML/CSS/JS (no build step required for MVP)
- **Charts**: Chart.js v4 (CDN)
- **Storage**: localStorage
- **Styling**: CSS custom properties, Flexbox/Grid

## Component Architecture

```
App
├── DashboardHeader          — App title, current month display
├── SummaryCards             — Total Budget / Total Spent / Remaining + progress bar
├── ChartsSection
│   ├── CategoryDonutChart   — Donut chart by category (Req 2)
│   └── MonthlyTrendChart    — Bar chart, last 6 months + budget overlay line (Req 3)
├── ExpenseTable
│   ├── FilterBar            — Date range picker + category dropdown (Req 4)
│   ├── SortableTable        — Sortable columns, paginated rows (Req 4)
│   └── Pagination           — Always-rendered Prev/Next + "Page X of Y" (Req 4.4)
├── ExpenseFormModal         — Add/Edit modal with validation (Req 5)
└── BudgetSettingsModal      — Overall + per-category limits (Req 6)
```

## State Management

All UI state is held in a single `AppState` object in `app.js` and re-rendered on every mutation:

```js
const AppState = {
  expenses: [],          // loaded from localStorage "expenses"
  budgetSettings: {},    // loaded from localStorage "budget-settings"
  filters: { dateFrom: null, dateTo: null, category: 'All' },
  sort: { column: 'date', direction: 'desc' },
  page: 1,
  pageSize: 10,
};
```

On any mutation (`addExpense`, `editExpense`, `deleteExpense`, `saveBudgetSettings`):
1. Persist to localStorage atomically (budget settings update both progress bar and chart overlay together — Req 6.4).
2. Call `render()` to re-paint all components from scratch.

## Data Model

```json
// localStorage key: "expenses"
[
  {
    "id": "uuid-v4",
    "date": "2026-08-01",
    "category": "Food",
    "description": "Grocery shopping",
    "amount": 150000
  }
]

// localStorage key: "budget-settings"
{
  "monthly": 5000000,
  "categories": {
    "Food": 1500000,
    "Transport": 500000,
    "Housing": 2000000,
    "Entertainment": 300000,
    "Health": 400000,
    "Others": 300000
  }
}
```

## Progress Bar Color Logic (Req 1.3 & 1.4)

| Condition                          | Color   | Token             |
|------------------------------------|---------|-------------------|
| expenses === 0                     | green   | --color-success   |
| expenses < 70% of budget           | green   | --color-success   |
| 70% ≤ expenses < 100% of budget    | yellow  | --color-warning   |
| expenses ≥ 100% of budget          | red     | --color-danger    |

When over budget, remaining = budget − expenses (negative value shown as-is).

## Color Palette

| Token              | Value     |
|--------------------|-----------|
| --color-primary    | #4F46E5   |
| --color-success    | #10B981   |
| --color-warning    | #F59E0B   |
| --color-danger     | #EF4444   |
| --color-bg         | #F9FAFB   |
| --color-surface    | #FFFFFF   |
| --color-text       | #111827   |
| --color-muted      | #6B7280   |

## Responsive Breakpoints

| Breakpoint   | Layout                              |
|--------------|-------------------------------------|
| < 640px      | Single column, stacked cards/charts |
| 640–1023px   | Two-column cards, stacked charts    |
| ≥ 1024px     | Full side-by-side charts, 3-col cards |
| > 1440px     | Max-width container removed; content fills viewport |

## File Structure

```
expense-budget-visualization/
├── index.html        — App shell, CDN script tags
├── style.css         — CSS variables, reset, responsive grid, component styles
├── app.js            — AppState, render(), event wiring, first-load seed logic
├── data.js           — CRUD helpers: loadExpenses, saveExpenses, loadBudget, saveBudget
├── charts.js         — Chart.js wrappers: renderDonutChart, renderMonthlyChart
└── utils.js          — formatIDR(), formatDate(), generateUUID(), getLastNMonths()
```

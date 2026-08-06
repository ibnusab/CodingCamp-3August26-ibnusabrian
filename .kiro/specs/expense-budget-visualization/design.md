# Expense Budget Visualization — Design

## Tech Stack

- **Framework**: Vanilla HTML/CSS/JS (no build step required for MVP)
- **Charts**: Chart.js (CDN)
- **Storage**: localStorage
- **Styling**: CSS custom properties, Flexbox/Grid

## Component Architecture

```
App
├── DashboardHeader       — Title, current month selector
├── SummaryCards          — Total Budget / Total Spent / Remaining
├── ChartsSection
│   ├── CategoryPieChart  — Donut chart by category
│   └── MonthlyBarChart   — Monthly trend with budget line
├── ExpenseTable
│   ├── FilterBar         — Date range + category filter
│   ├── Table             — Sortable paginated list
│   └── Pagination        — Prev/Next + page info
├── ExpenseForm           — Add/Edit modal
└── BudgetSettingsModal   — Overall + per-category limits
```

## Data Model

```json
// localStorage key: "expenses"
[
  {
    "id": "uuid",
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

## File Structure

```
expense-budget-visualization/
├── index.html
├── style.css
├── app.js
├── data.js          — CRUD helpers for localStorage
├── charts.js        — Chart.js wrappers
└── utils.js         — Formatting, date helpers
```

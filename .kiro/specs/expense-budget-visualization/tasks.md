# Expense Budget Visualization — Tasks

## Implementation Tasks

### Task 1 — Project Scaffolding
Create the six project files with empty/stub content: `index.html` (HTML5 boilerplate with Chart.js CDN link), `style.css`, `app.js`, `data.js`, `charts.js`, `utils.js`.
- **References**: Req 8, Design §File Structure

### Task 2 — Data Layer (`data.js`)
Implement `loadExpenses()`, `saveExpenses(list)`, `loadBudget()`, `saveBudget(settings)` using `localStorage` keys `"expenses"` and `"budget-settings"`. Include error handling for corrupt JSON.
- **References**: Req 8.1, Req 8.2

### Task 3 — Utility Helpers (`utils.js`)
Implement:
- `generateUUID()` — RFC 4122 v4 UUID
- `formatIDR(amount)` — Indonesian Rupiah currency string
- `formatDate(isoString)` — human-readable date (e.g. "1 Aug 2026")
- `getLastNMonths(n)` — returns array of `{ year, month, label }` for the last N months
- **References**: Req 2.3, Req 3.2, Design §utils.js

### Task 4 — AppState & Render Loop (`app.js`)
Define the `AppState` object (`expenses`, `budgetSettings`, `filters`, `sort`, `page`, `pageSize`). Implement the top-level `render()` function that calls all component renderers. Implement first-load seed logic: if `"expenses"` key does not exist in localStorage, write sample data before rendering.
- **References**: Req 8.3, Design §State Management

### Task 5 — HTML Layout (`index.html`)
Build the semantic HTML structure: `<header>`, `.summary-cards` section, `.charts-section`, `.expense-table-section`, expense form modal `<dialog>`, and budget settings modal `<dialog>`. Include all required ARIA landmark roles and labels.
- **References**: Req 7.3, Req 7.4, Design §Component Architecture

### Task 6 — CSS Styles (`style.css`)
Define CSS custom properties (color tokens, spacing scale). Implement reset, responsive grid (single-column → two-column → three-column), card styles, progress bar styles with `.success` / `.warning` / `.danger` modifier classes, modal overlay, and table styles.
- **References**: Req 7.1, Design §Color Palette, Design §Responsive Breakpoints

### Task 7 — Summary Cards with Progress Bar
In `app.js`, implement `renderSummaryCards()`:
- Compute totalBudget, totalSpent, remaining (may be negative).
- Apply progress bar color logic: green if 0 expenses or < 70%, yellow if 70–99%, red if ≥ 100%.
- Display negative remaining value as-is when over budget.
- **References**: Req 1.1, Req 1.2, Req 1.3, Req 1.4

### Task 8 — Category Donut Chart (`charts.js`)
Implement `renderDonutChart(canvasId, expenses)` using Chart.js. Group expenses by category, compute amounts and percentages. Configure interactive tooltips showing category name, formatted amount, and percentage. Chart instance MUST be destroyed and recreated on each render call to avoid canvas reuse errors.
- **References**: Req 2.1, Req 2.2, Req 2.3, Req 2.4

### Task 9 — Monthly Trend Chart (`charts.js`)
Implement `renderMonthlyChart(canvasId, expenses, monthlyBudget)` using Chart.js. Use `getLastNMonths(6)` to build labels. Sum expenses per month. Add an `annotations` plugin line (or a dataset with `type: 'line'`) at `y = monthlyBudget` as the budget reference. Chart instance MUST be destroyed and recreated on each render.
- **References**: Req 3.1, Req 3.2, Req 3.3, Req 3.4

### Task 10 — Expense Table with Sort & Filter
In `app.js`, implement `renderExpenseTable()`:
- Apply `AppState.filters` (dateFrom, dateTo, category) to the expense list.
- Apply `AppState.sort` (column + direction) to the filtered list.
- Slice for current page using `AppState.page` and `AppState.pageSize`.
- Render table rows with Edit and Delete action buttons per row.
- **References**: Req 4.1, Req 4.2, Req 4.3

### Task 11 — Pagination Controls
In `app.js`, implement `renderPagination(totalItems)`:
- Always render both Prev and Next buttons (Req 4.4 — no conditional hiding).
- Display "Page X of Y" label.
- Clicking Prev/Next updates `AppState.page` and calls `render()`.
- **References**: Req 4.4

### Task 12 — Filter Bar
In `app.js`, implement `renderFilterBar()` with a date-from input, date-to input, and a category `<select>` (All + 6 categories). On change, reset `AppState.page` to 1, update `AppState.filters`, and call `render()`.
- **References**: Req 4.3

### Task 13 — Add/Edit Expense Modal
In `app.js`, implement `openExpenseModal(expense = null)` and form submit handler:
- Pre-fill fields when editing an existing expense.
- Validate: amount > 0, date ≤ today.
- On valid submit: call `data.js` CRUD, update `AppState.expenses`, call `render()`.
- Display inline validation error messages for invalid fields.
- **References**: Req 5.1, Req 5.2, Req 5.3, Req 5.5

### Task 14 — Delete Expense with Confirmation
In `app.js`, wire the Delete button:
- Attempt `window.confirm()` before deletion.
- If confirm returns true (or fails to display), proceed with deletion via `data.js`, update `AppState.expenses`, call `render()`.
- **References**: Req 5.4, Req 5.5

### Task 15 — Budget Settings Modal
In `app.js`, implement `openBudgetModal()` and its submit handler:
- Render one number input for overall monthly budget and one per category.
- Allow zero values (Req 6.1, Req 6.2).
- On save: call `saveBudget()` then call `render()` — this atomically updates the progress bar and monthly chart overlay together (Req 6.4).
- **References**: Req 6.1, Req 6.2, Req 6.3, Req 6.4

### Task 16 — Accessibility & Keyboard Navigation
- Add `aria-label` / `aria-describedby` to all interactive elements, charts (static `role="img"` with description), and modals (`role="dialog"`, `aria-modal="true"`).
- Implement focus trap inside open modals (Tab/Shift+Tab cycles within modal).
- Ensure all color pairs meet WCAG 2.1 AA contrast ratio (4.5:1 for normal text).
- **References**: Req 7.3, Req 7.4

### Task 17 — Responsive Layout & Beyond-1440px Behavior
- Verify layout at 320px, 640px, 1024px, 1440px, and 1920px viewports.
- Remove any `max-width` container cap so content fills ultra-wide screens.
- Ensure charts resize correctly using Chart.js `responsive: true` and `maintainAspectRatio: false`.
- **References**: Req 7.1, Req 7.2

### Task 18 — Performance & First-Load Seed Verification
- Confirm charts render in < 200ms with 1000 seeded data points (use `performance.now()` in dev console).
- Verify seed logic: delete localStorage and reload → sample data appears; reload again → no re-seeding.
- Verify returning-user empty state: manually clear `AppState.expenses`, save, reload → empty dashboard shown.
- **References**: Req 8.3, Req 8.4

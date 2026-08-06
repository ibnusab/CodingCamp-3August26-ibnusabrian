# Expense Budget Visualization

## Introduction

A feature to visualize expense and budget data through interactive charts and summaries, helping users track their spending against their budget limits. The app runs entirely in the browser using localStorage for persistence — no backend is required for this MVP.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a budget overview dashboard so that I can quickly understand how much of my monthly budget I've used.

1. The dashboard MUST display total budget, total expenses, and remaining budget in summary cards.
2. The remaining budget MUST be shown with a progress bar.
3. The progress bar MUST be color-coded: green when expenses are zero or below 70% of budget, yellow when between 70–99%, and red when at or over 100% of budget.
4. When expenses exceed the budget, the remaining budget MUST be shown as a negative value and the progress bar MUST remain red (no capping).
5. The dashboard MUST load with the correct values on every page visit.

### Requirement 2

**User Story:** As a user, I want to see a breakdown of expenses by category so that I can understand where I spend the most.

1. The app MUST display a donut/pie chart breaking down expenses by category.
2. Categories MUST include: Food, Transport, Housing, Entertainment, Health, and Others.
3. Each chart segment MUST show an interactive tooltip with the category name, amount, and percentage.
4. The chart MUST update immediately when the user performs an add, edit, or delete expense operation; on initial load with no prior operations the chart renders the current data as-is.

### Requirement 3

**User Story:** As a user, I want to track my monthly spending trend so that I can compare spending across months.

1. The app MUST display a bar or line chart showing monthly expense totals over time.
2. The chart MUST cover at least the last 6 months.
3. A horizontal reference line representing the monthly budget limit MUST be overlaid on the chart.
4. The chart MUST update when new expenses are added.

### Requirement 4

**User Story:** As a user, I want to view a list of my expense entries so that I can review individual transactions.

1. The app MUST display a paginated table of expense entries with columns: Date, Category, Description, and Amount.
2. The table MUST be sortable by any column.
3. The user MUST be able to filter entries by date range and by category.
4. Pagination MUST show the current page number and provide previous/next navigation; previous navigation is always rendered (including on page 1) and next navigation is always rendered (including on the last page).

### Requirement 5

**User Story:** As a user, I want to add, edit, and delete expense entries so that I can keep my expense data accurate.

1. The app MUST provide a form (modal) to add a new expense with fields: date, category, description, and amount.
2. The form MUST validate that amount is greater than 0 and that the date is not in the future.
3. The user MUST be able to edit existing expense entries via the same form.
4. The user MUST attempt to show a confirmation prompt before deleting an expense; if the confirmation display fails, deletion MAY still proceed.
5. All charts, cards, and the table MUST refresh immediately after any add, edit, or delete action.

### Requirement 6

**User Story:** As a user, I want to configure my budget limits so that I can control my overall and per-category spending.

1. The app MUST allow the user to set an overall monthly budget limit, including a value of zero.
2. The app MUST allow the user to set individual budget limits per category, including zero values.
3. Budget settings MUST be persisted to localStorage and survive page refreshes.
4. When the overall budget limit changes, the progress bar AND the monthly trend chart overlay MUST both update atomically — if either cannot update, neither updates.

### Requirement 7

**User Story:** As a user, I want the app to work on any device so that I can check my budget on mobile or desktop.

1. The layout MUST be responsive and usable at viewport widths from 320px and MUST continue adapting gracefully beyond 1440px to fill available space.
2. Charts and tables MUST adapt gracefully to all supported screen sizes.
3. All interactive elements MUST be keyboard navigable.
4. The app MUST meet WCAG 2.1 AA accessibility standards, including sufficient color contrast and ARIA labels.

### Requirement 8

**User Story:** As a user, I want my data to persist between sessions so that I don't lose my expense history.

1. All expense entries MUST be stored in localStorage under the key "expenses".
2. All budget settings MUST be stored in localStorage under the key "budget-settings".
3. On first load when no "expenses" key exists in localStorage, the app MUST seed sample expense data so the dashboard is not empty; returning users who have deleted all their expenses MUST see an empty dashboard.
4. Charts and totals MUST render within 200ms for up to 1000 data points.

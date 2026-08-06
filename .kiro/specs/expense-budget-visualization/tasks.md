# Expense Budget Visualization — Tasks

## Implementation Tasks

### Phase 1: Foundation
- [ ] **Task 1** — Create project file structure (`index.html`, `style.css`, `app.js`, `data.js`, `charts.js`, `utils.js`)
- [ ] **Task 2** — Implement `data.js`: CRUD operations for expenses and budget settings using localStorage
- [ ] **Task 3** — Implement `utils.js`: currency formatter (IDR), date helpers, UUID generator

### Phase 2: UI Shell
- [ ] **Task 4** — Build `index.html` layout with header, summary cards section, charts section, and table section
- [ ] **Task 5** — Write `style.css`: CSS variables, reset, responsive grid, card styles, color states

### Phase 3: Summary Cards
- [ ] **Task 6** — Render Total Budget, Total Spent, Remaining cards
- [ ] **Task 7** — Implement progress bar with green/yellow/red color logic

### Phase 4: Charts
- [ ] **Task 8** — Integrate Chart.js via CDN
- [ ] **Task 9** — Build `CategoryPieChart` donut chart in `charts.js`
- [ ] **Task 10** — Build `MonthlyBarChart` with budget overlay line in `charts.js`

### Phase 5: Expense Table
- [ ] **Task 11** — Render sortable expense table with pagination
- [ ] **Task 12** — Implement FilterBar (date range + category dropdown)

### Phase 6: Forms & Modals
- [ ] **Task 13** — Build Add/Edit expense modal with validation
- [ ] **Task 14** — Build Budget Settings modal (overall + per-category)

### Phase 7: Wiring & Polish
- [ ] **Task 15** — Connect all components: adding/editing/deleting an expense refreshes cards and charts
- [ ] **Task 16** — Seed with sample data for first-run experience
- [ ] **Task 17** — Accessibility pass: ARIA labels, keyboard navigation, focus trap in modals
- [ ] **Task 18** — Responsive testing and fixes for mobile breakpoint

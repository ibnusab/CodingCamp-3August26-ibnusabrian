/* ============================================================
   Visualisasi Pengeluaran & Anggaran — script.js
   Fitur:
   MVP:  Form + validasi, daftar transaksi, hapus,
         total saldo, grafik pie (Chart.js)
   Opsional: Kategori kustom, ringkasan bulanan,
             urutkan berdasarkan jumlah/kategori,
             sorot pengeluaran melewati batas,
             toggle mode gelap/terang
   ============================================================ */

'use strict';

// ─── Storage helpers ────────────────────────────────────────
const STORAGE_KEY = 'evb_transactions';
const THEME_KEY   = 'evb_theme';
const LIMIT_KEY   = 'evb_limit';

function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTransactions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

function loadLimit() {
  const v = parseFloat(localStorage.getItem(LIMIT_KEY));
  return isNaN(v) ? null : v;
}

function saveLimit(val) {
  if (val === null) {
    localStorage.removeItem(LIMIT_KEY);
  } else {
    localStorage.setItem(LIMIT_KEY, val);
  }
}

// ─── State ──────────────────────────────────────────────────
let transactions  = loadTransactions();
let spendingLimit = loadLimit();
let chartInstance = null;

// ─── Kategori bawaan ────────────────────────────────────────
const BUILTIN_CATEGORIES = ['Makanan', 'Transportasi', 'Hiburan'];

// ─── Badge class per kategori ───────────────────────────────
function badgeClass(category) {
  const map = {
    'Makanan':      'badge-food',
    'Transportasi': 'badge-transport',
    'Hiburan':      'badge-fun',
  };
  return map[category] || 'badge-custom';
}

// ─── Warna kategori untuk grafik ────────────────────────────
const CATEGORY_COLORS = {
  'Makanan':      '#22c55e',
  'Transportasi': '#3b82f6',
  'Hiburan':      '#f59e0b',
};

function categoryColor(cat, idx) {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
  const hue = (idx * 67 + 200) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

// ─── Format mata uang Rupiah ─────────────────────────────────
function formatRupiah(amount) {
  return 'Rp' + Number(amount).toLocaleString('id-ID');
}

// ─── DOM refs ────────────────────────────────────────────────
const totalBalanceEl      = document.getElementById('totalBalance');
const limitWarningEl      = document.getElementById('limitWarning');
const transactionListEl   = document.getElementById('transactionList');
const sortSelectEl        = document.getElementById('sortSelect');
const themeToggleBtn      = document.getElementById('themeToggle');
const toggleSummaryBtn    = document.getElementById('toggleSummary');
const monthlySummaryEl    = document.getElementById('monthlySummary');
const summaryContentEl    = document.getElementById('summaryContent');
const chartEmptyEl        = document.getElementById('chartEmpty');
const chartCanvas         = document.getElementById('spendingChart');

// Form fields
const form                = document.getElementById('transactionForm');
const itemNameInput       = document.getElementById('itemName');
const amountInput         = document.getElementById('amount');
const categorySelect      = document.getElementById('category');
const customCategoryGrp   = document.getElementById('customCategoryGroup');
const customCategoryInput = document.getElementById('customCategory');
const spendingLimitInput  = document.getElementById('spendingLimit');

// Error spans
const itemNameError   = document.getElementById('itemNameError');
const amountError     = document.getElementById('amountError');
const categoryError   = document.getElementById('categoryError');
const customCatError  = document.getElementById('customCategoryError');

// ─── Mode gelap/terang ───────────────────────────────────────
function applyTheme(theme) {
  document.body.classList.toggle('dark',  theme === 'dark');
  document.body.classList.toggle('light', theme === 'light');
  themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  if (chartInstance) updateChart();
}

themeToggleBtn.addEventListener('click', () => {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  saveTheme(next);
  applyTheme(next);
});

// ─── Tampilkan input kategori kustom ────────────────────────
categorySelect.addEventListener('change', () => {
  const isCustom = categorySelect.value === '__custom__';
  customCategoryGrp.style.display = isCustom ? 'flex' : 'none';
  if (!isCustom) customCategoryInput.value = '';
});

// ─── Refresh opsi kategori di dropdown ──────────────────────
function refreshCategoryOptions() {
  const existing = [...new Set(transactions.map(t => t.category))];
  const customs  = existing.filter(c => !BUILTIN_CATEGORIES.includes(c));
  const current  = categorySelect.value;

  // Hapus opsi di luar 4 default (placeholder + 3 bawaan)
  while (categorySelect.options.length > 4) {
    categorySelect.remove(4);
  }
  // Hapus opsi "Tambah Kategori…" lama jika ada
  const lastOpt = categorySelect.options[categorySelect.options.length - 1];
  if (lastOpt && lastOpt.value === '__custom__') {
    categorySelect.remove(categorySelect.options.length - 1);
  }

  // Tambahkan kategori kustom yang sudah ada
  customs.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  // Tambahkan opsi "Tambah Kategori Baru…"
  const addOpt = document.createElement('option');
  addOpt.value = '__custom__';
  addOpt.textContent = '+ Tambah Kategori Baru…';
  categorySelect.appendChild(addOpt);

  // Pulihkan nilai sebelumnya jika masih valid
  if ([...categorySelect.options].some(o => o.value === current)) {
    categorySelect.value = current;
  }
}

// ─── Validasi form ───────────────────────────────────────────
function clearErrors() {
  itemNameError.textContent  = '';
  amountError.textContent    = '';
  categoryError.textContent  = '';
  customCatError.textContent = '';
}

function validateForm() {
  clearErrors();
  let valid = true;

  if (!itemNameInput.value.trim()) {
    itemNameError.textContent = 'Nama item wajib diisi.';
    valid = false;
  }

  const amount = parseFloat(amountInput.value);
  if (!amountInput.value || isNaN(amount) || amount <= 0) {
    amountError.textContent = 'Masukkan jumlah yang valid (lebih dari 0).';
    valid = false;
  }

  const cat = categorySelect.value;
  if (!cat) {
    categoryError.textContent = 'Silakan pilih kategori.';
    valid = false;
  }

  if (cat === '__custom__' && !customCategoryInput.value.trim()) {
    customCatError.textContent = 'Masukkan nama kategori baru.';
    valid = false;
  }

  return valid;
}

// ─── Tambah transaksi ────────────────────────────────────────
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const name   = itemNameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  let   cat    = categorySelect.value;

  if (cat === '__custom__') {
    cat = customCategoryInput.value.trim();
  }

  // Simpan batas pengeluaran jika diisi
  const limitVal = parseFloat(spendingLimitInput.value);
  if (!isNaN(limitVal) && limitVal > 0) {
    spendingLimit = limitVal;
    saveLimit(spendingLimit);
  }

  const transaction = {
    id:       Date.now(),
    name,
    amount,
    category: cat,
    date:     new Date().toISOString(),
  };

  transactions.unshift(transaction);
  saveTransactions(transactions);
  refreshCategoryOptions();
  render();

  form.reset();
  customCategoryGrp.style.display = 'none';
  clearErrors();

  // Pulihkan batas pengeluaran setelah form reset
  if (spendingLimit !== null) spendingLimitInput.value = spendingLimit;
});

// ─── Hapus transaksi ─────────────────────────────────────────
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions(transactions);
  render();
}

// ─── Pengurutan ──────────────────────────────────────────────
function getSortedTransactions() {
  const mode = sortSelectEl.value;
  const copy = [...transactions];

  switch (mode) {
    case 'amount-asc':    return copy.sort((a, b) => a.amount - b.amount);
    case 'amount-desc':   return copy.sort((a, b) => b.amount - a.amount);
    case 'category-asc':  return copy.sort((a, b) => a.category.localeCompare(b.category, 'id'));
    case 'category-desc': return copy.sort((a, b) => b.category.localeCompare(a.category, 'id'));
    default:              return copy;
  }
}

sortSelectEl.addEventListener('change', renderTransactionList);

// ─── Render daftar transaksi ─────────────────────────────────
function renderTransactionList() {
  const sorted = getSortedTransactions();

  if (sorted.length === 0) {
    transactionListEl.innerHTML = '<p class="empty-msg">Belum ada transaksi. Tambahkan di atas!</p>';
    return;
  }

  transactionListEl.innerHTML = sorted.map(t => {
    const isOver   = spendingLimit !== null && t.amount > spendingLimit;
    const amtClass = isOver ? 'transaction-amount over-limit' : 'transaction-amount';
    const flag     = isOver ? '<span class="over-limit-flag">⚠ Melewati batas</span>' : '';

    return `
      <div class="transaction-item${isOver ? ' item-over-limit' : ''}" data-id="${t.id}">
        <div class="transaction-info">
          <p class="transaction-name">${escapeHtml(t.name)}</p>
          <p class="${amtClass}">${formatRupiah(t.amount)}</p>
          <div class="transaction-meta">
            <span class="category-badge ${badgeClass(t.category)}">${escapeHtml(t.category)}</span>
            ${flag}
          </div>
        </div>
        <button class="btn-delete" data-id="${t.id}" aria-label="Hapus ${escapeHtml(t.name)}">Hapus</button>
      </div>
    `;
  }).join('');

  transactionListEl.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteTransaction(Number(btn.dataset.id)));
  });
}

// ─── Render saldo ─────────────────────────────────────────────
function renderBalance() {
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  totalBalanceEl.textContent = formatRupiah(total);

  // Tampilkan peringatan jika total melewati batas
  if (spendingLimit !== null && total > spendingLimit) {
    limitWarningEl.classList.remove('hidden');
  } else {
    limitWarningEl.classList.add('hidden');
  }
}

// ─── Render grafik pie ────────────────────────────────────────
function updateChart() {
  const totals = {};
  transactions.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colors = labels.map((l, i) => categoryColor(l, i));

  const isDark      = document.body.classList.contains('dark');
  const legendColor = isDark ? '#9aa3b8' : '#6b7280';

  if (labels.length === 0) {
    chartEmptyEl.style.display = 'block';
    chartCanvas.style.display  = 'none';
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
    return;
  }

  chartEmptyEl.style.display = 'none';
  chartCanvas.style.display  = 'block';

  if (chartInstance) {
    chartInstance.data.labels                          = labels;
    chartInstance.data.datasets[0].data               = data;
    chartInstance.data.datasets[0].backgroundColor    = colors;
    chartInstance.data.datasets[0].borderColor        = isDark ? '#1e2130' : '#ffffff';
    chartInstance.options.plugins.legend.labels.color = legendColor;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: isDark ? '#1e2130' : '#ffffff',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: legendColor,
            font: { size: 12, family: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
            padding: 12,
            boxWidth: 12,
            boxHeight: 12,
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${formatRupiah(ctx.parsed)}`
          }
        }
      }
    }
  });
}

// ─── Render ringkasan bulanan ─────────────────────────────────
function renderMonthlySummary() {
  if (transactions.length === 0) {
    summaryContentEl.innerHTML = '<p class="empty-msg">Belum ada data.</p>';
    return;
  }

  const months = {};
  transactions.forEach(t => {
    const d     = new Date(t.date);
    const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    if (!months[key]) months[key] = { label, total: 0, cats: {} };
    months[key].total += t.amount;
    months[key].cats[t.category] = (months[key].cats[t.category] || 0) + t.amount;
  });

  const sorted = Object.entries(months).sort(([a], [b]) => b.localeCompare(a));

  summaryContentEl.innerHTML = sorted.map(([, m]) => {
    const catItems = Object.entries(m.cats)
      .map(([cat, amt]) => `<li>${escapeHtml(cat)}: <strong>${formatRupiah(amt)}</strong></li>`)
      .join('');
    return `
      <div class="summary-month">
        <h3>${m.label}</h3>
        <ul>${catItems}</ul>
        <p class="summary-total">Total: ${formatRupiah(m.total)}</p>
      </div>
    `;
  }).join('');
}

toggleSummaryBtn.addEventListener('click', () => {
  const hidden = monthlySummaryEl.classList.toggle('hidden');
  toggleSummaryBtn.textContent = hidden ? '📅 Ringkasan Bulanan' : '📅 Sembunyikan Ringkasan';
  if (!hidden) renderMonthlySummary();
});

// ─── Render utama ─────────────────────────────────────────────
function render() {
  renderBalance();
  renderTransactionList();
  updateChart();
  if (!monthlySummaryEl.classList.contains('hidden')) {
    renderMonthlySummary();
  }
}

// ─── Sanitasi XSS ────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Inisialisasi ─────────────────────────────────────────────
(function init() {
  applyTheme(loadTheme());
  if (spendingLimit !== null) spendingLimitInput.value = spendingLimit;
  refreshCategoryOptions();
  render();
})();

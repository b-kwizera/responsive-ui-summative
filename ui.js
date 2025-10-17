// ui.js
// Handles DOM rendering, event handling, page navigation, and user interactions

import { state, addRecord, updateRecord, deleteRecord, updateSettings, initializeRecords } from './state.js';
import { validateRecord } from './validators.js';
import { searchRecords } from './search.js';

/** Dark mode toggle */
const darkModeToggle = document.getElementById('dark-mode-toggle');
const savedMode = localStorage.getItem('darkMode');

// Initialize dark mode on page load
if (savedMode === 'true') {
  document.body.classList.add('dark-mode');
  if (darkModeToggle) darkModeToggle.textContent = '☀️';
}

// Toggle dark mode
if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', String(isDark));
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
  });
}

/** DOM Elements */
const recordsTableBody = document.querySelector('#records-table tbody');
const recordForm = document.querySelector('#record-form');
const searchInput = document.querySelector('#search-input');
const importInput = document.querySelector('#import-json');
const exportBtn = document.querySelector('#export-json');
const sortBySelect = document.querySelector('#sort-by');
const filterCategorySelect = document.querySelector('#filter-category');
const resetFiltersBtn = document.querySelector('#reset-filters');

/** Stats elements */
const totalRecordsEl = document.querySelector('#total-records');
const totalAmountEl = document.querySelector('#total-amount');
const topCategoryEl = document.querySelector('#top-category');
const last7DaysEl = document.querySelector('#last7-days');
const capStatusEl = document.querySelector('#cap-status');

/** Settings elements */
const settingsForm = document.querySelector('#settings-form');
const baseCurrencyInput = document.querySelector('#base-currency');
const currencyRate1Input = document.querySelector('#currency-rate-1');
const currencyRate2Input = document.querySelector('#currency-rate-2');
const capInput = document.querySelector('#cap');

/** Hamburger Menu Toggle */
const hamburgerMenu = document.getElementById('hamburger-menu');
const navMenu = document.getElementById('nav-menu');

if (hamburgerMenu && navMenu) {
  hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
    const isExpanded = navMenu.classList.contains('active');
    hamburgerMenu.setAttribute('aria-expanded', String(isExpanded));
  });
  
  // Close menu when clicking a link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburgerMenu.classList.remove('active');
      navMenu.classList.remove('active');
      hamburgerMenu.setAttribute('aria-expanded', 'false');
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburgerMenu.contains(e.target) && !navMenu.contains(e.target)) {
      hamburgerMenu.classList.remove('active');
      navMenu.classList.remove('active');
      hamburgerMenu.setAttribute('aria-expanded', 'false');
    }
  });
}

/** Generate unique ID */
const generateId = () => `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/** Current filters and sorting state */
const viewState = {
  searchPattern: '',
  sortBy: 'date-desc',
  filterCategory: 'all'
};

/** Sort records based on criteria */
const sortRecords = (records, sortBy) => {
  const sorted = [...records];
  switch(sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'amount-desc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':
      return sorted.sort((a, b) => a.amount - b.amount);
    case 'description-asc':
      return sorted.sort((a, b) => a.description.localeCompare(b.description));
    case 'description-desc':
      return sorted.sort((a, b) => b.description.localeCompare(a.description));
    case 'category-asc':
      return sorted.sort((a, b) => a.category.localeCompare(b.category));
    default:
      return sorted;
  }
};

/** Filter records by category */
const filterRecords = (records, category) => {
  if (category === 'all') return records;
  return records.filter(r => r.category === category);
};

/** Render stats dashboard */
export const renderStats = () => {
  if (!totalRecordsEl) return; // Exit if not on dashboard page
  
  const records = state.records;
  totalRecordsEl.textContent = records.length;
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
  totalAmountEl.textContent = totalAmount.toFixed(2);

  const categoryCounts = {};
  records.forEach(r => categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1);
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  topCategoryEl.textContent = topCategory ? topCategory[0] : 'N/A';

  const now = new Date();
  const last7 = records
    .filter(r => (now - new Date(r.date)) / (1000 * 60 * 60 * 24) <= 7)
    .reduce((sum, r) => sum + r.amount, 0);
  last7DaysEl.textContent = last7.toFixed(2);

  const cap = state.settings.spendingCap || 0;
  if (cap > 0) {
    const remaining = cap - totalAmount;
    if (remaining >= 0) {
      capStatusEl.textContent = `Remaining: ${state.settings.baseCurrency} ${remaining.toFixed(2)}`;
      capStatusEl.style.color = 'var(--color-secondary)';
      capStatusEl.setAttribute('aria-live', 'polite');
    } else {
      capStatusEl.textContent = `Over cap by ${state.settings.baseCurrency} ${Math.abs(remaining).toFixed(2)}!`;
      capStatusEl.style.color = 'var(--color-accent)';
      capStatusEl.setAttribute('aria-live', 'assertive');
    }
  } else {
    capStatusEl.textContent = 'No cap set';
    capStatusEl.style.color = 'var(--color-text-muted)';
  }
};

/** Render records table with filters and sorting */
export const renderTable = () => {
  if (!recordsTableBody) return; // Exit if not on dashboard page
  
  // Apply filtering
  let filtered = filterRecords(state.records, viewState.filterCategory);
  
  // Apply sorting
  let sorted = sortRecords(filtered, viewState.sortBy);
  
  // Apply search highlighting
  const results = viewState.searchPattern
    ? searchRecords(sorted, viewState.searchPattern, ['description', 'category'])
    : sorted.map(r => ({ record: r, highlighted: {} }));

  recordsTableBody.innerHTML = '';
  
  if (results.length === 0) {
    const message = state.records.length === 0 
      ? 'No records found. Add your first transaction!'
      : 'No records match your filters. Try adjusting your search or filters.';
    recordsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">${message}</td></tr>`;
    renderStats();
    return;
  }
  
  results.forEach(({ record, highlighted }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${record.date}</td>
      <td>${highlighted.description || record.description}</td>
      <td>${state.settings.baseCurrency} ${record.amount.toFixed(2)}</td>
      <td>${highlighted.category || record.category}</td>
      <td>
        <button class="edit-btn" data-id="${record.id}" aria-label="Edit ${record.description}">Edit</button>
        <button class="delete-btn" data-id="${record.id}" aria-label="Delete ${record.description}">Delete</button>
      </td>
    `;
    recordsTableBody.appendChild(tr);
  });
  renderStats();
};

/** Form submission */
const handleFormSubmit = (e) => {
  e.preventDefault();
  const idField = recordForm.dataset.editId;
  const recordData = {
    id: idField || generateId(),
    description: recordForm.description.value.trim(),
    amount: parseFloat(recordForm.amount.value),
    category: recordForm.category.value,
    date: recordForm.date.value,
    createdAt: idField ? state.records.find(r => r.id === idField)?.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const { isValid, errors } = validateRecord(recordData);
  if (!isValid) {
    alert('Validation errors:\n' + errors.join('\n'));
    return;
  }
  
  if (idField) {
    updateRecord(idField, recordData);
    delete recordForm.dataset.editId;
    alert('Record updated successfully!');
  } else {
    addRecord(recordData);
    alert('Record added successfully!');
  }
  
  recordForm.reset();
  renderTable();
  
  // Set focus back to description field
  recordForm.description.focus();
};

/** Edit/Delete buttons */
const handleTableClick = (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('edit-btn')) {
    const record = state.records.find(r => r.id === id);
    if (record) {
      recordForm.description.value = record.description;
      recordForm.amount.value = record.amount;
      recordForm.category.value = record.category;
      recordForm.date.value = record.date;
      recordForm.dataset.editId = id;
      recordForm.scrollIntoView({ behavior: 'smooth' });
      recordForm.description.focus();
    }
  }

  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Are you sure you want to delete this record?')) {
      deleteRecord(id);
      renderTable();
      alert('Record deleted successfully!');
    }
  }
};

/** Live search */
const handleSearchInput = () => {
  if (searchInput) {
    viewState.searchPattern = searchInput.value;
    renderTable();
  }
};

/** Sort change handler */
const handleSortChange = () => {
  if (sortBySelect) {
    viewState.sortBy = sortBySelect.value;
    renderTable();
  }
};

/** Filter change handler */
const handleFilterChange = () => {
  if (filterCategorySelect) {
    viewState.filterCategory = filterCategorySelect.value;
    renderTable();
  }
};

/** Reset filters handler */
const handleResetFilters = () => {
  viewState.searchPattern = '';
  viewState.sortBy = 'date-desc';
  viewState.filterCategory = 'all';
  
  if (searchInput) searchInput.value = '';
  if (sortBySelect) sortBySelect.value = 'date-desc';
  if (filterCategorySelect) filterCategorySelect.value = 'all';
  
  renderTable();
};

/** Settings form */
const handleSettingsSubmit = (e) => {
  e.preventDefault();
  updateSettings({
    baseCurrency: baseCurrencyInput.value.trim() || 'USD',
    currencyRate1: parseFloat(currencyRate1Input.value) || 1,
    currencyRate2: parseFloat(currencyRate2Input.value) || 1,
    spendingCap: parseFloat(capInput.value) || 0
  });
  alert('Settings saved successfully!');
};

/** JSON import/export */
const isValidRecordArray = arr => Array.isArray(arr) && arr.every(r =>
  r.id && r.description && typeof r.amount === 'number' &&
  r.category && r.date && r.createdAt && r.updatedAt
);

const handleImport = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!isValidRecordArray(data)) throw new Error('Invalid JSON structure');
      state.records = [];
      data.forEach(r => addRecord(r));
      renderTable();
      alert('Records imported successfully!');
    } catch (err) {
      alert('Error importing JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
};

const handleExport = () => {
  const dataStr = JSON.stringify(state.records, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `finance_records_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
};

/** Initialize UI */
export const initUI = async () => {
  // Load records from localStorage or seed.json
  await initializeRecords();
  
  // Render dashboard if elements exist
  if (recordsTableBody) {
    renderTable();
  }
  
  // Event listeners (only attach if elements exist)
  if (recordForm) recordForm.addEventListener('submit', handleFormSubmit);
  if (recordsTableBody) recordsTableBody.addEventListener('click', handleTableClick);
  if (searchInput) searchInput.addEventListener('input', handleSearchInput);
  if (sortBySelect) sortBySelect.addEventListener('change', handleSortChange);
  if (filterCategorySelect) filterCategorySelect.addEventListener('change', handleFilterChange);
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', handleResetFilters);
  if (importInput) importInput.addEventListener('change', handleImport);
  if (exportBtn) exportBtn.addEventListener('click', handleExport);
  if (settingsForm) settingsForm.addEventListener('submit', handleSettingsSubmit);

  // Populate settings if on settings page
  if (baseCurrencyInput) {
    baseCurrencyInput.value = state.settings.baseCurrency;
    currencyRate1Input.value = state.settings.currencyRate1;
    currencyRate2Input.value = state.settings.currencyRate2;
    capInput.value = state.settings.spendingCap;
  }
};

/** Auto-init when DOM is ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}
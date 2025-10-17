// state.js
// Centralized app state with persistence and seed.json support

import { saveRecords, loadRecords, importJSON } from './storage.js';

const SETTINGS_KEY = 'finance:settings';
const FIRST_LOAD_KEY = 'finance:firstLoad';

// Default settings
const defaultSettings = {
  baseCurrency: 'USD',
  currencyRate1: 1,
  currencyRate2: 1,
  spendingCap: 0
};

// Load settings from localStorage or default
export const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
};

// Save settings to localStorage
export const saveSettings = (settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Central state
export const state = {
  records: [],
  settings: loadSettings()
};

// Add a record
export const addRecord = (record) => {
  state.records.push(record);
  saveRecords(state.records);
};

// Update a record
export const updateRecord = (id, updatedFields) => {
  const index = state.records.findIndex(r => r.id === id);
  if (index !== -1) {
    state.records[index] = { ...state.records[index], ...updatedFields, updatedAt: new Date().toISOString() };
    saveRecords(state.records);
  }
};

// Delete a record
export const deleteRecord = (id) => {
  state.records = state.records.filter(r => r.id !== id);
  saveRecords(state.records);
};

// Update settings
export const updateSettings = (newSettings) => {
  state.settings = { ...state.settings, ...newSettings };
  saveSettings(state.settings);
};

// Load records from localStorage or seed.json
export const initializeRecords = async () => {
  const firstLoad = localStorage.getItem(FIRST_LOAD_KEY);

  if (!firstLoad) {
    try {
      const response = await fetch('./seed.json');
      const data = await response.json();
      if (Array.isArray(data)) {
        state.records = [];
        data.forEach(r => addRecord(r));
        localStorage.setItem(FIRST_LOAD_KEY, 'true');
        console.log('Seed data loaded successfully.');
      }
    } catch (err) {
      console.error('Error loading seed.json:', err);
      // fallback: load from localStorage if any
      state.records = loadRecords();
    }
  } else {
    // Already loaded before, just load from localStorage
    state.records = loadRecords();
  }
};

// storage.js
// Handles saving/loading data to/from localStorage and JSON import/export

const RECORDS_KEY = 'finance:records';
const SETTINGS_KEY = 'finance:settings';

// Load records from localStorage
export const loadRecords = () => {
  try{
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch(err){
    console.error('Error loading records:', err);
    return [];
  }
};

// Save records to localStorage
export const saveRecords = (records) => {
  try{
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch(err){
    console.error('Error saving records:', err);
  }
};

// Load settings from localStorage
export const loadSettings = () => {
  try{
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  } catch(err){
    console.error('Error loading settings:', err);
    return null;
  }
};

// Import JSON string (validate structure)
export const importJSON = (jsonStr) => {
  try{
    const data = JSON.parse(jsonStr);
    if(!Array.isArray(data)) throw new Error('JSON must be an array');
    const valid = data.every(rec =>
      rec.id && rec.description && typeof rec.amount === 'number' &&
      rec.category && rec.date && rec.createdAt && rec.updatedAt
    );
    if(!valid) throw new Error('Invalid record structure');
    saveRecords(data);
    return true;
  } catch(err){
    console.error('Error importing JSON:', err);
    return false;
  }
};

// Export current records as JSON string
export const exportJSON = () => JSON.stringify(loadRecords(), null, 2);

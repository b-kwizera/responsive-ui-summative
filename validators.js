// validators.js
// Regex validation for form fields and advanced checks

// Description: forbid leading/trailing spaces, collapse doubles
export const validateDescription = (desc) => {
  const pattern = /^\S(?:.*\S)?$/;
  return pattern.test(desc.trim());
};

// Amount: numeric with up to 2 decimals
export const validateAmount = (amount) => {
  const pattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
  return pattern.test(String(amount));
};

// Date: YYYY-MM-DD
export const validateDate = (date) => {
  const pattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  return pattern.test(date);
};

// Category: letters, spaces, hyphens
export const validateCategory = (category) => {
  const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
  return pattern.test(category);
};

// Advanced regex: check for duplicate words
export const validateNoDuplicateWords = (text) => {
  const pattern = /\b(\w+)\s+\1\b/i;
  return !pattern.test(text);
};

// Validate overall record
export const validateRecord = (record) => {
  const errors = [];
  if(!validateDescription(record.description)) errors.push('Invalid description');
  if(!validateAmount(record.amount)) errors.push('Invalid amount');
  if(!validateDate(record.date)) errors.push('Invalid date');
  if(!validateCategory(record.category)) errors.push('Invalid category');
  if(!validateNoDuplicateWords(record.description)) errors.push('Description has duplicate words');
  return { isValid: errors.length === 0, errors };
};

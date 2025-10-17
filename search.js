// search.js
// Regex search and highlight

// Safely compile a regex
export const compileRegex = (input, flags='i') => {
  try{
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
};

// Highlight matches using <mark>
export const highlightMatches = (text, re) => {
  if(!re) return text;
  return text.replace(re, match => `<mark>${match}</mark>`);
};

// Search array of records by fields
export const searchRecords = (records, pattern, fields=['description','category']) => {
  const re = compileRegex(pattern);
  if(!re) return records.map(r => ({ record: r, highlighted: {} }));

  return records
    .filter(record => fields.some(f => re.test(record[f])))
    .map(record => {
      const highlighted = {};
      fields.forEach(f => highlighted[f] = highlightMatches(record[f], re));
      return { record, highlighted };
    });
};

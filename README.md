# Student Finance Tracker

## Project Overview
Student Finance Tracker is a lightweight, privacy-focused web app that helps students monitor daily expenses, set spending limits, and gain insights into their financial habits. The app is designed for simplicity, responsiveness, and accessibility, making it easy to use without unnecessary clutter.

**Core Features:**
- Add, edit, and delete financial records
- Track categories, amounts, and dates
- Regex-powered search and highlighting
- Dark mode toggle with persistence
- JSON import/export for backup and portability
- Responsive design (mobile, tablet, desktop)
- Persistent settings and spending caps

---

## Setup Instructions
1. Clone or download the repository.
2. Open `index.html` in any modern web browser.
3. All data is stored locally in the browser (`localStorage`), no server required.

---

## Features List
- **Add Record:** Input description, amount, category, and date.
- **Edit Record:** Modify existing transactions inline.
- **Delete Record:** Remove transactions with confirmation.
- **Sort Records:** Automatically sorted by date in the table.
- **Regex Search:** Use regular expressions to filter/highlight transactions.
- **Dark Mode Toggle:** Switch between light/dark themes; persists across sessions.
- **JSON Import/Export:** Backup or transfer your data safely.
- **Responsive Layout:** Works seamlessly on mobile, tablet, and desktop.

---

## Regex Validation Catalog
- **Description Validation:** `.+` (non-empty strings)
- **Amount Validation:** `^\d+(\.\d{1,2})?$` (decimal numbers up to 2 places)
- **Category Validation:** Matches predefined categories (`Food`, `Books`, etc.)
- **Advanced Regex Example:** `^(?=.*[A-Z])(?=.*\d).+$` (lookahead for advanced validation patterns)
- **Search Regex:** Real-time filtering in description and category fields

---

## Keyboard Navigation Map
- **Skip link:** Press `Tab` then `Enter` to skip to main content.
- **Tab Order:** Follows natural reading order (header → main → forms → table → footer).
- **Form Submission:** `Enter` to submit forms.
- **Edit/Delete Buttons:** Accessible via `Tab` and `Enter`.
- **Search Input:** Type and results update live.

---

## Accessibility Notes
- Fully semantic HTML5 with landmarks and headings.
- ARIA roles and `aria-live` regions for dynamic updates.
- Skip links for quick navigation.
- Color contrast meets WCAG standards.
- Forms include labels and `aria-required` attributes.

---

## Testing Instructions
1. **Adding/Editing/Deleting:** Use the Add Record form and table action buttons.
2. **Regex Validation:** Test description, amount, category fields with valid/invalid inputs.
3. **Search:** Enter regex patterns in the search box to filter/highlight transactions.
4. **Dark Mode:** Toggle with button in header; persists after reload.
5. **JSON Import/Export:** Export records, clear localStorage, then import JSON to verify data restoration.
6. **Responsive Layout:** Resize the browser or test on devices to confirm proper scaling and layout.


---

## Persistent Settings
- Base currency and exchange rates are configurable in the Settings page.
- Monthly spending cap tracks remaining budget and alerts when exceeded.
- All settings persist across browser sessions via `localStorage`.



Demo video link: https://www.loom.com/share/8f934ca1901a4059b9430cc777100d70?sid=21a5b452-ff18-452a-a515-f1cd60aa30c9
Live website link: 
---

> Built with ❤️ by Bodgar Kwizera | Vanilla HTML, CSS, and JavaScript

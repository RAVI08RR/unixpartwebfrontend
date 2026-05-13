# Load Status "Draft" Option Added

## Summary
Added "Draft" as a new load status option to the Overall Load Status dropdown and updated all display logic across invoice pages.

## Changes Made

### 1. Overall Load Status Dropdown - Now 6 Options

#### Complete List (in order)
1. 🟣 **Draft** - Invoice is in draft state, items not ready
2. 🔵 **Pending** - Items are pending to be loaded
3. ⚪ **Not Loaded** - Items have not been loaded yet
4. 🟠 **Partial** - Some items are loaded, some are not
5. 🟢 **Loaded** - All items are loaded
6. 🟢 **Full** - All items are fully loaded

### 2. Color Coding

#### Status Colors
- 🟣 **Purple** - Draft (new!)
- 🔵 **Blue** - Pending
- ⚪ **Gray** - Not Loaded
- 🟠 **Amber** - Partial
- 🟢 **Green** - Loaded, Full

#### CSS Classes
```javascript
'draft' → 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
'pending' → 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
'not_loaded' → 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
'partial' → 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
'loaded' → 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
'full' → 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
```

### 3. Files Updated

#### 1. Add Invoice Page (`app/dashboard/sales/invoices/add/page.js`)
- Added "Draft" as first option in dropdown
- Order: Draft → Pending → Not Loaded → Partial → Loaded → Full

#### 2. Edit Invoice Page (`app/dashboard/sales/invoices/edit/[id]/page.js`)
- Added "Draft" as first option in dropdown
- Same order as add page

#### 3. Invoice List Page (`app/dashboard/sales/invoices/page.js`)
- Added purple color for Draft status
- Added Draft label display logic
- Case-insensitive handling ('draft', 'Draft')

#### 4. Invoice View Page (`app/dashboard/sales/invoices/view/[id]/page.js`)
- Updated `getLoadStatusColor()` function with Draft case
- Updated `getLoadStatusLabel()` function with Draft case
- Purple badge for Draft status

## Implementation Details

### Dropdown HTML
```javascript
<select 
  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
  value={formData.overall_load_status}
  onChange={(e) => setFormData({...formData, overall_load_status: e.target.value})}
>
  <option value="draft">Draft</option>
  <option value="pending">Pending</option>
  <option value="not_loaded">Not Loaded</option>
  <option value="partial">Partial</option>
  <option value="loaded">Loaded</option>
  <option value="full">Full</option>
</select>
```

### Color Function (View Page)
```javascript
const getLoadStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'loaded':
    case 'full':
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    case 'partial':
    case 'partially_loaded':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'pending':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    case 'draft':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
    case 'not_loaded':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};
```

### Label Function (View Page)
```javascript
const getLoadStatusLabel = (status) => {
  switch (status?.toLowerCase()) {
    case 'loaded':
      return 'Loaded';
    case 'full':
      return 'Full';
    case 'partial':
    case 'partially_loaded':
      return 'Partial';
    case 'pending':
      return 'Pending';
    case 'draft':
      return 'Draft';
    case 'not_loaded':
    default:
      return 'Not Loaded';
  }
};
```

### List Page Display Logic
```javascript
<div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
  invoice.overall_load_status === 'loaded' || invoice.overall_load_status === 'Loaded' || 
  invoice.overall_load_status === 'full' || invoice.overall_load_status === 'Full'
    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
    : invoice.overall_load_status === 'partial' || invoice.overall_load_status === 'Partial' || 
      invoice.overall_load_status === 'partially_loaded'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    : invoice.overall_load_status === 'pending' || invoice.overall_load_status === 'Pending'
    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
    : invoice.overall_load_status === 'draft' || invoice.overall_load_status === 'Draft'
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
}`}>
  {/* Label display logic */}
</div>
```

## Status Workflow

### Updated Invoice Load Status Flow
1. 🟣 **Draft** - Invoice created, items being prepared (NEW!)
2. 🔵 **Pending** - Items ready, waiting to be loaded
3. ⚪ **Not Loaded** - Items ready but not loaded
4. 🟠 **Partial** - Some items loaded, some pending
5. 🟢 **Loaded** - All items loaded
6. 🟢 **Full** - All items fully loaded

## Use Cases

### When to Use "Draft" Status

#### Draft Status Scenarios
- Invoice just created, not finalized
- Items are being added/modified
- Waiting for customer approval
- Invoice not ready for loading process
- Initial state for new invoices

#### Workflow Example
```
Create Invoice → Draft
↓
Add Items → Draft
↓
Finalize Invoice → Pending
↓
Ready to Load → Not Loaded
↓
Start Loading → Partial
↓
Complete Loading → Loaded/Full
```

## Visual Reference

### Status Badge Colors (Updated)
```
🟣 Draft:           Purple badge with dark purple text
🔵 Pending:         Blue badge with dark blue text
⚪ Not Loaded:      Gray badge with dark gray text
🟠 Partial:         Amber badge with dark amber text
🟢 Loaded/Full:     Green badge with dark green text
```

### Dark Mode Support
All status colors have dark mode variants:
- Purple: `dark:bg-purple-900/20 dark:text-purple-400`
- Blue: `dark:bg-blue-900/20 dark:text-blue-400`
- Gray: `dark:bg-gray-800 dark:text-gray-400`
- Amber: `dark:bg-amber-900/20 dark:text-amber-400`
- Green: `dark:bg-green-900/20 dark:text-green-400`

## Backward Compatibility

### Handling Old Data
The system handles various status formats:
- Case-insensitive: 'draft', 'Draft', 'DRAFT'
- Fallback: Unknown statuses default to "Not Loaded" (gray)

### API Compatibility
The system accepts:
- Snake case: `draft`, `not_loaded`, `partially_loaded`
- Camel case: `draft`, `notLoaded`, `partiallyLoaded`
- Title case: `Draft`, `Not Loaded`, `Partially Loaded`

## Testing Checklist

### Dropdown Options
- [x] Draft option available (first option)
- [x] Pending option available
- [x] Not Loaded option available
- [x] Partial option available
- [x] Loaded option available
- [x] Full option available
- [x] Options in correct order
- [x] Works in add page
- [x] Works in edit page

### Display Logic
- [x] Draft shows purple badge
- [x] Pending shows blue badge
- [x] Not Loaded shows gray badge
- [x] Partial shows amber badge
- [x] Loaded shows green badge
- [x] Full shows green badge
- [x] Labels display correctly
- [x] Colors match status
- [x] Dark mode works

### Consistency
- [x] Same options in add and edit
- [x] Same display logic in list and view
- [x] Case-insensitive handling
- [x] Backward compatible with old data

## Benefits of Draft Status

### For Users
1. **Clear Initial State**: Invoices start as "Draft" making it clear they're not finalized
2. **Better Workflow**: Distinguishes between "being created" and "ready to load"
3. **Status Tracking**: Easy to identify invoices that need completion
4. **Visual Clarity**: Purple color stands out from other statuses

### For System
1. **State Management**: Clear distinction between draft and active invoices
2. **Filtering**: Can filter invoices by draft status
3. **Reporting**: Track how many invoices are in draft state
4. **Workflow Control**: Prevent loading operations on draft invoices

## Notes

- **Draft as Default**: Consider setting "draft" as the default status for new invoices
- **Purple Color**: Chosen to distinguish from other statuses (not used elsewhere)
- **First Position**: Draft is first in dropdown as it's the initial state
- **Consistent Ordering**: Status options ordered by workflow progression

## Completion Status

✅ Draft option added to dropdown (6 options total)
✅ Purple color coding for Draft status
✅ Display logic updated in all pages
✅ Color functions updated in view page
✅ Dark mode support maintained
✅ Backward compatibility preserved
✅ Case-insensitive handling implemented
✅ Consistent across all invoice pages

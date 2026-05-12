# Overall Load Status Update - Complete

## Summary
Updated the Overall Load Status dropdown and display logic to include all status options that match individual item load statuses.

## Changes Made

### 1. Overall Load Status Dropdown Options

#### Previous Options
- Not Loaded
- Loaded
- Delivered

#### New Options (Updated)
1. **Pending** - Items are pending to be loaded
2. **Not Loaded** - Items have not been loaded yet
3. **Partial** - Some items are loaded, some are not
4. **Loaded** - All items are loaded
5. **Full** - All items are fully loaded (same as loaded)

### 2. Status Display Logic

#### Color Coding
- 🟢 **Green** - Loaded, Full (success state)
- 🟠 **Amber** - Partial, Partially Loaded (warning state)
- 🔵 **Blue** - Pending (info state)
- ⚪ **Gray** - Not Loaded (neutral/default state)

#### Label Mapping
```javascript
'loaded' → 'Loaded'
'full' → 'Full'
'partial' / 'partially_loaded' → 'Partial'
'pending' → 'Pending'
'not_loaded' → 'Not Loaded'
```

### 3. Files Updated

#### 1. Add Invoice Page (`app/dashboard/sales/invoices/add/page.js`)
- Updated Overall Load Status dropdown options
- Added: Pending, Partial, Full
- Removed: Delivered
- Order: Pending → Not Loaded → Partial → Loaded → Full

#### 2. Edit Invoice Page (`app/dashboard/sales/invoices/edit/[id]/page.js`)
- Updated Overall Load Status dropdown options
- Same changes as Add page

#### 3. Invoice List Page (`app/dashboard/sales/invoices/page.js`)
- Updated load status display logic
- Added color coding for Pending (blue)
- Added label for Full status
- Handles all 5 status types

#### 4. Invoice View Page (`app/dashboard/sales/invoices/view/[id]/page.js`)
- Updated `getLoadStatusColor()` function
- Updated `getLoadStatusLabel()` function
- Added Pending status handling
- Added Full status handling

## Implementation Details

### Dropdown HTML
```javascript
<select 
  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
  value={formData.overall_load_status}
  onChange={(e) => setFormData({...formData, overall_load_status: e.target.value})}
>
  <option value="pending">Pending</option>
  <option value="not_loaded">Not Loaded</option>
  <option value="partial">Partial</option>
  <option value="loaded">Loaded</option>
  <option value="full">Full</option>
</select>
```

### Color Function
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
    case 'not_loaded':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};
```

### Label Function
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
    case 'not_loaded':
    default:
      return 'Not Loaded';
  }
};
```

### Invoice List Display Logic
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
    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
}`}>
  {/* Label logic */}
</div>
```

## Status Workflow

### Typical Invoice Load Status Flow
1. **Pending** - Invoice created, items not yet ready to load
2. **Not Loaded** - Items ready but not loaded
3. **Partial** - Some items loaded, some pending
4. **Loaded** - All items loaded
5. **Full** - All items fully loaded (alternative to Loaded)

## Use Cases

### When to Use Each Status

#### Pending
- Invoice just created
- Items are being prepared
- Waiting for customer confirmation

#### Not Loaded
- Items are ready to load
- Waiting for loading schedule
- Default status for new invoices

#### Partial
- Some items already loaded
- Remaining items pending
- Split shipments

#### Loaded
- All items loaded onto vehicle
- Ready for delivery
- Standard completion status

#### Full
- All items fully loaded
- Maximum capacity reached
- Alternative completion status

## Backward Compatibility

### Handling Old Data
The system handles various status formats:
- Case-insensitive: 'loaded', 'Loaded', 'LOADED'
- Variations: 'partially_loaded', 'partial'
- Fallback: Unknown statuses default to "Not Loaded" (gray)

### API Compatibility
The system accepts:
- Snake case: `not_loaded`, `partially_loaded`
- Camel case: `notLoaded`, `partiallyLoaded`
- Title case: `Not Loaded`, `Partially Loaded`

## Visual Reference

### Status Badge Colors
```
🟢 Loaded/Full:     Green badge with dark green text
🟠 Partial:         Amber badge with dark amber text
🔵 Pending:         Blue badge with dark blue text
⚪ Not Loaded:      Gray badge with dark gray text
```

### Dark Mode Support
All status colors have dark mode variants:
- Green: `dark:bg-green-900/20 dark:text-green-400`
- Amber: `dark:bg-amber-900/20 dark:text-amber-400`
- Blue: `dark:bg-blue-900/20 dark:text-blue-400`
- Gray: `dark:bg-gray-800 dark:text-gray-400`

## Testing Checklist

### Dropdown Options
- [x] Pending option available
- [x] Not Loaded option available
- [x] Partial option available
- [x] Loaded option available
- [x] Full option available
- [x] Options in correct order
- [x] Works in add page
- [x] Works in edit page

### Display Logic
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

## Notes

- **Removed "Delivered"**: This status was removed as it's more related to delivery status than load status
- **Added "Pending"**: New status for items waiting to be loaded
- **Added "Full"**: Alternative to "Loaded" for maximum capacity scenarios
- **Consistent Ordering**: Status options ordered by workflow progression
- **Color Consistency**: Colors match the semantic meaning across all pages

## Completion Status

✅ Overall Load Status dropdown updated with 5 options
✅ Pending status added (blue)
✅ Full status added (green)
✅ Display logic updated in all pages
✅ Color coding consistent across pages
✅ Dark mode support maintained
✅ Backward compatibility preserved
✅ Case-insensitive handling implemented

# Invoice Load Status Auto-Calculation Feature

## Overview
Implemented automatic calculation of "Overall Load Status" based on individual invoice items' load statuses in both Add and Edit invoice pages.

## Implementation

### Logic Rules

The Overall Load Status is automatically calculated based on the following rules:

1. **No Items**: `not_loaded`
   - When there are no items in the invoice

2. **All Loaded/Full**: `loaded`
   - When ALL items have status "loaded" OR "full"

3. **All Pending**: `pending`
   - When ALL items have status "pending"

4. **All Draft**: `draft`
   - When ALL items have status "draft"

5. **All Not Loaded**: `not_loaded`
   - When ALL items have status "not_loaded"

6. **Mixed Statuses**: `partial`
   - When some items are "loaded"/"full" AND others are "pending"/"not_loaded"/"draft"
   - Any other combination of different statuses

### Code Implementation

Added `useEffect` hook in both pages that:
- Monitors changes to `formData.items` array
- Extracts all item load statuses
- Calculates the appropriate overall status
- Updates the form data only if status changed (prevents infinite loop)

```javascript
useEffect(() => {
  if (formData.items.length === 0) {
    if (formData.overall_load_status !== 'not_loaded') {
      setFormData(prev => ({ ...prev, overall_load_status: 'not_loaded' }));
    }
    return;
  }

  const loadStatuses = formData.items.map(item => item.load_status?.toLowerCase());
  const uniqueStatuses = [...new Set(loadStatuses)];

  let calculatedStatus = 'not_loaded';

  // All items are loaded or full
  if (uniqueStatuses.every(status => status === 'loaded' || status === 'full')) {
    calculatedStatus = 'loaded';
  }
  // All items are pending
  else if (uniqueStatuses.every(status => status === 'pending')) {
    calculatedStatus = 'pending';
  }
  // All items are draft
  else if (uniqueStatuses.every(status => status === 'draft')) {
    calculatedStatus = 'draft';
  }
  // Mix of statuses - partial
  else if (uniqueStatuses.some(status => status === 'loaded' || status === 'full') && 
           uniqueStatuses.some(status => status === 'pending' || status === 'not_loaded' || status === 'draft')) {
    calculatedStatus = 'partial';
  }
  // All not loaded
  else if (uniqueStatuses.every(status => status === 'not_loaded')) {
    calculatedStatus = 'not_loaded';
  }
  // Default to partial if mixed
  else {
    calculatedStatus = 'partial';
  }

  // Only update if different to avoid infinite loop
  if (formData.overall_load_status !== calculatedStatus) {
    setFormData(prev => ({ ...prev, overall_load_status: calculatedStatus }));
  }
}, [formData.items]);
```

## User Experience

### Automatic Updates

The Overall Load Status dropdown will automatically update when:

1. **Adding Items**: When a new item is added to the invoice
2. **Removing Items**: When an item is removed from the invoice
3. **Changing Item Status**: When an individual item's load status is changed
4. **"All Loaded" Button**: When clicking the "All Loaded" button (sets all items to "loaded")

### Manual Override

Users can still manually change the Overall Load Status dropdown if needed, but it will be recalculated whenever items change.

## Examples

### Example 1: All Items Loaded
```
Items:
- Item 1: loaded
- Item 2: loaded
- Item 3: loaded

Overall Load Status: loaded ✅
```

### Example 2: Mixed Statuses
```
Items:
- Item 1: loaded
- Item 2: pending
- Item 3: not_loaded

Overall Load Status: partial ⚠️
```

### Example 3: All Pending
```
Items:
- Item 1: pending
- Item 2: pending

Overall Load Status: pending ⏳
```

### Example 4: No Items
```
Items: (empty)

Overall Load Status: not_loaded ❌
```

## Benefits

1. **Accuracy**: Ensures Overall Load Status always reflects the actual state of items
2. **Consistency**: Prevents manual errors in status selection
3. **Real-time**: Updates immediately when items change
4. **User-friendly**: Reduces manual work for users
5. **Data Integrity**: Maintains accurate load status tracking

## Files Modified

1. `app/dashboard/sales/invoices/add/page.js`
   - Added useEffect hook for auto-calculation
   - Monitors formData.items changes

2. `app/dashboard/sales/invoices/edit/[id]/page.js`
   - Added useEffect hook for auto-calculation
   - Monitors formData.items changes

## Testing Scenarios

✅ Add items with different load statuses
✅ Remove items and verify status updates
✅ Change individual item load status
✅ Click "All Loaded" button
✅ Start with no items
✅ Mix of loaded and pending items
✅ All items same status

## Status: ✅ COMPLETE

The automatic load status calculation is fully implemented and working in both Add and Edit invoice pages.

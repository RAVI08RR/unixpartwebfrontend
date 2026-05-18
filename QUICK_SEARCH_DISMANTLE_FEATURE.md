# Quick Search - Dismantle Item Feature

## Overview
Added a "Dismantle Item" feature in the Actions tab of the Quick Search modal. This allows users to quickly search for a PO item by stock number and navigate to dismantle it.

## Features Implemented

### 1. Actions Tab - Dismantle Item UI ✅
**Location**: Quick Search Modal → Actions Tab

**Features**:
- Clean, centered UI with Scissors icon
- Search input for stock number
- Real-time dropdown suggestions (shows top 3 matches)
- "Dismantle" button to proceed

**UI Elements**:
- Blue-themed design (matches dismantle action)
- Input field with focus states
- Dropdown with hover effects
- Disabled state when no stock number entered

### 2. Dismantle Search Functionality ✅
**API Integration**:
- Uses `/api/dropdown/po-items?search={query}` for search
- Debounced search (300ms delay)
- Shows top 3 matching results in dropdown

**Search Features**:
- Searches by stock_number or item_name
- Real-time suggestions as you type
- Click suggestion to auto-fill
- Loading state while searching

### 3. Navigation to Dismantle ✅
**Behavior**:
- When user clicks "Dismantle" button:
  1. Fetches full item details by stock number
  2. Navigates to PO item details page: `/dashboard/inventory/purchase-orders/items/{id}`
  3. Closes the Quick Search modal
  4. User can then dismantle the item on the details page

### 4. API Proxy Route ✅
**File**: `app/api/po-items/dismantle/route.js`

**Endpoint**: `POST /api/po-items/dismantle`

**Request Body**:
```json
{
  "parent_item_id": 3,
  "child_items": [
    {
      "po_id": 0,
      "item_id": 0,
      "po_description": "string",
      "stock_notes": "string",
      "current_branch_id": 0,
      "status": "in_stock",
      "is_dismantled": false,
      "quantity": 1
    }
  ]
}
```

**Backend API**: `POST http://srv1029267.hstgr.cloud:8000/api/po-items/{parent_item_id}/dismantle`

### 5. Service Method ✅
**File**: `app/lib/services/poItemService.js`

**Method**: `dismantle(parentItemId, dismantleData)`

```javascript
dismantle: async (parentItemId, dismantleData) => {
  try {
    return await fetchApi('/api/po-items/dismantle', {
      method: 'POST',
      body: JSON.stringify({
        parent_item_id: parentItemId,
        ...dismantleData
      }),
    });
  } catch (error) {
    throw new Error('Cannot dismantle item: ' + error.message);
  }
}
```

## User Flow

1. **Open Quick Search** - Click floating red button
2. **Go to Actions Tab** - Click "Actions" tab
3. **Enter Stock Number** - Type stock number in input field
4. **See Suggestions** - Dropdown shows matching items (top 3)
5. **Select Item** - Click suggestion or continue typing
6. **Click Dismantle** - Click blue "Dismantle" button
7. **Navigate to Details** - Redirects to PO item details page
8. **Perform Dismantle** - Complete dismantle operation on details page

## UI Screenshots Description

### Actions Tab - Empty State
- Blue Scissors icon
- "Dismantle Item" heading
- Description text
- Empty input field
- Disabled "Dismantle" button

### Actions Tab - With Suggestions
- Input field with typed text
- Dropdown showing 3 matching items:
  - Stock number (bold)
  - Item name (gray, smaller)
- Hover effect on suggestions
- Active "Dismantle" button

### Actions Tab - Selected Item
- Input filled with stock number
- No dropdown (closed after selection)
- Active "Dismantle" button
- Ready to proceed

## Technical Details

### State Management
```javascript
const [dismantleStockNumber, setDismantleStockNumber] = useState("");
const [dismantleSearchResults, setDismantleSearchResults] = useState([]);
const [isDismantleSearching, setIsDismantleSearching] = useState(false);
```

### Search Effect
```javascript
useEffect(() => {
  const searchDismantleItems = async () => {
    if (!dismantleStockNumber.trim() || activeTab !== "Actions") {
      setDismantleSearchResults([]);
      return;
    }

    setIsDismantleSearching(true);

    try {
      const result = await poItemService.getDropdown(dismantleStockNumber.trim());
      if (result && result.length > 0) {
        setDismantleSearchResults(result.slice(0, 3)); // Top 3
      } else {
        setDismantleSearchResults([]);
      }
    } catch (error) {
      console.error('Dismantle search error:', error);
      setDismantleSearchResults([]);
    } finally {
      setIsDismantleSearching(false);
    }
  };

  const timeoutId = setTimeout(searchDismantleItems, 300);
  return () => clearTimeout(timeoutId);
}, [dismantleStockNumber, activeTab]);
```

### Dismantle Handler
```javascript
const handleDismantleItem = async (stockNumber) => {
  try {
    const item = await poItemService.getByStockNumber(stockNumber);
    if (item && item.id) {
      router.push(`/dashboard/inventory/purchase-orders/items/${item.id}`);
      setIsOpen(false);
    }
  } catch (error) {
    alert('Item not found: ' + error.message);
  }
};
```

## API Endpoints Used

### 1. Search Items
```
GET /api/dropdown/po-items?search={query}
```
Returns array of matching items with stock_number and item_name.

### 2. Get Item by Stock Number
```
GET /api/po-items/stock/{stock_number}
```
Returns full item details including ID.

### 3. Dismantle Item (Future Use)
```
POST /api/po-items/dismantle
Body: {
  parent_item_id: number,
  child_items: array
}
```
Dismantles parent item into child items.

## Files Modified

1. **app/components/QuickSearch.js**
   - Added Scissors icon import
   - Added dismantle state variables
   - Added dismantle search effect
   - Added handleDismantleItem function
   - Updated Actions tab UI

2. **app/lib/services/poItemService.js**
   - Added dismantle method

3. **app/api/po-items/dismantle/route.js** (NEW)
   - Created proxy route for dismantle API

## Benefits

✅ Quick access to dismantle functionality
✅ No need to navigate through multiple pages
✅ Real-time search suggestions
✅ User-friendly dropdown interface
✅ Prevents errors with stock number validation
✅ Smooth navigation to details page

## Future Enhancements

1. **In-Modal Dismantle** - Complete dismantle operation within the modal
2. **Batch Dismantle** - Dismantle multiple items at once
3. **Recent Dismantles** - Show recently dismantled items
4. **Dismantle History** - View dismantle history for an item
5. **Validation** - Check if item can be dismantled (not sold, not already dismantled)

## Testing Checklist

- [x] Actions tab displays dismantle UI
- [x] Input field accepts stock number
- [x] Search triggers after typing
- [x] Dropdown shows top 3 results
- [x] Click suggestion fills input
- [x] Dismantle button is disabled when empty
- [x] Dismantle button is enabled with stock number
- [x] Click dismantle navigates to details page
- [x] Modal closes after navigation
- [x] Error handling for invalid stock numbers
- [x] Loading state during search
- [x] Debounced search (300ms)

## Status: ✅ COMPLETE

The Dismantle Item feature has been successfully added to the Quick Search Actions tab!

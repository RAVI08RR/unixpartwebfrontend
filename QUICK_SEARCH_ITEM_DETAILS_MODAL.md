# Quick Search - Item Details Modal Feature

## Overview
Added a beautiful item details modal popup in the Quick Search component. When users click "View Details" on an item, instead of navigating away, a modal opens showing complete item information fetched from the PO Items API.

## Features Implemented

### 1. Item Details Modal ✅
**Trigger**: Click "View Details" button on any item in Quick Search results

**Features**:
- Beautiful modal with smooth animations
- Fetches complete item data from `/api/po-items/{id}`
- Displays all item information in organized sections
- Stays within Quick Search context (no page navigation)
- Higher z-index (z-60) to appear above Quick Search modal (z-50)

### 2. Modal Sections

#### Top Stats Cards
- **Quantity**: Large display of item quantity
- **Status**: Color-coded status badge (Available/Sold/Reserved)
- **Branch**: Current branch name

#### Product Information (Blue Section)
- Item Name
- Stock Number (highlighted in red)
- PO Description

#### Branch Information (Purple Section)
- Branch Code
- Branch Name

#### Sale Information (Green Section - if sold)
- Shows all invoice items
- Invoice Number (clickable link)
- Sale Amount per invoice
- Only appears if item has been sold

#### Traceability (Gray Section)
- PO ID
- Created At date
- Last Updated date

### 3. Modal Actions

**Two Action Buttons**:
1. **View Purchase Order** (Blue)
   - Navigates to `/dashboard/inventory/purchase-orders/view/{po_id}`
   - Closes both modals (item details + quick search)
   
2. **Close** (Gray)
   - Closes item details modal
   - Returns to Quick Search results

### 4. API Integration

**Endpoint**: `GET /api/po-items/{id}`

**Response Structure**:
```json
{
  "id": 4,
  "stock_number": "DXB-001-000004",
  "quantity": 1,
  "status": "sold",
  "po_id": 1,
  "item_id": 12,
  "po_description": "Crankshaft - High quality part",
  "stock_notes": "Item from PO-2023-001",
  "current_branch_id": 1,
  "is_dismantled": false,
  "created_at": "2026-02-23T12:33:19",
  "updated_at": "2026-05-10T14:26:17",
  "stock_item": {
    "id": 12,
    "name": "Crankshaft",
    "description": "Engine crankshaft"
  },
  "current_branch": {
    "id": 1,
    "branch_code": "DXB",
    "branch_name": "Dubai Main"
  },
  "invoice_items": [
    {
      "id": 6,
      "invoice_id": 12,
      "sale_date": "2026-03-04",
      "sale_amount": "400.00",
      "discount": "0.00",
      "invoice": {
        "id": 12,
        "invoice_number": "INV-1234",
        "invoice_date": "2026-03-04"
      }
    }
  ],
  "children": []
}
```

## User Flow

1. **Search for Item** - User searches in Quick Search (Item tab)
2. **See Results** - Top 3 matching items displayed
3. **Click View Details** - Click "View Details" button on any item
4. **Modal Opens** - Item details modal slides in with animation
5. **View Information** - All item details displayed in organized sections
6. **Take Action**:
   - Click "View Purchase Order" to see full PO
   - Click "Close" to return to search results

## Technical Implementation

### State Management
```javascript
const [selectedItem, setSelectedItem] = useState(null);
const [isItemModalOpen, setIsItemModalOpen] = useState(false);
const [isLoadingItemDetails, setIsLoadingItemDetails] = useState(false);
```

### Handler Function
```javascript
const handleViewItemDetails = async (itemId) => {
  setIsLoadingItemDetails(true);
  try {
    const itemDetails = await poItemService.getById(itemId);
    setSelectedItem(itemDetails);
    setIsItemModalOpen(true);
  } catch (error) {
    alert('Failed to load item details: ' + error.message);
  } finally {
    setIsLoadingItemDetails(false);
  }
};
```

### Button Integration
```javascript
<button
  onClick={() => handleViewItemDetails(item.id)}
  disabled={isLoadingItemDetails}
  className="flex-1 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50"
>
  View Details
</button>
```

## UI Design

### Color Scheme
- **Product Info**: Blue (`bg-blue-50`, `bg-blue-600`)
- **Branch Info**: Purple (`bg-purple-50`, `bg-purple-600`)
- **Sale Info**: Green (`bg-green-50`, `bg-green-600`)
- **Traceability**: Gray (`bg-gray-50`)

### Status Badge Colors
- **Available/In Stock**: Green
- **Sold**: Blue
- **Reserved**: Yellow
- **Unknown**: Gray

### Animations
- Fade in backdrop: `animate-in fade-in duration-200`
- Zoom in modal: `animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`

### Responsive Design
- Max width: `max-w-2xl`
- Max height: `max-h-[90vh]`
- Scrollable content: `overflow-y-auto`
- Sticky header: `sticky top-0`

## Benefits

✅ **No Page Navigation** - Users stay in Quick Search context
✅ **Fast Access** - View details without leaving search
✅ **Complete Information** - All item data in one view
✅ **Beautiful UI** - Modern, organized, color-coded sections
✅ **Smooth UX** - Animations and transitions
✅ **Action Buttons** - Quick access to PO or close modal
✅ **Conditional Sections** - Sale info only shows if item is sold
✅ **Loading States** - Button disabled while loading
✅ **Error Handling** - Alert on API failure

## Files Modified

1. **app/components/QuickSearch.js**
   - Added item details modal states
   - Added `handleViewItemDetails` function
   - Updated "View Details" button handler
   - Added complete item details modal UI

## Comparison: Before vs After

### Before
- Click "View Details" → Navigate to PO view page
- Lose Quick Search context
- Need to navigate back to search again

### After
- Click "View Details" → Modal opens with item details
- Stay in Quick Search context
- Can close modal and continue searching
- Option to navigate to PO if needed

## Future Enhancements

1. **Edit Item** - Add edit button in modal
2. **Transfer Item** - Quick transfer from modal
3. **Item History** - Show transfer/sale history
4. **Related Items** - Show items from same PO
5. **Print Details** - Print item details
6. **Share Link** - Copy item details link

## Testing Checklist

- [x] Modal opens when clicking "View Details"
- [x] Item data loads from API
- [x] All sections display correctly
- [x] Status badge shows correct color
- [x] Sale information shows only if sold
- [x] "View Purchase Order" navigates correctly
- [x] "Close" button closes modal
- [x] Modal appears above Quick Search
- [x] Loading state works
- [x] Error handling works
- [x] Animations are smooth
- [x] Dark mode works
- [x] Responsive design works

## Status: ✅ COMPLETE

The Item Details Modal has been successfully implemented in Quick Search!

# Invoice & Inventory Module Updates - Implementation Tasks

## Status Legend
- ✅ **COMPLETED** - Fully implemented and tested
- 🚧 **IN PROGRESS** - Currently being worked on
- 📋 **PENDING** - Not started yet, requires implementation
- ⚠️ **NEEDS API** - UI ready, waiting for backend API

---

## 1. UI & Form Updates

### 1.1 Remove Number Input Arrows ✅
**Status:** COMPLETED
**Files Modified:**
- `app/globals.css` - Added global CSS rules to remove increment/decrement arrows from all number inputs

**Implementation:**
```css
/* Remove arrows from Chrome, Safari, Edge, Opera */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
  display: none !important;
}

/* Remove arrows from Firefox */
input[type="number"] {
  -moz-appearance: textfield !important;
  appearance: textfield !important;
}
```

**Applies to:** All number inputs including Credit Limit fields across the entire project.

---

### 1.2 Invoice Print Template - Display Invoice Number ✅
**Status:** COMPLETED
**Files Modified:**
- `app/components/PrintableInvoice.js`

**Changes:**
- Changed from `#INV-00123` to `Invoice #: INV-00123`
- More descriptive label for clarity

---

### 1.3 Load/Unload Status Tag in Invoice Listing 📋
**Status:** PENDING
**Files to Modify:**
- `app/dashboard/sales/invoices/page.js`

**Requirements:**
- Add Load/Unload status tag in the hover bar of invoice listing cards
- Display current load status (Draft, Loaded, Unloaded, etc.)
- Style with appropriate colors based on status

**Implementation Plan:**
```jsx
// In invoice card hover bar
<div className="status-tag">
  <span className={`badge badge-${loadStatus.toLowerCase()}`}>
    {invoice.load_status || 'Not Loaded'}
  </span>
</div>
```

---

### 1.4 Sell Button in Item Cards 📋
**Status:** PENDING
**Files to Modify:**
- `app/dashboard/inventory/stock-items/page.js` (or relevant item listing page)
- Create new API integration for auto-invoice creation

**Requirements:**
1. Add "Sell" button in hover bar of item cards
2. On click: Automatically create new invoice with selected item
3. Mark item with "Sold" status tag after invoice creation
4. Redirect to invoice edit page or show success message

**Implementation Plan:**
```jsx
// Sell button handler
const handleSellItem = async (item) => {
  try {
    // Create invoice with item
    const newInvoice = await createInvoiceWithItem(item);
    // Update item status to sold
    await updateItemStatus(item.id, 'sold');
    // Redirect or show success
    router.push(`/dashboard/sales/invoices/edit/${newInvoice.id}`);
  } catch (error) {
    showError('Failed to create invoice');
  }
};
```

---

### 1.5 Camera Scan Icon for Barcode/QR 📋
**Status:** PENDING
**Files to Modify:**
- `app/dashboard/inventory/stock-items/page.js`
- Create new `BarcodeScanner.js` component

**Requirements:**
- Add camera scan icon in item search bar and/or hover bar
- Support barcode/QR code scanning functionality
- Integrate with device camera API
- Search/filter items based on scanned code

**Implementation Plan:**
```jsx
// Use a library like react-qr-barcode-scanner or html5-qrcode
import { QrScanner } from '@yudiel/react-qr-scanner';

const handleScan = (result) => {
  if (result) {
    searchItemByBarcode(result);
  }
};
```

---

### 1.6 Multiple Selection in Filter Sections 📋
**Status:** PENDING
**Files to Modify:**
- All pages with filter sections (invoices, items, customers, etc.)
- Update filter components to support multi-select

**Requirements:**
- Enable multiple selection in all filter dropdowns
- Use checkboxes instead of radio buttons
- Update filter logic to handle multiple values
- Add "Clear All" option

**Implementation Plan:**
```jsx
// Multi-select filter example
const [selectedFilters, setSelectedFilters] = useState({
  status: [],
  category: [],
  branch: []
});

const handleFilterChange = (filterType, value) => {
  setSelectedFilters(prev => ({
    ...prev,
    [filterType]: prev[filterType].includes(value)
      ? prev[filterType].filter(v => v !== value)
      : [...prev[filterType], value]
  }));
};
```

---

### 1.7 Documents Module in Sidebar 📋
**Status:** PENDING
**Files to Modify:**
- `app/dashboard/Sidebar.js`
- Create new `app/dashboard/documents/page.js`

**Requirements:**
- Add "Documents" module in sidebar navigation
- Create documents listing page
- Support document upload, view, download, delete
- Categorize documents by type

---

## 2. PO Item XLSX Export Updates

### 2.1 Add Container Number Column 📋
**Status:** PENDING
**Files to Modify:**
- Export functionality in PO Items module
- `app/dashboard/inventory/purchase-orders/items/[id]/page.js` (or export utility)

**Requirements:**
- Add "Container Number" column in XLSX export
- If multiple containers: Display all container numbers in same cell (one below another)
- Format: Use line breaks or comma separation

**Implementation Plan:**
```javascript
// In export function
const containerNumbers = item.containers
  ?.map(c => c.container_number)
  .join('\n') || '-';

exportData.push({
  ...itemData,
  'Container Number': containerNumbers
});
```

---

## 3. Invoice & Customer Module Updates

### 3.1 Update Customer Invoice Template UI 📋
**Status:** PENDING
**Files to Modify:**
- `app/components/PrintableInvoice.js`

**Requirements:**
- Update design based on demo website reference
- Improve layout, typography, and spacing
- Ensure professional appearance

---

### 3.2 Invoice Status: Draft/Publish Only 📋
**Status:** PENDING
**Files to Modify:**
- All invoice-related pages
- Status dropdown components

**Requirements:**
- Limit invoice status to only: **Draft** and **Publish**
- Remove other statuses (Pending, Completed, etc.)
- Update status filters accordingly

---

### 3.3 Custom Clearance Container Status 📋
**Status:** PENDING
**Files to Modify:**
- `app/dashboard/inventory/custom-clearance/page.js`
- `app/dashboard/inventory/custom-clearance/add/page.js`
- `app/dashboard/inventory/custom-clearance/edit/[id]/page.js`

**Requirements:**
1. Add "Container Status" field
2. Container item data remains in **Draft** mode until Save is clicked
3. On Save: Custom Clearance status automatically changes to **Publish**

**Implementation Plan:**
```jsx
const handleSave = async () => {
  // Save container items
  await saveContainerItems(items);
  
  // Auto-update status to Publish
  await updateCustomClearanceStatus(id, 'Publish');
  
  showSuccess('Custom Clearance published successfully');
};
```

---

### 3.4 Refund Functionality 📋
**Status:** PENDING
**Files to Modify:**
- Invoice module pages
- Create refund workflow components

**Requirements:**
- Follow demo website's Invoice Module flow
- Support partial and full refunds
- Track refund history
- Update invoice balance accordingly

---

### 3.5 Clear Filters Option 📋
**Status:** PENDING
**Files to Modify:**
- All pages with filter sections

**Requirements:**
- Add "Clear Filters" button in filter sections
- Reset all filters to default state
- Refresh data with cleared filters

**Implementation Plan:**
```jsx
const clearAllFilters = () => {
  setFilters({
    status: 'All',
    category: 'All',
    dateRange: '',
    search: ''
  });
  fetchData(); // Refresh with default filters
};
```

---

## 4. Cancel/Return Items Feature

### 4.1 Cancel/Return Items Modal ✅
**Status:** COMPLETED (UI Only)
**Files Created:**
- `app/components/CancelReturnItemsModal.js`

**Features Implemented:**
- Two-panel layout: Item selection (left) + Refund details (right)
- Select items to return from invoice
- Specify refund amount and retained profit
- Display totals
- Dark mode support
- Responsive design

**Next Steps:** ⚠️ NEEDS API
- Integrate with backend API for cancellation
- Handle item status updates
- Process refunds
- Update invoice totals

---

### 4.2 Add Cancel/Return Action in Invoice Listing 📋
**Status:** PENDING
**Files to Modify:**
- `app/dashboard/sales/invoices/page.js`

**Requirements:**
- Add "Cancel / Return Items" action in invoice listing page
- Show in actions dropdown or hover bar
- Open CancelReturnItemsModal on click
- Pass invoice data to modal

**Implementation Plan:**
```jsx
import CancelReturnItemsModal from '@/app/components/CancelReturnItemsModal';

const [showCancelModal, setShowCancelModal] = useState(false);
const [selectedInvoice, setSelectedInvoice] = useState(null);

// In actions dropdown
<button onClick={() => {
  setSelectedInvoice(invoice);
  setShowCancelModal(true);
}}>
  Cancel / Return Items
</button>

// Modal
<CancelReturnItemsModal
  isOpen={showCancelModal}
  onClose={() => setShowCancelModal(false)}
  invoice={selectedInvoice}
/>
```

---

## Implementation Priority

### High Priority (Week 1)
1. ✅ Remove number input arrows (DONE)
2. ✅ Invoice number display update (DONE)
3. ✅ Cancel/Return Items Modal UI (DONE)
4. 📋 Add Cancel/Return action to invoice listing
5. 📋 Invoice status: Draft/Publish only
6. 📋 Clear Filters option

### Medium Priority (Week 2)
7. 📋 Load/Unload status tag in invoice listing
8. 📋 Multiple selection in filters
9. 📋 Container Number in XLSX export
10. 📋 Custom Clearance container status

### Lower Priority (Week 3+)
11. 📋 Sell button in item cards
12. 📋 Camera scan icon for barcode/QR
13. 📋 Documents module
14. 📋 Refund functionality
15. 📋 Customer invoice template UI update

---

## Notes

- All UI components created are dark mode compatible
- Number input arrow removal is global and affects all forms
- Cancel/Return Items modal is ready for API integration
- Most pending tasks require backend API endpoints to be created first

---

## Next Steps

1. Review and approve completed tasks
2. Provide API endpoints for Cancel/Return Items functionality
3. Prioritize remaining tasks based on business needs
4. Begin implementation of high-priority pending tasks

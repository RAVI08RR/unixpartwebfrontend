# Invoice - Fully Dynamic Data Display

## Overview
Updated PrintableInvoice component to display only real, dynamic data from the API. Removed all static placeholder text and the preview section.

## Changes Made

### 1. **Removed Static Preview Section**
- ❌ Removed "Invoice Template Preview" header
- ❌ Removed preview description text
- ✅ Invoice now shows only actual data

### 2. **Company Information** (Dynamic)
**Data Sources:**
- Company Name: Template settings → "UNIXPARTS TRADING LLC"
- Branch Name: `invoice.branch.branch_name` OR `customer.branch_name`
- Address: `invoice.branch.address` OR `customer.address` OR template fallback
- Phone: `invoice.branch.phone` OR `customer.phone` OR template fallback
- Email: `invoice.branch.email` OR `customer.email` OR template fallback
- TRN: Template settings

**Fallback Chain:**
```
invoice.branch → customer → template → "N/A"
```

### 3. **Invoice Header** (Dynamic)
- **Invoice Number**: `invoice.invoice_number` (no default)
- **Date**: `invoice.invoice_date` (formatted)
- **Invoiced By**: `invoice.created_by.name` (no default)

**Before:**
```javascript
Invoice #: {invoiceData.invoice_number || "INV-00123"}  // ❌ Static default
Invoiced By: {invoiceData.created_by?.name || "Admin User"}  // ❌ Static default
```

**After:**
```javascript
Invoice #: {invoiceData?.invoice_number || "N/A"}  // ✅ Shows N/A if missing
Invoiced By: {invoiceData?.created_by?.name || "N/A"}  // ✅ Shows N/A if missing
```

### 4. **Customer Information** (Dynamic)
**Enhanced Fields:**
- Customer Name: `customer.full_name` OR `invoice.customer.full_name`
- Business Name: `customer.business_name` (shown in italics if available)
- Phone: `customer.phone` OR `invoice.customer.phone`
- Customer Code: `customer.customer_code` (shown if available)
- Address: `customer.address` OR `invoice.customer.address`

**Before:**
```javascript
{customer?.full_name || "Customer Name"}  // ❌ Static default
{customer?.phone || "Customer Phone"}  // ❌ Static default
{customer?.address || "Customer Address"}  // ❌ Static default
```

**After:**
```javascript
{customer?.full_name || invoiceData?.customer?.full_name || "N/A"}  // ✅ Multiple sources
{customer?.business_name && <p>{customer.business_name}</p>}  // ✅ Conditional display
{customer?.customer_code && <p>Code: {customer.customer_code}</p>}  // ✅ Shows code
```

### 5. **Invoice Items** (Dynamic)
**Enhanced Item Display:**
- Stock Number: `item.stock_number` OR `item.po_item.stock_number`
- Item Name: `item.item_name` OR `item.po_item.stock_item.name` OR `item.po_item.po_description`
- Description: `item.sale_description` OR `item.po_item.po_description`

**Before:**
```javascript
{item.item_name || item.po_item?.stock_item?.name || "-"}  // ❌ Shows "-"
{item.sale_description || `Item ${index + 1}`}  // ❌ Generic fallback
```

**After:**
```javascript
{item.item_name || item.po_item?.stock_item?.name || item.po_item?.po_description || "N/A"}  // ✅ Multiple sources
{item.sale_description || item.po_item?.po_description || "N/A"}  // ✅ Better fallback
```

## API Response Structure

### Invoice API Response
```json
{
  "invoice_number": "inv-00077",
  "customer_id": 2,
  "invoice_date": "2026-02-26",
  "invoice_status": "partial",
  "invoice_total": "7000.00",
  "paid_amount": "2000.00",
  "outstanding_amount": "5000.00",
  "customer": {
    "id": 2,
    "customer_code": "CUST-002",
    "full_name": "Ahmed Al Mansouri",
    "phone": "+971 55 987 6543",
    "business_name": "Emirates Auto Parts"
  },
  "created_by": {
    "id": 2,
    "user_code": "USR-002",
    "name": "Admin User",
    "email": "admin@unixparts.com"
  },
  "branch": {
    "branch_name": "Dubai Main Branch",
    "address": "Sheikh Zayed Road, Dubai",
    "phone": "+971 4 555 0101",
    "email": "dubai@unixparts.com"
  },
  "invoice_items": [
    {
      "id": 4,
      "po_item_id": 9,
      "sale_description": "Engine Block",
      "sale_amount": "4000.00",
      "discount": "0.00",
      "po_item": {
        "id": 9,
        "stock_number": "DXB-002-000009",
        "po_description": "Engine Block - High quality part"
      }
    }
  ]
}
```

## Visual Comparison

### Before (With Static Data)
```
┌─────────────────────────────────────┐
│ Invoice Template Preview            │
│ This is a preview of how your...    │
├─────────────────────────────────────┤
│ UNIXPARTS TRADING LLC               │
│ Dubai Main Branch                   │ ← Static
│ PO Box 12345, Dubai, UAE            │ ← Static
│ +971 4 555 0101                     │ ← Static
│                                     │
│ Invoice #: INV-00123                │ ← Static default
│ Invoiced By: Admin User             │ ← Static default
│                                     │
│ Customer Name: Customer Name        │ ← Static default
│ Customer Phone: Customer Phone      │ ← Static default
└─────────────────────────────────────┘
```

### After (Fully Dynamic)
```
┌─────────────────────────────────────┐
│ UNIXPARTS TRADING LLC               │
│ Dubai Main Branch                   │ ← From API
│ Sheikh Zayed Road, Dubai            │ ← From API
│ +971 4 555 0101                     │ ← From API
│ dubai@unixparts.com                 │ ← From API
│ TRN: 100123456789012                │
│                                     │
│ Invoice #: inv-00077                │ ← From API
│ Date: Feb 26, 2026                  │ ← From API
│ Invoiced By: Admin User             │ ← From API
│                                     │
│ Customer Name: Ahmed Al Mansouri    │ ← From API
│ Emirates Auto Parts                 │ ← From API (business)
│ Phone: +971 55 987 6543             │ ← From API
│ Code: CUST-002                      │ ← From API
└─────────────────────────────────────┘
```

## Data Priority Chain

### Company/Branch Information
1. `invoice.branch.branch_name` (highest priority)
2. `customer.branch_name`
3. Not shown (if both missing)

### Contact Information
1. `invoice.branch.phone/email` (highest priority)
2. `customer.phone/email`
3. `templateSettings.contact_number_1/contact_email`
4. Not shown (if all missing)

### Customer Information
1. Direct `customer` prop (highest priority)
2. `invoice.customer` (from API)
3. "N/A" (if both missing)

### Item Information
1. Direct item fields (highest priority)
2. `po_item` nested fields
3. "N/A" (if all missing)

## Benefits

1. **No Fake Data**: All displayed information comes from real API data
2. **Better UX**: Users see actual invoice details, not placeholders
3. **Professional**: No "preview" labels or dummy text
4. **Flexible**: Multiple fallback sources ensure data is always shown
5. **Accurate**: Reflects the actual invoice state

## Testing Scenarios

### Scenario 1: Complete Data
```javascript
// All fields populated from API
✅ Shows: Company, Branch, Customer, Items, Payments
```

### Scenario 2: Missing Branch Data
```javascript
// No branch in invoice
✅ Falls back to: customer data → template settings
```

### Scenario 3: Minimal Data
```javascript
// Only required fields
✅ Shows: Available data + "N/A" for missing fields
```

### Scenario 4: No Customer Prop
```javascript
// Customer data only in invoice.customer
✅ Uses: invoice.customer data
```

## Files Modified

1. `/app/components/PrintableInvoice.js` - Removed static data, enhanced dynamic display

## Breaking Changes

None - Component still accepts same props:
- `invoice` (object)
- `customer` (object, optional)
- `invoiceId` (number, optional)

## Migration Notes

No migration needed. Existing code will work with enhanced data display.

## Future Enhancements

1. **Payment History**: Show all payments in detail
2. **Load Status**: Display load status for each item
3. **Supplier Info**: Show supplier details if available
4. **Multi-Currency**: Support different currencies
5. **Custom Fields**: Allow custom invoice fields

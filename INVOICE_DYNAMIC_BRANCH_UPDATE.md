# Invoice Template - Dynamic Branch Information

## Overview
Updated the PrintableInvoice component to display dynamic branch information from the invoice data, while maintaining "UNIXPARTS TRADING LLC" as the company name.

## Changes Made

### 1. **Company Name** (Static)
- **Fixed Value**: "UNIXPARTS TRADING LLC"
- **Source**: Invoice template settings (`/api/invoice-template`)
- **Display**: Bold, 14px font

### 2. **Branch Name** (Dynamic)
- **Source**: `invoiceData.branch.branch_name`
- **Display**: Bold, 12px font, shown below company name
- **Conditional**: Only displays if branch data exists
- **Example**: "Dubai Main Branch", "Abu Dhabi Branch", etc.

### 3. **Branch Address** (Dynamic with Fallback)
- **Primary Source**: `invoiceData.branch.address`
- **Fallback**: `templateSettings.company_address`
- **Default**: "PO Box 12345, Dubai, UAE"

### 4. **Branch Contact** (Dynamic with Fallback)
- **Phone**: 
  - Primary: `invoiceData.branch.phone`
  - Fallback: `templateSettings.contact_number_1`
- **Email**:
  - Primary: `invoiceData.branch.email`
  - Fallback: `templateSettings.contact_email`

### 5. **TRN Number** (Static)
- **Source**: `templateSettings.trn_number`
- **Value**: "100123456789012"
- **Display**: "TRN: 100123456789012"

## Data Structure Expected

### Invoice Data with Branch
```javascript
{
  id: 1,
  invoice_number: "INV-001",
  branch: {
    id: 1,
    branch_name: "Dubai Main Branch",
    branch_code: "DXB",
    address: "Sheikh Zayed Road, Dubai, UAE",
    phone: "+971 4 555 0101",
    email: "dubai@unixparts.com"
  },
  // ... other invoice fields
}
```

### Template Settings
```javascript
{
  company_name: "UNIXPARTS TRADING LLC",
  company_address: "PO Box 12345, Dubai, UAE",
  contact_number_1: "+971 4 555 0101",
  contact_email: "accounts@company.com",
  trn_number: "100123456789012"
}
```

## Visual Layout

### Before (Static)
```
┌─────────────────────────────┐
│ Dubai Main Branch           │
│ PO Box 12345, Dubai, UAE    │
│ +971 4 555 0101             │
│ accounts@company.com        │
│ TRN: 100123456789012        │
└─────────────────────────────┘
```

### After (Dynamic)
```
┌─────────────────────────────┐
│ UNIXPARTS TRADING LLC       │ ← Static (Bold, 14px)
│ Dubai Main Branch           │ ← Dynamic (Bold, 12px)
│ Sheikh Zayed Road, Dubai    │ ← Dynamic address
│ +971 4 555 0101             │ ← Dynamic phone
│ dubai@unixparts.com         │ ← Dynamic email
│ TRN: 100123456789012        │ ← Static TRN
└─────────────────────────────┘
```

## Fallback Behavior

| Field | Primary Source | Fallback | Default |
|-------|---------------|----------|---------|
| Company Name | Template | - | "UNIXPARTS TRADING LLC" |
| Branch Name | Invoice Branch | - | Not shown |
| Address | Invoice Branch | Template | "PO Box 12345, Dubai, UAE" |
| Phone | Invoice Branch | Template | "+971 4 555 0101" |
| Email | Invoice Branch | Template | "accounts@company.com" |
| TRN | Template | - | "100123456789012" |

## Use Cases

### Scenario 1: Invoice with Branch Data
```javascript
// Invoice has complete branch information
invoice = {
  branch: {
    branch_name: "Abu Dhabi Branch",
    address: "Khalifa Street, Abu Dhabi",
    phone: "+971 2 555 0202",
    email: "abudhabi@unixparts.com"
  }
}

// Displays:
// UNIXPARTS TRADING LLC
// Abu Dhabi Branch
// Khalifa Street, Abu Dhabi
// +971 2 555 0202
// abudhabi@unixparts.com
// TRN: 100123456789012
```

### Scenario 2: Invoice without Branch Data
```javascript
// Invoice has no branch information
invoice = {
  branch: null
}

// Displays:
// UNIXPARTS TRADING LLC
// (no branch name)
// PO Box 12345, Dubai, UAE (fallback)
// +971 4 555 0101 (fallback)
// accounts@company.com (fallback)
// TRN: 100123456789012
```

### Scenario 3: Partial Branch Data
```javascript
// Invoice has partial branch information
invoice = {
  branch: {
    branch_name: "Sharjah Branch",
    address: "Industrial Area, Sharjah"
    // No phone or email
  }
}

// Displays:
// UNIXPARTS TRADING LLC
// Sharjah Branch
// Industrial Area, Sharjah
// +971 4 555 0101 (fallback)
// accounts@company.com (fallback)
// TRN: 100123456789012
```

## Benefits

1. **Multi-Branch Support**: Each invoice shows the correct branch information
2. **Consistent Branding**: Company name remains "UNIXPARTS TRADING LLC" across all invoices
3. **Graceful Fallback**: Uses template defaults when branch data is missing
4. **Professional Appearance**: Clear hierarchy with company name prominent
5. **Flexibility**: Works with or without branch data

## API Requirements

### Invoice API Response
The invoice API should include branch information:
```javascript
GET /api/invoices/{id}

Response:
{
  "id": 1,
  "invoice_number": "INV-001",
  "branch_id": 1,
  "branch": {
    "id": 1,
    "branch_name": "Dubai Main Branch",
    "branch_code": "DXB",
    "address": "Sheikh Zayed Road, Dubai, UAE",
    "phone": "+971 4 555 0101",
    "email": "dubai@unixparts.com"
  },
  // ... other fields
}
```

### Template API Response
```javascript
GET /api/invoice-template

Response:
{
  "company_name": "UNIXPARTS TRADING LLC",
  "company_address": "PO Box 12345, Dubai, UAE",
  "contact_number_1": "+971 4 555 0101",
  "contact_email": "accounts@company.com",
  "trn_number": "100123456789012",
  // ... other settings
}
```

## Styling

### Company Name
```css
font-size: 14px;
font-weight: bold;
color: #000;
```

### Branch Name
```css
font-size: 12px;
font-weight: bold;
color: #000;
```

### Contact Information
```css
font-size: 11px;
color: #333;
```

## Testing Checklist

- ✅ Invoice with full branch data displays correctly
- ✅ Invoice without branch data uses fallback values
- ✅ Invoice with partial branch data combines both sources
- ✅ Company name always shows "UNIXPARTS TRADING LLC"
- ✅ Branch name displays when available
- ✅ Address, phone, email fallback to template settings
- ✅ TRN number always displays
- ✅ Print preview shows correct information
- ✅ Dark mode displays correctly
- ✅ Mobile responsive layout works

## Files Modified

1. `/app/components/PrintableInvoice.js` - Updated company info section
2. `/app/api/invoice-template/route.js` - Already has "UNIXPARTS TRADING LLC"

## Future Enhancements

1. **Branch Logo**: Display branch-specific logo if available
2. **Branch-Specific TRN**: Support different TRN numbers per branch
3. **Multi-Language**: Support Arabic branch names
4. **Branch Hours**: Display operating hours on invoice
5. **Branch Manager**: Show branch manager signature

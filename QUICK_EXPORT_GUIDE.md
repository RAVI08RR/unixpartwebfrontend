# Quick Export Button Implementation Guide

## ✅ What's Been Done

1. **Created Export Utilities** (`app/lib/utils/exportUtils.js`)
   - CSV export function
   - Excel export function  
   - Date, currency, status formatters

2. **Created Export Button Component** (`app/components/ExportButton.js`)
   - Dropdown with CSV and Excel options
   - Loading and error states
   - Toast notifications

3. **Installed Dependencies**
   - `xlsx` library for Excel export

4. **Updated 4 Pages** with working export:
   - Users
   - Suppliers
   - Branch Owners
   - Branches

## 🎯 How It Works

### User Experience:
1. User clicks "Export" button
2. Dropdown appears with 2 options:
   - 📄 Export as CSV
   - 📊 Export as Excel
3. User selects format
4. File downloads automatically
5. Toast notification confirms success

### Features:
- ✅ Exports all filtered/searched data
- ✅ Proper column headers
- ✅ Formatted dates (e.g., "06 May 2026")
- ✅ Formatted currency (e.g., "AED 1,234.56")
- ✅ Formatted status (e.g., "Active" / "Inactive")
- ✅ Handles nested objects (e.g., `user.role.name`)
- ✅ Custom formatters support
- ✅ Filename includes date (e.g., `users-2026-05-06.csv`)

## 📝 Implementation Pattern

### For ANY page with a table:

**1. Import:**
```javascript
import ExportButton from "@/app/components/ExportButton";
import { formatDateForExport, formatStatusForExport, formatCurrencyForExport } from "@/app/lib/utils/exportUtils";
```

**2. Define columns (before return):**
```javascript
const exportColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status', formatter: formatStatusForExport },
  { key: 'created_at', label: 'Created', formatter: formatDateForExport }
];
```

**3. Replace button:**
```javascript
<ExportButton
  data={filteredItems}
  columns={exportColumns}
  filename={`items-${new Date().toISOString().split('T')[0]}`}
  onSuccess={(format) => success(`Exported as ${format}!`)}
  onError={(error) => error(`Export failed: ${error.message}`)}
/>
```

## 🔧 Common Patterns

### Basic Field:
```javascript
{ key: 'name', label: 'Name' }
```

### Nested Field:
```javascript
{ key: 'user.role.name', label: 'Role' }
```

### With Formatter:
```javascript
{ 
  key: 'created_at', 
  label: 'Created Date',
  formatter: formatDateForExport 
}
```

### Custom Formatter:
```javascript
{ 
  key: 'branches', 
  label: 'Branches',
  formatter: (branches) => branches?.map(b => b.name).join(', ') || 'None'
}
```

### Currency:
```javascript
{ 
  key: 'amount', 
  label: 'Amount',
  formatter: (amount) => formatCurrencyForExport(amount, 'AED')
}
```

## 📋 Remaining Pages

Just copy the pattern above to these pages:

**Finance:**
- `/dashboard/finance/fund-transfers/page.js`
- `/dashboard/finance/expenses/page.js`

**Settings:**
- `/dashboard/settings/permissions/page.js`
- `/dashboard/roles/page.js`

**Inventory:**
- `/dashboard/inventory/custom-clearance/page.js`
- `/dashboard/inventory/assets/page.js`
- `/dashboard/inventory/all-inventory/page.js`
- `/dashboard/inventory/purchase-orders/page.js`
- `/dashboard/inventory/stock-items/page.js`

**Sales:**
- `/dashboard/sales/sales-data/page.js`
- `/dashboard/sales/customers/page.js`
- `/dashboard/sales/payments-received/page.js`
- `/dashboard/sales/invoices/page.js`

## 🎨 Example: Complete Implementation

```javascript
"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import ExportButton from "@/app/components/ExportButton";
import { formatDateForExport, formatStatusForExport } from "@/app/lib/utils/exportUtils";
import { useToast } from "@/app/components/Toast";

export default function MyPage() {
  const { success, error } = useToast();
  const [items, setItems] = useState([...]);
  
  // Export configuration
  const exportColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', formatter: formatStatusForExport },
    { key: 'created_at', label: 'Created', formatter: formatDateForExport }
  ];
  
  return (
    <div>
      {/* ... other code ... */}
      
      <ExportButton
        data={items}
        columns={exportColumns}
        filename={`items-${new Date().toISOString().split('T')[0]}`}
        onSuccess={(format) => success(`Exported as ${format}!`)}
        onError={(err) => error(`Export failed: ${err.message}`)}
      />
      
      {/* ... rest of page ... */}
    </div>
  );
}
```

## ✨ That's It!

The export functionality is now standardized and easy to implement across all pages. Just follow the 3-step pattern above!

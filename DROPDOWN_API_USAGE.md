# Dropdown API Usage Summary

## Overview
All dropdown APIs are now properly configured and used across your forms. The dropdown endpoints provide optimized, lightweight data for form select/dropdown fields.

## Available Dropdown APIs

| Endpoint | Description | Service Method |
|----------|-------------|----------------|
| `GET /api/dropdown/users` | Get users dropdown | `userService.getDropdown()` |
| `GET /api/dropdown/customers` | Get customers dropdown | `customerService.getDropdown()` |
| `GET /api/dropdown/suppliers` | Get suppliers dropdown | `supplierService.getDropdown()` |
| `GET /api/dropdown/branches` | Get branches dropdown | `branchService.getDropdown()` |
| `GET /api/dropdown/stock-items` | Get stock items dropdown | `stockItemService.getDropdown()` |
| `GET /api/dropdown/containers` | Get containers dropdown | `containerService.getDropdown()` |
| `GET /api/dropdown/po-items` | Get PO items dropdown | `poItemService.getDropdown()` |

## How to Use in Forms

### Using Hooks (Recommended)
All hooks support dropdown mode via the `isDropdown` parameter:

```javascript
// Branches dropdown
const { branches } = useBranches(0, 100, true);

// Suppliers dropdown
const { suppliers } = useSuppliers(0, 100, null, true);

// Stock Items dropdown
const { stockItems } = useStockItems(0, 100, null, true);

// Containers dropdown
const { containers } = useContainers(0, 100, null, null, null, true);

// Customers dropdown
const { customers } = useCustomers(0, 100, null, true);
```

### Direct Service Call
```javascript
import { branchService } from '@/app/lib/services/branchService';

const branches = await branchService.getDropdown();
```

## Updated Form Pages

### ✅ Purchase Orders
- **Add Page**: `app/dashboard/inventory/purchase-orders/add/page.js`
  - Uses: `useContainers()`, `useBranches()`, `useStockItems()`
  
- **Edit Page**: `app/dashboard/inventory/purchase-orders/edit/[id]/page.js`
  - Uses: `useContainers()`

- **Items Add**: `app/dashboard/inventory/purchase-orders/items/add/[id]/page.js`
  - Uses: `useBranches()`, `useStockItems()`

- **Items Edit**: `app/dashboard/inventory/purchase-orders/items/edit/[id]/page.js`
  - Uses: `useBranches()`, `useStockItems()`

- **Items View**: `app/dashboard/inventory/purchase-orders/items/[id]/page.js`
  - Uses: `useBranches()`

### ✅ Custom Clearance
- **Add Page**: `app/dashboard/inventory/custom-clearance/add/page.js`
  - Uses: `useSuppliers()`, `useBranches()`, `useStockItems()`

- **Edit Page**: `app/dashboard/inventory/custom-clearance/edit/[id/]/page.js`
  - Uses: `useSuppliers()`, `useBranches()`

- **View Page**: `app/dashboard/inventory/custom-clearance/view/[id/]/page.js`
  - Uses: `useSuppliers()`, `useBranches()`

- **List Page**: `app/dashboard/inventory/custom-clearance/page.js`
  - Uses: `useSuppliers()`, `useBranches()`

### ✅ Users
- **Add Page**: `app/dashboard/users/add/page.js`
  - Uses: `branchService.getDropdown()`, `supplierService.getDropdown()` (direct calls)

## Implementation Details

### Proxy Route
All dropdown requests go through: `app/api/dropdown/[...slug]/route.js`

This proxy:
- Forwards requests to backend API
- Adds authentication headers
- Handles CORS
- Provides error handling

### Service Layer
Each service has a `getDropdown()` method:

```javascript
// Example from branchService.js
getDropdown: async () => {
  try {
    return await fetchApi('/api/dropdown/branches');
  } catch (error) {
    console.error("🏢 Branches Dropdown API failed:", error.message);
    throw error;
  }
}
```

### Hook Layer
Hooks support dropdown mode:

```javascript
// Example from useBranches.js
export function useBranches(skip = 0, limit = 100, isDropdown = false) {
  // ...
  const data = isDropdown 
    ? await branchService.getDropdown()
    : await branchService.getAll(skip, limit);
  // ...
}
```

## Testing Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to any form page (e.g., Add Purchase Order)

3. Open browser DevTools → Network tab

4. Look for requests to `/api/dropdown/*`

5. Verify the dropdown data loads correctly in the form fields

## Benefits of Dropdown APIs

✅ **Performance**: Returns only essential fields (id, name, code)
✅ **Reduced Payload**: Smaller response size compared to full entity data
✅ **Optimized**: Designed specifically for form dropdowns
✅ **Consistent**: Same pattern across all entities
✅ **Cached**: Can be cached for better performance

## Next Steps

- Test each form locally to ensure dropdowns populate correctly
- Check browser console for any API errors
- Verify backend `/api/dropdown/*` endpoints are working
- Monitor network requests to ensure dropdown APIs are being called

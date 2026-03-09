# Dropdown Format Update - Fund Transfers

## Changes Made

Updated the fund transfer add and edit pages to properly handle the dropdown API response format.

## API Response Format

### Branches Dropdown
```json
[
  {
    "id": 1,
    "label": "Dubai Main"
  },
  {
    "id": 2,
    "label": "Abu Dhabi"
  },
  {
    "id": 3,
    "label": "Sharjah"
  }
]
```

### Suppliers Dropdown
Expected to follow the same format:
```json
[
  {
    "id": 1,
    "label": "Global Parts Inc."
  }
]
```

## Updated Code

### Branch Dropdown (Add & Edit Pages)
```jsx
<select name="branch_id" value={formData.branch_id} onChange={handleChange}>
  <option value="">Select Branch (Optional)</option>
  {branches.map((branch) => (
    <option key={branch.id} value={branch.id}>
      {branch.label || branch.branch_name || branch.name || 'Unnamed Branch'}
    </option>
  ))}
</select>
```

### Supplier Dropdown (Add & Edit Pages)
```jsx
<select name="supplier_id" value={formData.supplier_id} onChange={handleChange}>
  <option value="">Select Supplier (Optional)</option>
  {suppliers.map((supplier) => (
    <option key={supplier.id} value={supplier.id}>
      {supplier.label || supplier.name || supplier.supplier_name || 'Unnamed Supplier'}
    </option>
  ))}
</select>
```

## Fallback Logic

The code now checks for multiple field names in order of preference:
1. `label` (from dropdown API)
2. `branch_name` / `name` (from full list API)
3. `supplier_name` (from full list API)
4. Fallback to 'Unnamed'

This ensures compatibility with both:
- Dedicated dropdown endpoints (`/api/dropdown/branches`, `/api/dropdown/suppliers`)
- Full list endpoints (`/api/branches`, `/api/suppliers`) used as fallback

## Service Layer Updates

Both `branchService.js` and `supplierService.js` have enhanced error handling:
- Try dropdown endpoint first
- If it fails, fallback to full list endpoint
- If both fail, return empty array
- Console logging for debugging

## Testing

✅ Dropdowns now work with the backend API format
✅ Fallback logic ensures data loads even if dropdown endpoint fails
✅ No errors in console
✅ Form submission works correctly

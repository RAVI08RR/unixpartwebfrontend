# Sales Data Filter Debugging - Enhanced Logging

## Debug Logging Added

Added comprehensive console logging to help diagnose filter issues, especially with customer filtering.

## What Gets Logged

### 1. **Dropdown Data Loading**
When dropdown APIs are fetched, you'll see:
```
📦 Dropdown Data Loaded:
  - Customers: [{id: 1, label: "John Doe"}, {id: 2, label: "Ahmed Al Mansouri"}, ...]
  - Users: [...]
  - Suppliers: [...]
  - Stock Items: [...]
  - Containers: [...]
```

### 2. **Sales Data Loading**
When sales data is fetched, you'll see:
```
📊 Sales Data Loaded:
  - Total items: 17
  - Unique customer IDs: [1, 2, 3]
  - Unique customer names: ["John Doe", "Ahmed Al Mansouri", "Sarah Johnson"]
  - Sample item: {id: 23, invoice: {...}, po_item: {...}}
```

### 3. **Filter Application**
When filters are applied, you'll see:
```
🔍 Applying filters: {user: "All", supplier: "All", customerName: "2", ...}
📊 Total sales data: 17
```

### 4. **Customer Filter Debug (when customer filter is active)**
For each item being filtered:
```
🔍 Customer Filter Debug: {
  filterValue: "2",
  filterValueType: "string",
  itemCustomerId: 2,
  itemCustomerName: "Ahmed Al Mansouri",
  matches: true
}
```

### 5. **Filter Results**
After filtering:
```
✅ Filtered results: 5
📋 Sample filtered items: [{...}, {...}]
```

## How to Use Debug Logs

### Step 1: Open Browser Console
1. Open the sales data page
2. Press F12 or right-click → Inspect
3. Go to Console tab

### Step 2: Check Data Loading
Look for these logs when page loads:
- `📦 Dropdown Data Loaded` - Shows all dropdown options
- `📊 Sales Data Loaded` - Shows sales data and customer IDs

### Step 3: Test Customer Filter
1. Select a customer from the dropdown
2. Watch the console for:
   - `🔍 Applying filters` - Shows current filter values
   - `🔍 Customer Filter Debug` - Shows matching logic for each item
   - `✅ Filtered results` - Shows how many items matched

### Step 4: Diagnose Issues

#### Issue: No results when filtering by customer
**Check:**
- Are customer IDs in dropdown matching customer IDs in sales data?
- Is the filter value being passed correctly?
- Are items matching the filter logic?

**Example Debug Output:**
```
🔍 Customer Filter Debug: {
  filterValue: "5",           // ← Customer ID from dropdown
  filterValueType: "string",
  itemCustomerId: 2,          // ← Customer ID in sales item
  itemCustomerName: "Ahmed Al Mansouri",
  matches: false              // ← No match because 5 !== 2
}
```

#### Issue: Dropdown shows different customers than sales data
**Check:**
- Compare `Unique customer IDs` from sales data
- With customer IDs from `Dropdown Data Loaded`
- They should overlap

## Common Issues and Solutions

### Issue 1: Customer IDs Don't Match
**Symptom:** Dropdown shows customers but filtering returns no results

**Debug Output:**
```
📦 Dropdown Data Loaded:
  - Customers: [{id: 10, label: "John Doe"}, {id: 11, label: "Ahmed"}]
  
📊 Sales Data Loaded:
  - Unique customer IDs: [1, 2, 3]  // ← Different IDs!
```

**Solution:** The dropdown API and sales data API are returning different customer IDs. Need to check backend data consistency.

### Issue 2: Filter Value Type Mismatch
**Symptom:** Filter value is string but comparison expects number

**Debug Output:**
```
🔍 Customer Filter Debug: {
  filterValue: "2",           // ← String
  filterValueType: "string",
  itemCustomerId: 2,          // ← Number
  matches: true               // ← Works because we use parseInt()
}
```

**Solution:** Already handled with `parseInt(filters.customerName)` in the code.

### Issue 3: Missing Customer Data
**Symptom:** Some sales items don't have customer information

**Debug Output:**
```
🔍 Customer Filter Debug: {
  filterValue: "2",
  filterValueType: "string",
  itemCustomerId: undefined,  // ← No customer ID!
  itemCustomerName: undefined,
  matches: false
}
```

**Solution:** Sales items without customer data will be filtered out when customer filter is active.

## Code Changes Made

### 1. Enhanced fetchData()
```javascript
const fetchData = async () => {
  setLoading(true);
  try {
    const data = await invoiceService.getSalesData(0, 500);
    setSalesData(Array.isArray(data) ? data : []);
    
    // Debug logging
    if (Array.isArray(data) && data.length > 0) {
      const customerIds = [...new Set(data.map(item => item.invoice?.customer?.id).filter(Boolean))];
      const customerNames = [...new Set(data.map(item => item.invoice?.customer?.full_name).filter(Boolean))];
      console.log("📊 Sales Data Loaded:");
      console.log("  - Total items:", data.length);
      console.log("  - Unique customer IDs:", customerIds);
      console.log("  - Unique customer names:", customerNames);
      console.log("  - Sample item:", data[0]);
    }
  } catch (error) {
    console.error("Error fetching sales data:", error);
  } finally {
    setLoading(false);
  }
};
```

### 2. Enhanced fetchDropdownData()
```javascript
const fetchDropdownData = async () => {
  try {
    const [customersData, usersData, suppliersData, stockItemsData, containersData] = await Promise.all([
      apiClient.get('/api/dropdown/customers').catch(() => []),
      apiClient.get('/api/dropdown/users').catch(() => []),
      apiClient.get('/api/dropdown/suppliers').catch(() => []),
      apiClient.get('/api/dropdown/stock-items').catch(() => []),
      apiClient.get('/api/dropdown/containers').catch(() => [])
    ]);
    
    console.log("📦 Dropdown Data Loaded:");
    console.log("  - Customers:", customersData);
    console.log("  - Users:", usersData);
    console.log("  - Suppliers:", suppliersData);
    console.log("  - Stock Items:", stockItemsData);
    console.log("  - Containers:", containersData);
    
    setCustomers(Array.isArray(customersData) ? customersData : []);
    setUsers(Array.isArray(usersData) ? usersData : []);
    setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    setStockItems(Array.isArray(stockItemsData) ? stockItemsData : []);
    setContainers(Array.isArray(containersData) ? containersData : []);
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
  }
};
```

### 3. Enhanced Filter Logic
```javascript
const filteredData = useMemo(() => {
  console.log("🔍 Applying filters:", filters);
  console.log("📊 Total sales data:", salesData.length);
  
  const filtered = salesData.filter(item => {
    // Debug customer matching
    if (filters.customerName !== "All") {
      console.log("🔍 Customer Filter Debug:", {
        filterValue: filters.customerName,
        filterValueType: typeof filters.customerName,
        itemCustomerId: item.invoice?.customer?.id,
        itemCustomerName: item.invoice?.customer?.full_name,
        matches: item.invoice?.customer?.id === parseInt(filters.customerName)
      });
    }
    
    // ... rest of filter logic
  });
  
  console.log("✅ Filtered results:", filtered.length);
  console.log("📋 Sample filtered items:", filtered.slice(0, 2));
  return filtered;
}, [salesData, filters]);
```

## Next Steps

1. **Open the page** and check browser console
2. **Look for the debug logs** when page loads
3. **Select a customer filter** and watch the console
4. **Share the console output** if issues persist

The debug logs will show exactly what's happening with the data and filtering logic.

## Files Modified

- `app/dashboard/sales/sales-data/page.js` - Added comprehensive debug logging

## Status: ✅ DEBUG LOGGING ADDED

Enhanced logging is now in place to help diagnose filter issues. Check the browser console for detailed information about data loading and filter matching.

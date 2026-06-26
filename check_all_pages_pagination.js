const fs = require('fs');
const path = require('path');

const files = [
  'app/dashboard/inventory/purchase-orders/page.js',
  'app/dashboard/inventory/custom-clearance/page.js',
  'app/dashboard/inventory/suppliers/page.js',
  'app/dashboard/inventory/assets/page.js',
  'app/dashboard/inventory/stock-items/page.js',
  'app/dashboard/inventory/all-inventory/page.js',
  'app/dashboard/sales/customers/page.js',
  'app/dashboard/sales/invoices/page.js',
  'app/dashboard/sales/payments-received/page.js',
  'app/dashboard/users/page.js',
  'app/dashboard/administration/branches/page.js',
  'app/dashboard/settings/permissions/page.js'
];

console.log('--- PAGINATION CHECK REPORT ---');
files.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[NOT FOUND] ${relPath}`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');

  // Check import
  const hasImport = content.includes('import Pagination from');
  
  // Check hook calls
  const hookCalls = [];
  const hookRe = /(usePurchaseOrders|useContainers|useSuppliers|useBranches|useAssets|useCustomers|useInvoices|useUsers|useRoles|usePermission|useExpenses)\s*\(([^)]*)\)/g;
  let match;
  while ((match = hookRe.exec(content)) !== null) {
    hookCalls.push(`${match[1]}(${match[2].trim()})`);
  }

  // Check JSX use
  const hasJSX = content.includes('<Pagination');

  // Check local slice pattern
  const slicePattern = /\.slice\s*\(/;
  const hasSlice = slicePattern.test(content);

  // Check PAGE_SIZE declaration
  const hasPageSize = content.includes('PAGE_SIZE') || content.includes('pageSize');

  console.log(`\nFile: ${relPath}`);
  console.log(`  Imported Pagination? : ${hasImport}`);
  console.log(`  Has <Pagination />?  : ${hasJSX}`);
  console.log(`  Has .slice()?        : ${hasSlice}`);
  console.log(`  Declares page size?  : ${hasPageSize}`);
  console.log(`  Hook calls found     : ${hookCalls.join(', ') || 'None'}`);
});

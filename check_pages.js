// Script to replace old pagination footers with the Pagination component
// across all remaining dashboard pages

const fs = require('fs');
const path = require('path');

// Old footer pattern (with variations in indentation)
const OLD_FOOTER_PATTERNS = [
  // Pattern 1: Pagination Footer div
  {
    pattern: /\{\/\* Pagination Footer \*\/\}\s*\n\s*<div[^>]*bg-gray-50\/50[^>]*>[\s\S]*?<\/div>\s*\n\s*\{\/\* /,
    name: 'full footer with next comment'
  }
];

const PAGES = [
  'app/dashboard/sales/customers/page.js',
  'app/dashboard/inventory/assets/page.js',
  'app/dashboard/inventory/custom-clearance/page.js',
  'app/dashboard/administration/branches/page.js',
  'app/dashboard/sales/invoices/page.js',
  'app/dashboard/sales/payments-received/page.js',
  'app/dashboard/sales/sales-data/page.js',
  'app/dashboard/settings/permissions/page.js',
  'app/dashboard/inventory/stock-items/page.js',
];

PAGES.forEach(p => {
  const fullPath = path.join(process.cwd(), p);
  if (!fs.existsSync(fullPath)) { console.log('MISSING:', p); return; }
  let content = fs.readFileSync(fullPath, 'utf8');
  const hasFooter = content.includes('{/* Pagination Footer */}');
  const hasPagination = content.includes('<Pagination');
  console.log(p, '| hasOldFooter:', hasFooter, '| alreadyUpdated:', hasPagination);
});

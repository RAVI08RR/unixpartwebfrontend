/**
 * Replaces old client-side pagination footers with the reusable <Pagination> component
 * across all dashboard listing pages.
 */

const fs = require('fs');
const path = require('path');

const PAGES_WITH_PAGE_SIZE = {
  'app/dashboard/sales/customers/page.js': 'PAGE_SIZE',
  'app/dashboard/inventory/assets/page.js': 'PAGE_SIZE',
  'app/dashboard/inventory/custom-clearance/page.js': 'PAGE_SIZE',
  'app/dashboard/administration/branches/page.js': 'PAGE_SIZE',
  'app/dashboard/sales/invoices/page.js': 'PAGE_SIZE',
  'app/dashboard/sales/payments-received/page.js': 'PAGE_SIZE',
  'app/dashboard/settings/permissions/page.js': 'PAGE_SIZE',
};

// Regex to match the old pagination footer block
// Matches from {/* Pagination Footer */} through the closing </div> of the outer div
const OLD_FOOTER_RE = /\{\/\* Pagination Footer \*\/\}[\s\S]*?<\/div>\s*(?=\n\s*\n|\n\s*\{\/\*)/;

// New Pagination component JSX (with flexible indentation)
const newFooter = (indent) => `{/* Pagination Footer */}
${indent}<Pagination
${indent}  currentPage={currentPage}
${indent}  totalPages={totalPages}
${indent}  total={total}
${indent}  pageSize={PAGE_SIZE}
${indent}  onPageChange={setCurrentPage}
${indent}/>`;

for (const [relPath, pageSizeVar] of Object.entries(PAGES_WITH_PAGE_SIZE)) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    console.log('MISSING:', relPath);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  if (!content.includes('{/* Pagination Footer */}')) {
    console.log('SKIPPING (no old footer):', relPath);
    continue;
  }

  if (content.includes('<Pagination')) {
    console.log('SKIPPING (already updated):', relPath);
    continue;
  }

  // Find the Pagination Footer block start
  const footerStart = content.indexOf('{/* Pagination Footer */}');
  if (footerStart === -1) continue;

  // Determine indentation from the line containing the footer
  const lineStart = content.lastIndexOf('\n', footerStart) + 1;
  const indent = content.slice(lineStart, footerStart);

  // Find the closing </div> of the outer div that wraps the footer
  // The footer div has class starting with px-8 py-6 bg-gray-50
  // Count opening/closing divs from the footer start
  let depth = 0;
  let i = footerStart;
  let footerEnd = -1;

  while (i < content.length) {
    if (content.startsWith('<div', i)) {
      depth++;
      i += 4;
    } else if (content.startsWith('</div>', i)) {
      depth--;
      if (depth === 0) {
        footerEnd = i + 6; // end of </div>
        break;
      }
      i += 6;
    } else {
      i++;
    }
  }

  if (footerEnd === -1) {
    console.log('ERROR: Could not find closing div for footer in:', relPath);
    continue;
  }

  const oldBlock = content.slice(footerStart, footerEnd);
  const newBlock = newFooter(indent);

  content = content.slice(0, footerStart) + newBlock + content.slice(footerEnd);

  // Also add Pagination import if missing
  if (!content.includes("import Pagination from")) {
    content = content.replace(
      /^(import ProtectedRoute from .*|import \{ PERMISSIONS \} from .*|import \{ usePermission \} from .*)\n/m,
      (match) => match + "import Pagination from \"@/app/components/Pagination\";\n"
    );
    // fallback: add after last import block
    if (!content.includes("import Pagination from")) {
      content = content.replace(
        /(import [^\n]+\n)(\nexport default)/,
        '$1import Pagination from "@/app/components/Pagination";\n$2'
      );
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('UPDATED:', relPath);
}

console.log('\nDone.');

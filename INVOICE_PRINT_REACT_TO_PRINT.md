# Invoice Print Feature - React-to-Print Implementation

## Overview
Implemented professional PDF invoice printing using `react-to-print` library for reliable PDF generation.

## Installation

```bash
npm install react-to-print
```

**Version**: react-to-print@3.3.0

## Implementation

### 1. PrintableInvoice Component
**File**: `app/components/PrintableInvoice.js`

- Created as a `React.forwardRef` component to work with react-to-print
- Uses inline styles for reliable PDF generation
- All styles defined with style objects (no Tailwind classes)
- Professional invoice layout matching sample PDF
- Yellow highlights (#FFEB3B) for shipping route and notes sections
- Black borders (2px) for tables and sections
- A4 page size (210mm x 297mm)
- Arial font family

**Key Features**:
- Invoice header with company info
- Customer details (UAE Branch Name)
- Vessel and voyage information
- Yellow highlighted shipping route
- Items table with borders
- Total amount section
- Container information
- Notes section with yellow highlight

### 2. Invoice View Page
**File**: `app/dashboard/sales/invoices/view/[id]/page.js`

**Changes**:
- Imported `useReactToPrint` from 'react-to-print'
- Created `printRef` using `useRef(null)`
- Configured `handlePrint` with `contentRef: printRef`
- Print button triggers `handlePrint` function
- Hidden PrintableInvoice component with `display: 'none'`
- Ref passed to PrintableInvoice component

**Code**:
```javascript
const printRef = useRef(null);

const handlePrint = useReactToPrint({
  contentRef: printRef,
});

// Print button
<button onClick={handlePrint}>
  <Printer /> Print
</button>

// Hidden printable component
<div style={{ display: 'none' }}>
  <PrintableInvoice ref={printRef} invoice={invoice} customer={customer} />
</div>
```

### 3. Print Styles
**File**: `app/globals.css`

```css
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  
  body {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
  
  .no-print {
    display: none !important;
  }
  
  * {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
}
```

## How It Works

1. **Component Structure**:
   - PrintableInvoice is hidden on screen with `display: 'none'`
   - Component receives ref via `React.forwardRef`
   - All content uses inline styles for print reliability

2. **Print Process**:
   - User clicks "Print" button
   - `handlePrint` function is called
   - react-to-print opens browser print dialog
   - Only the PrintableInvoice component is shown in print preview
   - User can save as PDF or print directly

3. **Style Handling**:
   - Inline styles ensure consistent rendering
   - `print-color-adjust: exact` preserves yellow backgrounds
   - A4 page size enforced with `@page` rule
   - No conflicting CSS from main page

## Invoice Layout

```
┌─────────────────────────────────────────────────────────┐
│ INVOICE (HEADER/TITLE)    SUPPLIER FULL COMPANY NAME   │
│ INVOICE#                   SUPPLIER ADDRESS             │
│ DATE                       SUPPLIER CONTACT             │
├─────────────────────────────────────────────────────────┤
│ CUSTOMER NAME              VESSEL NAME                  │
│ (UAE BRANCH NAME)          VOYAGE NUMBER                │
│ UAE BRANCH ADDRESS                                      │
│ UAE BRANCH CONTACT                                      │
│                                                         │
│ NOTIFYING PARTY (SAME AS CUSTOMER NAME)                │
├─────────────────────────────────────────────────────────┤
│ [YELLOW] SHIPPED FROM (SUPPLIER PORT) → TO (UAE PORT)  │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────┐  │
│ │ S.NO │ ITEM │ QTY │ UNIT PRICE │ AMOUNT          │  │
│ ├───────────────────────────────────────────────────┤  │
│ │  1   │ ... │  1  │  AED XXX   │ AED XXX         │  │
│ │  2   │ ... │  1  │  AED XXX   │ AED XXX         │  │
│ └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    ┌──────────────────────────────┐    │
│                    │ TOTAL AMOUNT │ USD ######   │    │
│                    └──────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│ 1x40FT HC                                               │
│ CONTAINER NO: (STANDARD CONTAINER NUMBER)               │
├─────────────────────────────────────────────────────────┤
│ [YELLOW] NOTES:                                         │
│ Invoice notes text...                                   │
└─────────────────────────────────────────────────────────┘
```

## Advantages of react-to-print

1. **Reliable**: Specifically designed for printing React components
2. **No Blank Pages**: Properly handles component rendering
3. **Color Preservation**: Backgrounds and colors print correctly
4. **Browser Compatible**: Works across all modern browsers
5. **Simple API**: Easy to implement and maintain
6. **No CSS Conflicts**: Isolated print rendering

## Testing

✅ Component renders correctly
✅ Print dialog opens with content
✅ Yellow backgrounds preserved
✅ Borders and spacing correct
✅ Professional layout matches sample
✅ No blank pages
✅ Save as PDF works

## Usage

1. Navigate to invoice view: `/dashboard/sales/invoices/view/[id]`
2. Click "Print" button
3. Browser print dialog opens with invoice
4. Choose "Save as PDF" or print directly
5. PDF generated with professional layout

## Customization

To customize company information, edit `PrintableInvoice.js`:

```javascript
<h2>UNIXPARTS TRADING LLC</h2>
<p>P.O. Box 12345, Dubai, UAE</p>
<p>Phone: +971 XX XXX XXXX</p>
<p>Email: info@unixparts.com</p>
```

## Troubleshooting

**Issue**: Blank PDF generated
**Solution**: Ensure ref is passed correctly and component uses inline styles

**Issue**: Colors not printing
**Solution**: Verify `print-color-adjust: exact` is set in print styles

**Issue**: Layout broken
**Solution**: Use inline styles instead of CSS classes for print components

## Files Modified

1. `app/components/PrintableInvoice.js` - Created with forwardRef
2. `app/dashboard/sales/invoices/view/[id]/page.js` - Added react-to-print
3. `app/globals.css` - Updated print styles
4. `package.json` - Added react-to-print dependency

## Status: ✅ COMPLETE

The invoice print feature is fully implemented with react-to-print and ready for production use.

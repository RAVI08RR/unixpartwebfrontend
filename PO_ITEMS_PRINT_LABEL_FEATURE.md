# Purchase Order Items - Print Label Feature

## Overview
Added a comprehensive print label feature to the Purchase Order Items page that allows users to select items and generate customizable QR code labels for printing.

## Features Implemented

### 1. Item Selection
- **Checkbox Column**: Added a checkbox column to the items table
- **Select All**: Header checkbox to select/deselect all items on the current page
- **Individual Selection**: Each row has a checkbox for individual item selection
- **Visual Feedback**: Selected rows are highlighted with a blue background

### 2. Print Labels Button
- **Dynamic Button**: Appears only when items are selected
- **Item Count**: Shows the number of selected items in the button text
- **Location**: Positioned in the header next to the Export and Add Item buttons

### 3. Label Size Configuration Modal
- **Custom Dimensions**: Users can set label width and height in inches
- **Default Size**: 2.25" x 1.25" (standard label size)
- **Remember Size**: Option to save label dimensions to localStorage for future use
- **Step Increment**: 0.25" increments for precise sizing

### 4. Label Preview & Customization Modal
- **All Selected Items Grid**: Shows cards for all selected items with QR codes (3-column grid)
- **Item Cards**: Each card displays:
  - QR code preview (60px)
  - Item number badge
  - Stock number
  - Item name
  - Branch code
- **First Label Preview**: Shows a scaled preview of how the first label will print
- **Live QR Code**: Actual scannable QR code in the preview
- **Style Customization**: Adjust font size, bold, and underline for each field:
  - Branch Code
  - Supplier Code
  - Container Number
  - Stock Number (default: 14px, bold)
  - Item Name
  - PO Description
- **QR Code Size**: Adjustable QR code dimensions
- **Reset to Defaults**: Button to restore printer default settings
- **Responsive Layout**: Two-column layout with preview on left, customization on right
- **Scrollable**: Selected items grid and customization panel are scrollable for many items

### 5. QR Code Generation
- **Automatic Generation**: QR codes are generated for each selected item
- **Data Encoded**: Each QR code contains:
  - Stock Number
  - Purchase Order ID
  - Item ID
  - Branch Code
- **High Quality**: Uses error correction level 'H' for maximum reliability
- **Scannable**: QR codes can be scanned to quickly identify items

### 6. Print Functionality
- **React-to-Print**: Uses `react-to-print` library for browser-native printing
- **Custom Page Size**: Print dialog respects the configured label dimensions
- **Multiple Labels**: Prints all selected items with page breaks between labels
- **Document Title**: Auto-generated filename: `PO-{id}-Labels-{date}`
- **Post-Print Cleanup**: Automatically clears selection and closes modal after printing

## Technical Implementation

### New Dependencies
- `qrcode.react`: QR code generation library

### New Components
- **PrintableLabel.js**: Reusable forwardRef component for rendering printable labels with QR codes

### API Updates
- Uses `react-to-print` v3.x API with `contentRef` instead of deprecated `content` prop
- PrintableLabel component properly implements React.forwardRef for ref forwarding

### State Management
- `selectedItems`: Array of selected item IDs
- `printLabelModalOpen`: Controls label size configuration modal
- `labelPreviewOpen`: Controls preview and customization modal
- `labelSize`: Stores label dimensions (width, height)
- `labelStyles`: Stores customization settings for all fields
- `rememberSize`: Boolean for localStorage persistence

### Key Functions
- `handleSelectItem(itemId)`: Toggle individual item selection
- `handleSelectAll()`: Select/deselect all items on current page
- `handlePrintLabels()`: Opens label size configuration modal
- `handlePreviewLabel()`: Saves size and opens preview modal
- `handlePrint()`: Triggers browser print dialog
- `getPrintData()`: Transforms selected items into printable format

## User Workflow

1. **Navigate** to Purchase Order Items page (`/dashboard/inventory/purchase-orders/items/{id}`)
2. **Select Items** using checkboxes (individual or select all)
3. **Click** "PRINT LABELS (X)" button in the header
4. **Configure** label dimensions in the modal
5. **Review All Items** - See cards with QR code previews for all selected items
6. **Preview First Label** - See how the first label will look when printed
7. **Customize Styles** - Adjust font sizes, bold, underline, and QR code size
8. **Print** by clicking "Confirm Print"
9. **Browser** print dialog opens with configured page size
10. **Complete** printing and selection is automatically cleared

## Label Content

Each label includes:
- Branch Code (if available)
- Supplier Code (from PO)
- Container Number (from PO)
- Stock Number (prominent, bold by default)
- Item Name (from stock items)
- PO Description
- QR Code (right side, scannable)

## Styling Features

### Customizable Properties
- **Font Size**: Adjustable from 6px to 24px
- **Bold**: Toggle bold text
- **Underline**: Toggle underlined text
- **QR Size**: Adjustable from 30px to 100px

### Default Styles
- Branch: 10px, normal
- Supplier: 10px, normal
- Container: 10px, normal
- Stock Number: 14px, **bold**
- Item: 10px, normal
- PO Description: 10px, normal
- QR Code: 50px

## Browser Compatibility
- Works with all modern browsers that support CSS `@page` rules
- Print preview shows exact label dimensions
- Page breaks ensure one label per page

## Future Enhancements
- Bulk print all items in PO
- Save custom style presets
- Export labels as PDF
- Barcode support in addition to QR codes
- Multi-label per page layouts (e.g., 2x4 grid)

## Files Modified
1. `/app/dashboard/inventory/purchase-orders/items/[id]/page.js` - Main page with selection and print logic
2. `/app/components/PrintableLabel.js` - New printable label component
3. `/package.json` - Added `qrcode.react` dependency

## Testing Checklist
- ✅ Select individual items
- ✅ Select all items
- ✅ Deselect items
- ✅ Print button appears/disappears based on selection
- ✅ Label size configuration saves to localStorage
- ✅ Preview shows accurate label representation
- ✅ Style customization updates preview in real-time
- ✅ QR codes are generated correctly
- ✅ Print dialog opens with correct page size
- ✅ Multiple labels print with page breaks
- ✅ Selection clears after successful print

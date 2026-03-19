# Asset Sale Feature - Visual Guide 🎨

## Quick Reference for Asset Sale Functionality

---

## 📍 Where to Find the Features

### 1. Assets List Page (`/dashboard/inventory/assets`)

**Action Menu** (Three dots on each asset row):
```
┌─────────────────────────┐
│ 👁️  View Details        │
│ 📄 Documents            │
│ 🛒 Sell Asset          │  ← NEW (if not sold)
│ 📈 View Sale Details   │  ← NEW (if sold)
│ ✏️  Edit Asset          │
│ ─────────────────────   │
│ 🗑️  Delete Asset        │
└─────────────────────────┘
```

### 2. Asset Detail Page (`/dashboard/inventory/assets/[id]`)

**Header Buttons**:
```
For Active Assets:
┌──────────────┬──────────┬──────┬────────┐
│ 🛒 Sell Asset│ ↔️ Transfer│ ✏️ Edit│ 🗑️ Delete│
└──────────────┴──────────┴──────┴────────┘

For Sold Assets:
┌────────────────────┬──────┬────────┐
│ 📈 View Sale Details│ ✏️ Edit│ 🗑️ Delete│
└────────────────────┴──────┴────────┘
```

---

## 🎯 Sell Asset Modal

### Visual Layout:

```
╔═══════════════════════════════════════════╗
║  📈 Sell Asset                        ✕   ║
║  AST-001 - Toyota Forklift                ║
╠═══════════════════════════════════════════╣
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ 💰 Purchase Price: AED 50,000.00    │ ║
║  │ 💵 Current Value:  AED 45,000.00    │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  Sale Price (AED) *    │  Sale Date *    ║
║  ┌──────────────────┐  │  ┌────────────┐ ║
║  │ 💲 55000.00      │  │  │ 📅 2024-... │ ║
║  └──────────────────┘  │  └────────────┘ ║
║                                           ║
║  Buyer Name *          │  Buyer Contact  ║
║  ┌──────────────────┐  │  ┌────────────┐ ║
║  │ 👤 John Doe      │  │  │ +971...    │ ║
║  └──────────────────┘  │  └────────────┘ ║
║                                           ║
║  Payment Method *                         ║
║  ┌──────┬──────────┬────────┬───────┐   ║
║  │ CASH │ TRANSFER │ CHEQUE │ OTHER │   ║
║  └──────┴──────────┴────────┴───────┘   ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ ✅ PROFIT                            │ ║
║  │ +AED 5,000.00                        │ ║
║  │ Margin: +10.00%                      │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  Notes (Optional)                         ║
║  ┌─────────────────────────────────────┐ ║
║  │ 📝 Sold to regular customer...      │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  ┌──────────┐  ┌────────────────────┐   ║
║  │  Cancel  │  │  Confirm Sale  ✓   │   ║
║  └──────────┘  └────────────────────┘   ║
╚═══════════════════════════════════════════╝
```

### Color Indicators:

**Profit (Green)**:
```
┌─────────────────────────────────────┐
│ ✅ PROFIT                            │
│ +AED 5,000.00                        │  ← Green text
│ Margin: +10.00%                      │  ← Green background
└─────────────────────────────────────┘
```

**Loss (Red)**:
```
┌─────────────────────────────────────┐
│ ⚠️ LOSS                              │
│ -AED 2,000.00                        │  ← Red text
│ Margin: -4.00%                       │  ← Red background
└─────────────────────────────────────┘
```

---

## 📊 Sale Details Modal

### Visual Layout:

```
╔═══════════════════════════════════════════╗
║  📈 Sale Details                      ✕   ║
║  AST-001 - Toyota Forklift                ║
╠═══════════════════════════════════════════╣
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ PROFIT/LOSS SUMMARY                 │ ║
║  │                                     │ ║
║  │ Purchase Price │ Sale Price │ Profit│ ║
║  │ AED 50,000.00  │ AED 55,000 │+5,000│ ║
║  │                │            │+10%  │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  ┌──────────────┐  ┌──────────────────┐ ║
║  │ 📅 Sale Date │  │ 💳 Payment Method│ ║
║  │ Jan 15, 2024 │  │ BANK TRANSFER    │ ║
║  └──────────────┘  └──────────────────┘ ║
║                                           ║
║  ┌──────────────┐  ┌──────────────────┐ ║
║  │ 👤 Buyer     │  │ 📞 Contact       │ ║
║  │ John Doe     │  │ +971-50-123-4567 │ ║
║  └──────────────┘  └──────────────────┘ ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ 📦 ASSET INFORMATION                │ ║
║  │ ID: AST-001  │ Category: Vehicle   │ ║
║  │ Purchase: ... │ Status: SOLD       │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ 📝 SALE NOTES                       │ ║
║  │ Sold to regular customer at market  │ ║
║  │ price. Payment received in full.    │ ║
║  └─────────────────────────────────────┘ ║
║                                           ║
║  Sale recorded: Jan 15, 2024 10:30 AM    ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │           Close                     │ ║
║  └─────────────────────────────────────┘ ║
╚═══════════════════════════════════════════╝
```

---

## 🎨 Color Scheme

### Sell Asset Modal:
- **Primary**: Green (#16a34a) - Represents profit/success
- **Accent**: Blue (#2563eb) - For information
- **Background**: White/Dark mode adaptive
- **Borders**: Subtle gray

### Sale Details Modal:
- **Profit**: Green background (#dcfce7) with green text
- **Loss**: Red background (#fee2e2) with red text
- **Cards**: Light gray/zinc backgrounds
- **Icons**: Colored by category (blue, purple, orange, teal)

---

## 📱 Responsive Behavior

### Desktop (>1024px):
```
┌─────────────────────────────────────┐
│  [Field 1]     │     [Field 2]      │
│  [Field 3]     │     [Field 4]      │
│  [Payment Method - 4 buttons]       │
│  [Profit/Loss Display]              │
└─────────────────────────────────────┘
```

### Mobile (<768px):
```
┌─────────────────────┐
│  [Field 1]          │
│  [Field 2]          │
│  [Field 3]          │
│  [Field 4]          │
│  [Payment - Stack]  │
│  [Profit/Loss]      │
└─────────────────────┘
```

---

## 🔄 User Interaction Flow

### Selling an Asset:

```
1. Click "Sell Asset"
   ↓
2. Modal Opens
   ↓
3. Fill Form Fields
   ↓
4. See Real-time Profit/Loss
   ↓
5. Click "Confirm Sale"
   ↓
6. Validation Check
   ↓
7. API Call
   ↓
8. Success Toast
   ↓
9. Asset Status → SOLD
   ↓
10. Modal Closes
```

### Viewing Sale Details:

```
1. Click "View Sale Details"
   ↓
2. Fetch Sale Data
   ↓
3. Modal Opens
   ↓
4. Display Information
   ↓
5. User Reviews
   ↓
6. Click "Close"
```

---

## ✨ Interactive Elements

### Buttons:

**Primary (Confirm Sale)**:
```
┌────────────────────┐
│  Confirm Sale  ✓   │  ← Green, bold, shadow
└────────────────────┘
```

**Secondary (Cancel)**:
```
┌────────────────────┐
│      Cancel        │  ← Gray, subtle
└────────────────────┘
```

**Payment Method (Selected)**:
```
┌──────┐
│ CASH │  ← Green background, white text
└──────┘
```

**Payment Method (Unselected)**:
```
┌──────┐
│ CASH │  ← Gray background, dark text
└──────┘
```

---

## 🎯 Status Indicators

### Asset Status Badge:

**Active**:
```
┌─────────┐
│ ACTIVE  │  ← Green
└─────────┘
```

**Sold**:
```
┌──────┐
│ SOLD │  ← Blue
└──────┘
```

### Profit/Loss Badge:

**Profit**:
```
┌──────────────┐
│ ✅ PROFIT    │  ← Green background
│ +AED 5,000   │
└──────────────┘
```

**Loss**:
```
┌──────────────┐
│ ⚠️ LOSS      │  ← Red background
│ -AED 2,000   │
└──────────────┘
```

---

## 🎬 Animations

### Modal Entry:
- Fade in background overlay (300ms)
- Zoom in modal content (300ms)
- Smooth easing

### Form Interactions:
- Button hover: Scale 1.02
- Button active: Scale 0.98
- Input focus: Ring animation
- Error shake: Subtle horizontal shake

### Loading States:
- Spinner animation
- Button text changes
- Disabled state styling

---

## 📋 Form Validation Visual Feedback

### Valid Field:
```
┌──────────────────────┐
│ 💲 55000.00          │  ← Normal border
└──────────────────────┘
```

### Invalid Field:
```
┌──────────────────────┐
│ 💲                   │  ← Red border
└──────────────────────┘
❌ Sale price is required
```

### Required Field Indicator:
```
Sale Price (AED) *
                 ↑
            Red asterisk
```

---

## 🌙 Dark Mode

### Light Mode:
- Background: White (#ffffff)
- Text: Dark gray (#111827)
- Borders: Light gray (#e5e7eb)

### Dark Mode:
- Background: Zinc (#18181b)
- Text: White (#ffffff)
- Borders: Zinc (#27272a)

**Both modes maintain the same color scheme for**:
- Green (profit)
- Red (loss)
- Blue (information)
- Status badges

---

## 🎊 Success States

### After Successful Sale:

**Toast Notification**:
```
┌─────────────────────────────────┐
│ ✅ Asset sold successfully!     │  ← Green toast
└─────────────────────────────────┘
```

**Asset Status Updates**:
- Status badge changes to "SOLD"
- "Sell Asset" button becomes "View Sale Details"
- Asset appears in sold filter

---

## 🚨 Error States

### Validation Error:
```
┌──────────────────────────────────┐
│ ❌ Please fill in all required  │
│    fields                        │
└──────────────────────────────────┘
```

### API Error:
```
┌──────────────────────────────────┐
│ ❌ Failed to sell asset: [error] │  ← Red toast
└──────────────────────────────────┘
```

---

## 💡 Tips for Users

1. **Real-time Calculation**: Profit/loss updates as you type the sale price
2. **Color Coding**: Green = profit, Red = loss
3. **Required Fields**: Marked with red asterisk (*)
4. **Payment Methods**: Click to select, only one can be active
5. **Date Picker**: Defaults to today's date
6. **Notes**: Optional but recommended for record-keeping
7. **Sale History**: View past sales anytime via "View Sale Details"

---

## 🎯 Key Features Summary

✅ Beautiful, intuitive UI
✅ Real-time profit/loss calculation
✅ Form validation with visual feedback
✅ Responsive design (mobile-friendly)
✅ Dark mode support
✅ Smooth animations
✅ Clear status indicators
✅ Comprehensive sale details view
✅ Professional card-based layout
✅ Icon-based visual hierarchy

---

This visual guide helps understand the complete Asset Sale feature at a glance! 🚀

# Invoice API Endpoints Documentation

This document describes all available invoice API endpoints and their usage.

## Base URL
All endpoints are proxied through Next.js API routes to handle CORS and authentication.

## Endpoints

### 1. Get All Invoices
**GET** `/api/invoices`

Get a paginated list of invoices with optional filters.

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100)
- `customer_id` (optional): Filter by customer ID
- `status` (optional): Filter by invoice status

**Example:**
```javascript
const invoices = await invoiceService.getAll(0, 50, null, 'pending');
```

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "skip": 0,
  "limit": 50
}
```

---

### 2. Create Invoice
**POST** `/api/invoices`

Create a new invoice.

**Example:**
```javascript
const newInvoice = await invoiceService.create({
  invoice_number: "INV-001",
  customer_id: 1,
  invoice_date: "2026-02-23",
  invoice_status: "pending",
  invoice_notes: "Sample invoice"
});
```

---

### 3. Get Invoice by Number
**GET** `/api/invoices/number/{invoice_number}`

Get a specific invoice by its invoice number.

**Example:**
```javascript
const invoice = await invoiceService.getByNumber("INV-001");
```

---

### 4. Get Invoice by ID
**GET** `/api/invoices/{invoice_id}`

Get a specific invoice by its ID.

**Example:**
```javascript
const invoice = await invoiceService.getById(1);
```

---

### 5. Update Invoice
**PUT** `/api/invoices/{invoice_id}`

Update an existing invoice.

**Example:**
```javascript
const updated = await invoiceService.update(1, {
  invoice_status: "paid",
  invoice_notes: "Updated notes"
});
```

---

### 6. Delete Invoice
**DELETE** `/api/invoices/{invoice_id}`

Delete an invoice.

**Example:**
```javascript
await invoiceService.delete(1);
```

---

### 7. Get Invoice Items
**GET** `/api/invoices/{invoice_id}/items`

Get all items associated with a specific invoice.

**Example:**
```javascript
const items = await invoiceService.getItems(1);
```

**Response:**
```json
[
  {
    "id": 1,
    "invoice_id": 1,
    "stock_number": "STK-001",
    "item_description": "Engine Block",
    "quantity": 1,
    "unit_price": "1500.00",
    "total_price": "1500.00"
  }
]
```

---

### 8. Get Invoice Payments
**GET** `/api/invoices/{invoice_id}/payments`

Get all payments made for a specific invoice.

**Example:**
```javascript
const payments = await invoiceService.getPayments(1);
```

**Response:**
```json
[
  {
    "id": 1,
    "invoice_id": 1,
    "payment_date": "2026-02-23",
    "amount": "500.00",
    "payment_method": "cash",
    "notes": "Partial payment"
  }
]
```

---

### 9. Add Payment to Invoice
**POST** `/api/invoices/{invoice_id}/payments`

Add a new payment to an invoice.

**Example:**
```javascript
const payment = await invoiceService.addPayment(1, {
  payment_date: "2026-02-23",
  amount: "500.00",
  payment_method: "cash",
  notes: "Partial payment"
});
```

---

### 10. Save Invoice (Alternative)
**POST** `/api/invoices/save`

Alternative endpoint to save an invoice.

**Example:**
```javascript
const saved = await invoiceService.save({
  invoice_number: "INV-002",
  customer_id: 2,
  invoice_date: "2026-02-23",
  invoice_status: "draft"
});
```

---

### 11. Get All Payments
**GET** `/api/invoices/payments/all`

Get all payments across all invoices.

**Example:**
```javascript
const allPayments = await invoiceService.getAllPayments();
```

**Response:**
```json
[
  {
    "id": 1,
    "invoice_id": 1,
    "invoice_number": "INV-001",
    "payment_date": "2026-02-23",
    "amount": "500.00",
    "payment_method": "cash"
  }
]
```

---

### 12. Get Outstanding Balance
**GET** `/api/invoices/outstanding-balance/{view_type}`

Get outstanding balance with different view types.

**View Types:**
- `customer` - View by Customer Name
- `branch` - View by Branch
- `supplier` - View by Supplier Code
- `invoice` - View by Invoice Number
- `stock_number` - View by Stock Number (All)

**Query Parameters:**
- `filter_value` (optional): Filter value for the selected view type

**Example:**
```javascript
// Get outstanding balance by customer
const balances = await invoiceService.getOutstandingBalance('customer');

// Get outstanding balance for a specific customer
const customerBalance = await invoiceService.getOutstandingBalance('customer', 'John Doe');

// Get outstanding balance by invoice
const invoiceBalances = await invoiceService.getOutstandingBalance('invoice', 'INV-001');
```

**Response:**
```json
[
  {
    "invoice_number": "INV-001",
    "customer_id": 1,
    "invoice_date": "2026-02-23",
    "invoice_status": "pending",
    "overall_load_status": "pending",
    "invoice_notes": "Sample invoice",
    "id": 1,
    "invoice_by": 1,
    "invoice_total": "1500.00",
    "paid_amount": "500.00",
    "outstanding_amount": "1000.00",
    "created_at": "2026-02-23T12:17:29.134Z",
    "updated_at": "2026-02-23T12:17:29.134Z",
    "customer": {
      "id": 1,
      "customer_code": "CUST-001",
      "full_name": "John Doe",
      "phone": "+971501234567",
      "business_name": "Doe Trading LLC"
    },
    "created_by": {
      "id": 1,
      "user_code": "USR-001",
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
]
```

---

## Invoice Service Methods

All methods are available through the `invoiceService` object:

```javascript
import { invoiceService } from '@/app/lib/services/invoiceService';

// Get all invoices
const invoices = await invoiceService.getAll(skip, limit, customer_id, status);

// Get invoice by ID
const invoice = await invoiceService.getById(id);

// Get invoice by number
const invoice = await invoiceService.getByNumber(invoiceNumber);

// Create invoice
const newInvoice = await invoiceService.create(invoiceData);

// Update invoice
const updated = await invoiceService.update(id, invoiceData);

// Delete invoice
await invoiceService.delete(id);

// Get invoice items
const items = await invoiceService.getItems(id);

// Get invoice payments
const payments = await invoiceService.getPayments(id);

// Add payment
const payment = await invoiceService.addPayment(id, paymentData);

// Save invoice (alternative)
const saved = await invoiceService.save(invoiceData);

// Get all payments
const allPayments = await invoiceService.getAllPayments();

// Get outstanding balance
const balances = await invoiceService.getOutstandingBalance(viewType, filterValue);
```

---

## Error Handling

All endpoints include proper error handling with fallback data when the backend is unavailable. Errors are logged to the console with descriptive messages.

**Example Error Response:**
```json
{
  "error": "Failed to get invoice",
  "details": "Network error: Cannot reach the server"
}
```

---

## Authentication

All endpoints require authentication. The auth token is automatically included from localStorage when using the `fetchApi` utility.

**Headers:**
```
Authorization: Bearer <access_token>
```

---

## CORS

All endpoints include proper CORS headers to allow cross-origin requests:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

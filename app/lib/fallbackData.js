/**
 * Fallback data for when backend is unavailable
 * This provides mock data to keep the UI functional during backend outages
 */

export const fallbackInvoices = [
  {
    id: 1,
    invoice_number: "INV-2024-001",
    customer_id: 1,
    customer_name: "John Doe",
    invoice_date: "2024-01-15",
    invoice_status: "paid",
    overall_load_status: "completed",
    invoice_notes: "Sample invoice for demonstration",
    total_amount: 1500.00,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    invoice_number: "INV-2024-002",
    customer_id: 2,
    customer_name: "Jane Smith",
    invoice_date: "2024-01-20",
    invoice_status: "pending",
    overall_load_status: "in_progress",
    invoice_notes: "Urgent delivery required",
    total_amount: 2300.00,
    created_at: "2024-01-20T14:30:00Z"
  },
  {
    id: 3,
    invoice_number: "INV-2024-003",
    customer_id: 3,
    customer_name: "ABC Corporation",
    invoice_date: "2024-01-25",
    invoice_status: "overdue",
    overall_load_status: "pending",
    invoice_notes: "Follow up required",
    total_amount: 5600.00,
    created_at: "2024-01-25T09:15:00Z"
  }
];

export const fallbackCustomers = [
  {
    customer_code: "CUST-001",
    full_name: "John Doe",
    phone: "+971 50 123 4567",
    business_name: "AutoFix Ltd.",
    business_number: "123456789",
    total_purchase: "1250.75",
    outstanding_balance: "0.00",
    address: "Al Quoz Industrial Area, Dubai, UAE",
    notes: "Regular customer, good payment history",
    status: true,
    id: 1,
    created_at: "2026-01-28T06:17:15",
    updated_at: "2026-01-28T06:17:15"
  },
  {
    customer_code: "CUST-002",
    full_name: "Ahmed Al Mansouri",
    phone: "+971 55 987 6543",
    business_name: "Gulf Motors Trading",
    business_number: "987654321",
    total_purchase: "3450.00",
    outstanding_balance: "850.00",
    address: "Ras Al Khor Industrial Area, Dubai, UAE",
    notes: "Wholesale customer, bulk orders",
    status: true,
    id: 2,
    created_at: "2026-01-28T06:17:15",
    updated_at: "2026-01-28T06:17:15"
  },
  {
    customer_code: "CUST-003",
    full_name: "Sarah Johnson",
    phone: "+971 52 456 7890",
    business_name: "Quick Fix Garage",
    business_number: "456789123",
    total_purchase: "890.50",
    outstanding_balance: "200.00",
    address: "Al Ain Industrial Area, Al Ain, UAE",
    notes: "Small garage, frequent small orders",
    status: true,
    id: 3,
    created_at: "2026-01-28T06:17:15",
    updated_at: "2026-01-28T06:17:15"
  },
  {
    customer_code: "CUST-004",
    full_name: "Mohammed Hassan",
    phone: "+971 56 321 0987",
    business_name: "Hassan Auto Parts",
    business_number: "321098765",
    total_purchase: "5670.25",
    outstanding_balance: "1200.00",
    address: "Sharjah Industrial Area, Sharjah, UAE",
    notes: "Large retailer, monthly payment terms",
    status: true,
    id: 4,
    created_at: "2026-01-28T06:17:15",
    updated_at: "2026-01-28T06:17:15"
  },
  {
    customer_code: "CUST-005",
    full_name: "Lisa Chen",
    phone: "+971 50 789 0123",
    business_name: "Chen Motors",
    business_number: "789012345",
    total_purchase: "2340.00",
    outstanding_balance: "0.00",
    address: "Abu Dhabi Industrial City, Abu Dhabi, UAE",
    notes: "Specializes in Japanese car parts",
    status: true,
    id: 5,
    created_at: "2026-01-28T06:17:15",
    updated_at: "2026-01-28T06:17:15"
  },
  {
    customer_code: "CUST-006",
    full_name: "Omar Al Zaabi",
    phone: "+971 55 234 5678",
    business_name: null,
    business_number: null,
    total_purchase: "450.00",
    outstanding_balance: "0.00",
    address: "Jumeirah, Dubai, UAE",
    notes: "Individual customer, occasional purchases",
    status: true,
    id: 6,
    created_at: "2026-01-28T06:17:15",
    updated_at: "2026-01-28T06:17:15"
  }
];

export const fallbackUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@unixparts.com",
    full_name: "System Administrator",
    is_active: true,
    role: "admin",
    created_at: "2024-01-01T00:00:00Z"
  }
];

export const fallbackBranches = [
  {
    id: 1,
    branch_name: "Main Branch",
    branch_code: "MAIN001",
    address: "Head Office, Mumbai",
    phone: "+91-22-12345678",
    is_active: true
  }
];

export const fallbackStockItems = [
  {
    id: 1,
    item_name: "Sample Part A",
    item_code: "PART-001",
    category: "Electronics",
    unit_price: 150.00,
    stock_quantity: 100,
    is_active: true
  }
];

export const fallbackSuppliers = [
  {
    id: 1,
    supplier_name: "Sample Supplier Ltd",
    contact_person: "Contact Person",
    email: "supplier@example.com",
    phone: "+91-9876543213",
    address: "Supplier Address",
    is_active: true
  }
];

// Helper function to simulate API delay
export const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to get fallback data with simulated API response structure
export const getFallbackData = async (type, options = {}) => {
  await simulateApiDelay(200); // Simulate network delay
  
  switch (type) {
    case 'invoices':
      return {
        data: fallbackInvoices,
        total: fallbackInvoices.length,
        skip: options.skip || 0,
        limit: options.limit || 100
      };
      
    case 'customers':
      return {
        data: fallbackCustomers,
        total: fallbackCustomers.length,
        skip: options.skip || 0,
        limit: options.limit || 100
      };
      
    case 'users':
      return {
        data: fallbackUsers,
        total: fallbackUsers.length,
        skip: options.skip || 0,
        limit: options.limit || 100
      };
      
    case 'branches':
      return fallbackBranches;
      
    case 'stock-items':
      return fallbackStockItems;
      
    case 'suppliers':
      return fallbackSuppliers;
      
    default:
      return [];
  }
};
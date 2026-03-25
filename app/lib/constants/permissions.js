/**
 * Permission Constants
 * All permission slugs used in the application
 */

export const PERMISSIONS = {
  USERS: {
    VIEW: 'users.view',
    CREATE: 'users.create',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
  },
  BRANCHES: {
    VIEW: 'branches.view',
    CREATE: 'branches.create',
    UPDATE: 'branches.update',
    DELETE: 'branches.delete',
  },
  SUPPLIERS: {
    VIEW: 'suppliers.view',
    CREATE: 'suppliers.create',
    UPDATE: 'suppliers.update',
    DELETE: 'suppliers.delete',
  },
  ROLES: {
    VIEW: 'roles.view',
    CREATE: 'roles.create',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete',
  },
  PERMISSIONS: {
    VIEW: 'permissions.view',
    CREATE: 'permissions.create',
    UPDATE: 'permissions.update',
    DELETE: 'permissions.delete',
  },
  STOCK_ITEMS: {
    VIEW: 'stock_items.view',
    CREATE: 'stock_items.create',
    UPDATE: 'stock_items.update',
    DELETE: 'stock_items.delete',
  },
  PURCHASE_ORDERS: {
    VIEW: 'purchase_orders.view',
    CREATE: 'purchase_orders.create',
    UPDATE: 'purchase_orders.update',
    DELETE: 'purchase_orders.delete',
  },
  PO_ITEMS: {
    VIEW: 'po_items.view',
    CREATE: 'po_items.create',
    UPDATE: 'po_items.update',
    DELETE: 'po_items.delete',
  },
  ASSETS: {
    VIEW: 'assets.view',
    CREATE: 'assets.create',
    UPDATE: 'assets.update',
    DELETE: 'assets.delete',
  },
  CUSTOM_CLEARANCE: {
    VIEW: 'custom_clearance.view',
    CREATE: 'custom_clearance.create',
    UPDATE: 'custom_clearance.update',
    DELETE: 'custom_clearance.delete',
  },
  CONTAINERS: {
    VIEW: 'containers.view',
    CREATE: 'containers.create',
    UPDATE: 'containers.update',
    DELETE: 'containers.delete',
  },
  CONTAINER_ITEMS: {
    VIEW: 'container_items.view',
    CREATE: 'container_items.create',
    UPDATE: 'container_items.update',
    DELETE: 'container_items.delete',
  },
  CUSTOMERS: {
    VIEW: 'customers.view',
    CREATE: 'customers.create',
    UPDATE: 'customers.update',
    DELETE: 'customers.delete',
  },
  INVOICES: {
    VIEW: 'invoices.view',
    CREATE: 'invoices.create',
    UPDATE: 'invoices.update',
    DELETE: 'invoices.delete',
    ADD_PAYMENT: 'invoices.add_payment',
  },
  EMPLOYEES: {
    VIEW: 'employees.view',
    CREATE: 'employees.create',
    UPDATE: 'employees.update',
    DELETE: 'employees.delete',
  },
  PAYROLL: {
    VIEW: 'payroll.view',
    CREATE: 'payroll.create',
    UPDATE: 'payroll.update',
    DELETE: 'payroll.delete',
  },
  ATTENDANCE: {
    VIEW: 'attendance.view',
    CREATE: 'attendance.create',
    UPDATE: 'attendance.update',
    DELETE: 'attendance.delete',
    APPROVE: 'attendance.approve',
  },
  LEAVES: {
    VIEW: 'leaves.view',
    CREATE: 'leaves.create',
    UPDATE: 'leaves.update',
    DELETE: 'leaves.delete',
    APPROVE: 'leaves.approve',
    REJECT: 'leaves.reject',
  },
  EXPENSES: {
    VIEW: 'expenses.view',
    CREATE: 'expenses.create',
    UPDATE: 'expenses.update',
    DELETE: 'expenses.delete',
  },
  FUND_TRANSFERS: {
    VIEW: 'fund_transfers.view',
    CREATE: 'fund_transfers.create',
    UPDATE: 'fund_transfers.update',
    DELETE: 'fund_transfers.delete',
  },
};

// Helper to get all permission slugs as a flat array
export const getAllPermissionSlugs = () => {
  const slugs = [];
  Object.values(PERMISSIONS).forEach(module => {
    Object.values(module).forEach(slug => {
      slugs.push(slug);
    });
  });
  return slugs;
};

// Helper to get module name from permission slug
export const getModuleFromSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return null;
  const parts = slug.split('.');
  return parts[0] || null;
};

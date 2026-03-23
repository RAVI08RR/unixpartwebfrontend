"use client";

import React from "react";
import { 
  BarChart3, LayoutDashboard, Box, Users, ShoppingCart, 
  FileText, Settings, LogOut, Layers, Package, Truck, 
  DollarSign, X, Shield, Building2, UserCheck
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { NavItem } from "./NavItem";
import { authService } from "../lib/services/authService";
import { usePermission } from "../lib/hooks/usePermission";
import { PERMISSIONS } from "../lib/constants/permissions";
import useAuthStore from "../lib/store/authStore";

export function Sidebar() {
  const router = useRouter();
  const { 
    isSidebarOpen, isMobileOpen, setIsMobileOpen, 
    activeCategory, changeCategory, isSecondaryOpen 
  } = useSidebar();
  const pathname = usePathname();
  const { hasPermission, hasModuleAccess, isAdmin } = usePermission();
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    console.log("🔄 Sidebar logout initiated...");
    try {
      await authService.logout();
      clearAuth();
      console.log("✅ Sidebar logout successful, redirecting to login page...");
    } catch (error) {
      console.error("❌ Unexpected sidebar logout error:", error);
    } finally {
      console.log("🔄 Sidebar redirecting to login page...");
      router.push("/");
    }
  };

  const menuGroups = [
    {
      id: "Dashboard",
      icon: LayoutDashboard,
      customIcon: "/icons/dashboard-icon.svg",
      label: "Dashboards",
      permission: null, // Always visible
      items: [
        { label: "CRM", href: "/dashboard", icon: BarChart3, permission: null },
        { label: "Analytics", href: "/dashboard/analytics", icon: Layers, permission: null },
        { label: "eCommerce", href: "/dashboard/ecommerce", icon: ShoppingCart, permission: null },
      ]
    },
    {
      id: "People",
      icon: Users,
      customIcon: "/icons/Button-5.svg",
      label: "Management",
      permission: null, // Show if any sub-item is visible
      items: [
        { label: "User Management", href: "/dashboard/users", icon: Users, permission: PERMISSIONS.USERS.VIEW },
        { label: "Role Management", href: "/dashboard/roles", icon: Shield, permission: PERMISSIONS.ROLES.VIEW },
        { label: "Employees", href: "/dashboard/management/employees", icon: UserCheck, permission: PERMISSIONS.EMPLOYEES?.VIEW },
        { label: "Attendance", href: "/dashboard/management/attendance", icon: UserCheck, permission: PERMISSIONS.ATTENDANCE?.VIEW },
        { label: "Leaves", href: "/dashboard/management/leaves", icon: FileText, permission: PERMISSIONS.LEAVES?.VIEW },
        { label: "Payroll", href: "/dashboard/management/payroll", icon: DollarSign, permission: PERMISSIONS.PAYROLL?.VIEW },
      ]
    },
    {
      id: "Inventory",
      icon: Package,
      customIcon: "/icons/Button-3.svg",
      label: "Inventory",
      permission: null,
      items: [
        { label: "Inventory", href: "/dashboard/inventory/all-inventory", icon: Layers, permission: PERMISSIONS.STOCK_ITEMS.VIEW },
        { label: "Purchase Orders", href: "/dashboard/inventory/purchase-orders", icon: ShoppingCart, permission: PERMISSIONS.STOCK_ITEMS.VIEW },
        { label: "Custom Clearance", href: "/dashboard/inventory/custom-clearance", icon: Shield, permission: PERMISSIONS.STOCK_ITEMS.VIEW },
        { label: "Suppliers", href: "/dashboard/inventory/suppliers", icon: Truck, permission: PERMISSIONS.SUPPLIERS.VIEW },
        { label: "Stock Items", href: "/dashboard/inventory/stock-items", icon: Package, permission: PERMISSIONS.STOCK_ITEMS.VIEW },
        { label: "Assets", href: "/dashboard/inventory/assets", icon: Box, permission: PERMISSIONS.STOCK_ITEMS.VIEW },
      ]
    },
    {
      id: "Sales",
      icon: ShoppingCart,
      customIcon: "/icons/Button-4.svg",
      label: "Sales",
      permission: null,
      items: [
        { label: "Customers", href: "/dashboard/sales/customers", icon: UserCheck, permission: PERMISSIONS.CUSTOMERS.VIEW },
        { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart, permission: PERMISSIONS.INVOICES.VIEW },
        { label: "Invoices", href: "/dashboard/sales/invoices", icon: FileText, permission: PERMISSIONS.INVOICES.VIEW },
        { label: "Payments Received", href: "/dashboard/sales/payments-received", icon: DollarSign, permission: PERMISSIONS.INVOICES.VIEW },
        { label: "Sales Data", href: "/dashboard/sales/sales-data", icon: BarChart3, permission: PERMISSIONS.INVOICES.VIEW },
      ]
    },
    {
      id: "Approvals",
      icon: Shield,
      customIcon: "/icons/Button-5.svg",
      label: "Approvals",
      permission: null,
      items: [
        { label: "Pending", href: "/dashboard/approvals/pending", icon: FileText, permission: null },
        { label: "History", href: "/dashboard/approvals/history", icon: Layers, permission: null },
      ]
    },
    {
      id: "Reports",
      icon: BarChart3,
      customIcon: "/icons/Button-7.svg",
      label: "Reports",
      permission: null,
      items: [
        { label: "Daily", href: "/dashboard/reports/daily", icon: BarChart3, permission: null },
        { label: "Monthly", href: "/dashboard/reports/monthly", icon: Layers, permission: null },
      ]
    },
    {
      id: "Finance",
      icon: DollarSign,
      customIcon: "/icons/Button-8.svg",
      label: "Finance",
      permission: null,
      items: [
        { label: "Overview", href: "/dashboard/finance/overview", icon: DollarSign, permission: null },
        { label: "Expenses", href: "/dashboard/finance/expenses", icon: FileText, permission: null },
        { label: "Fund Transfers", href: "/dashboard/finance/fund-transfers", icon: Layers, permission: null },
        { label: "Transactions", href: "/dashboard/finance/transactions", icon: Layers, permission: null },
      ]
    },
    {
      id: "Security",
      icon: Shield,
      customIcon: "/icons/Button-9.svg",
      label: "Security",
      permission: null,
      items: [
        { label: "Alerts", href: "/dashboard/security/alerts", icon: Shield, permission: null },
        { label: "Logs", href: "/dashboard/security/logs", icon: Layers, permission: null },
      ]
    },
    {
      id: "Administration",
      icon: Settings,
      customIcon: "/icons/Button-2.svg",
      label: "Administration",
      permission: null,
      items: [
        { label: "Branches", href: "/dashboard/administration/branches", icon: Building2, permission: PERMISSIONS.BRANCHES.VIEW },
      ]
    },
    {
      id: "Settings",
      icon: Settings,
      customIcon: "/icons/Button-10.svg",
      label: "Settings",
      permission: null,
      items: [
        { label: "General", href: "/dashboard/settings", icon: Settings, permission: null },
        { label: "Permissions", href: "/dashboard/settings/permissions", icon: Shield, permission: PERMISSIONS.PERMISSIONS.VIEW },
        { label: "Profile", href: "/dashboard/settings/profile", icon: Users, permission: null },
      ]
    },
  ];

  // Filter menu items based on permissions
  const filterMenuItems = (items) => {
    return items.filter(item => {
      // No permission required - always show
      if (!item.permission) return true;
      // Admin bypass
      if (isAdmin()) return true;
      // Check permission
      return hasPermission(item.permission);
    });
  };

  // Filter menu groups - only show groups that have visible items
  const visibleMenuGroups = menuGroups.map(group => ({
    ...group,
    items: filterMenuItems(group.items)
  })).filter(group => group.items.length > 0);

  const activeGroup = visibleMenuGroups.find(g => g.id === activeCategory) || visibleMenuGroups[0];

  const sidebarVariants = {
    expanded: { width: isSecondaryOpen ? 320 : 88 },
    collapsed: { width: 88 }
  };

  const RailContent = () => (
    <div className="w-[74px] flex flex-col h-full bg-black dark:bg-zinc-950 border-r border-white/5 items-center py-6 shrink-0 z-20">
      {/* Brand Logo */}
      <div className="mb-10">
        <div className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden p-1">
          <img 
            src="/logo.png" 
            alt="Unixparts Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Rail Navigation icons */}
      <div className="flex-1 flex flex-col gap-4 w-full px-3">
        {visibleMenuGroups.map((group) => {
          const isActive = activeCategory === group.id;
          return (
            <button
              key={group.id}
              onClick={() => changeCategory(group.id)}
              className={`
                relative w-[49px] h-[49px] rounded-full flex items-center justify-center transition-all duration-300 group
                ${isActive ? 'bg-white shadow-lg' : 'hover:bg-white/10'}
              `}
            >
              {group.customIcon ? (
                <img 
                  src={group.customIcon} 
                  alt={group.label} 
                  className={`w-[35px] h-[35px] transition-all duration-300 ${isActive ? 'brightness-0' : 'opacity-70 group-hover:opacity-100'}`}
                />
              ) : (
                <group.icon className={`w-[35px] h-[35px] ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'}`} />
              )}
              
              {/* Tooltip for desktop */}
              <div className="absolute left-full ml-4 px-3 py-1 bg-zinc-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                {group.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="mt-auto px-3 w-full">
        <button 
          onClick={handleLogout}
          className="w-full aspect-square rounded-2xl flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all font-black"
        >
          <LogOut className="w-5 h-5 shrink-0" />
        </button>
      </div>
    </div>
  );

  const SecondaryPanelContent = () => (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 h-full overflow-hidden border-r border-gray-100 dark:border-zinc-800 shadow-xl">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-tight text-[11px] opacity-40">
          {activeGroup.label}
        </h2>
        
        <div className="space-y-1">
          {activeGroup.items.map((item, idx) => {
            const isItemActive = pathname === item.href;
            return (
              <button
                key={idx}
                onClick={() => {
                  window.location.href = item.href;
                  if (isMobileOpen) setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group
                  ${isItemActive 
                    ? 'bg-red-50 text-red-600 font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'}
                `}
              >
                <div className={`p-2 rounded-xl transition-colors ${isItemActive ? 'bg-white shadow-sm' : 'bg-gray-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-700'}`}>
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={isSidebarOpen ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        className="fixed left-0 top-0 h-full z-50 hidden lg:flex"
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
      >
        <RailContent />
        <AnimatePresence mode="wait">
          {isSecondaryOpen && isSidebarOpen && (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-[232px]"
            >
              <SecondaryPanelContent />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-[312px] z-70 lg:hidden flex overflow-hidden"
            >
              <div className="w-[80px] shrink-0 border-r border-white/5">
                <RailContent />
              </div>
              <div className="flex-1 bg-white dark:bg-zinc-900">
                <SecondaryPanelContent />
              </div>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-zinc-800 rounded-xl text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

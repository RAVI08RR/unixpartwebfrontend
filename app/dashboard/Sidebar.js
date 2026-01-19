"use client";

import React from "react";
import { 
  BarChart3, LayoutDashboard, Box, Users, ShoppingCart, 
  FileText, Settings, LogOut, Layers, Package, Truck, 
  DollarSign, X
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { NavItem } from "./NavItem";

export function Sidebar() {
  const { 
    isSidebarOpen, isMobileOpen, setIsMobileOpen, 
    activeCategory, changeCategory, isSecondaryOpen 
  } = useSidebar();
  const pathname = usePathname();

  const menuGroups = [
    {
      id: "Dashboard",
      icon: LayoutDashboard,
      label: "Dashboards",
      items: [
        { label: "CRM", href: "/dashboard", icon: BarChart3 },
        { label: "Analytics", href: "/dashboard/analytics", icon: Layers },
        { label: "eCommerce", href: "/dashboard/ecommerce", icon: ShoppingCart },
      ]
    },
    {
      id: "Inventory",
      icon: Box,
      label: "Inventory Mgt",
      items: [
        { label: "Stock List", href: "/dashboard/inventory/stock", icon: Package },
        { label: "Containers", href: "/dashboard/containers", icon: Layers },
        { label: "Warehouse", href: "/dashboard/warehouse", icon: Package },
      ]
    },
    {
      id: "Sales",
      icon: ShoppingCart,
      label: "Sales & Finance",
      items: [
        { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
        { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
        { label: "Settlements", href: "/dashboard/settlements", icon: DollarSign },
      ]
    },
    {
      id: "People",
      icon: Users,
      label: "People",
      items: [
        { label: "Customers", href: "/dashboard/customers", icon: Users },
        { label: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
      ]
    },
    {
      id: "Settings",
      icon: Settings,
      label: "Control Center",
      items: [
        { label: "General Settings", href: "/dashboard/settings", icon: Settings },
        { label: "Profile", href: "/dashboard/settings/profile", icon: Users },
        { label: "Security", href: "/dashboard/settings/security", icon: Layers },
      ]
    }
  ];

  const activeGroup = menuGroups.find(g => g.id === activeCategory) || menuGroups[0];

  const sidebarVariants = {
    expanded: { width: isSecondaryOpen ? 320 : 88 },
    collapsed: { width: 88 }
  };

  const RailContent = () => (
    <div className="w-[88px] flex flex-col h-full bg-black dark:bg-zinc-950 border-r border-white/5 items-center py-6 shrink-0 z-20">
      {/* Brand Logo */}
      <div className="mb-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden p-1">
          <img 
            src="/logo.png" 
            alt="Unixparts Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Rail Navigation icons */}
      <div className="flex-1 flex flex-col gap-4 w-full px-3">
        {menuGroups.map((group) => {
          const isActive = activeCategory === group.id;
          return (
            <button
              key={group.id}
              onClick={() => changeCategory(group.id)}
              className={`
                relative w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 group
                ${isActive ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}
              `}
            >
              <group.icon className="w-6 h-6" />
              
              {/* Tooltip for desktop */}
              <div className="absolute left-full ml-4 px-3 py-1 bg-zinc-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                {group.label}
              </div>

              {/* Active Dot indicator */}
              {isActive && (
                <motion.div 
                  layoutId="activeRailDot"
                  className="absolute -right-1 w-1.5 h-6 bg-red-500 rounded-l-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="mt-auto px-3 w-full">
        <button className="w-full aspect-square rounded-2xl flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all">
          <LogOut className="w-6 h-6 shrink-0" />
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
                  <item.icon className="w-4 h-4" />
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
        className="fixed left-0 top-0 h-full z-50 hidden lg:flex overflow-hidden"
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

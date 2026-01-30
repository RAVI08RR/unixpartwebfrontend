"use client";

import React from "react";
import { 
  BarChart3, LayoutDashboard, Box, Users, ShoppingCart, 
  FileText, Settings, LogOut, Layers, Package, Truck, 
  DollarSign, X, Shield
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { NavItem } from "./NavItem";
import { authService } from "../lib/services/authService";

export function Sidebar() {
  const router = useRouter();
  const { 
    isSidebarOpen, isMobileOpen, setIsMobileOpen, 
    activeCategory, changeCategory, isSecondaryOpen 
  } = useSidebar();
  const pathname = usePathname();

  const handleLogout = async () => {
    console.log("🔄 Sidebar logout initiated...");
    try {
      await authService.logout();
      console.log("✅ Sidebar logout successful, redirecting to login page...");
    } catch (error) {
      // This should rarely happen now since authService.logout doesn't throw
      console.error("❌ Unexpected sidebar logout error:", error);
    } finally {
      // Always redirect regardless of any errors
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
      items: [
        { label: "CRM", href: "/dashboard", icon: BarChart3 },
        { label: "Analytics", href: "/dashboard/analytics", icon: Layers },
        { label: "eCommerce", href: "/dashboard/ecommerce", icon: ShoppingCart },
      ]
    },
    {
      id: "People",
      icon: Users,
      customIcon: "/icons/Button-5.svg",
      label: "Management",
      items: [
        { label: "User Management", href: "/dashboard/users", icon: Users },
        { label: "Role Management", href: "/dashboard/roles", icon: Shield },
      ]
    },

    {
      id: "Sales",
      icon: ShoppingCart,
      customIcon: "/icons/Button-4.svg",
      label: "Sales",
      items: [
        { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
        { label: "Invoices", href: "/dashboard/sales/invoices", icon: FileText },
      ]
    },
    {
      id: "Approvals",
      icon: Shield,
      customIcon: "/icons/Button-5.svg",
      label: "Approvals",
      items: [
        { label: "Pending", href: "/dashboard/approvals/pending", icon: FileText },
        { label: "History", href: "/dashboard/approvals/history", icon: Layers },
      ]
    },
    {
      id: "Documents",
      icon: FileText,
      customIcon: "/icons/Button-6.svg",
      label: "Documents",
      items: [
        { label: "Files", href: "/dashboard/documents/files", icon: FileText },
        { label: "Archives", href: "/dashboard/documents/archives", icon: Layers },
      ]
    },
    {
      id: "Reports",
      icon: BarChart3,
      customIcon: "/icons/Button-7.svg",
      label: "Reports",
      items: [
        { label: "Daily", href: "/dashboard/reports/daily", icon: BarChart3 },
        { label: "Monthly", href: "/dashboard/reports/monthly", icon: Layers },
      ]
    },
    {
      id: "Finance",
      icon: DollarSign,
      customIcon: "/icons/Button-8.svg",
      label: "Finance",
      items: [
        { label: "Overview", href: "/dashboard/finance/overview", icon: DollarSign },
        { label: "Transactions", href: "/dashboard/finance/transactions", icon: Layers },
      ]
    },
    {
      id: "Security",
      icon: Shield,
      customIcon: "/icons/Button-9.svg",
      label: "Security",
      items: [
        { label: "Alerts", href: "/dashboard/security/alerts", icon: Shield },
        { label: "Logs", href: "/dashboard/security/logs", icon: Layers },
      ]
    },
    {
      id: "Settings",
      icon: Settings,
      customIcon: "/icons/Button-10.svg",
      label: "Settings",
      items: [
        { label: "General", href: "/dashboard/settings", icon: Settings },
        { label: "Profile", href: "/dashboard/settings/profile", icon: Users },
      ]
    },
 
  ];

  const activeGroup = menuGroups.find(g => g.id === activeCategory) || menuGroups[0];

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
        {menuGroups.map((group) => {
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
                  className={`w-[45px] h-[45px] transition-all duration-300 ${isActive ? 'brightness-0' : 'opacity-70 group-hover:opacity-100'}`}
                />
              ) : (
                <group.icon className={`w-[45px] h-[45px] ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'}`} />
              )}
              
              {/* Tooltip for desktop */}
              <div className="absolute left-full ml-4 px-3 py-1 bg-zinc-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                {group.label}
              </div>

              {/* Active Dot indicator - Removed as per new design (circle bg replaces it) */}
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

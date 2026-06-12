"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, User, Calendar, FileText, 
  Clock, Shield, LogOut, Menu, X, ArrowLeft,
  Briefcase, TrendingUp, ThemeToggle as ThemeIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser } from "../lib/hooks/useCurrentUser";
import { authService } from "../lib/services/authService";
import useAuthStore from "../lib/store/authStore";
import AuthProvider from "../components/AuthProvider";
import { ThemeToggle } from "../dashboard/ThemeToggle";

function EmployeeLayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const { clearAuth } = useAuthStore();
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === '/employee/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/employee", icon: LayoutDashboard },
    { label: "My Profile", href: "/employee/profile", icon: User },
    { label: "My Attendance", href: "/employee/attendance", icon: Clock },
    { label: "My Leaves", href: "/employee/leaves", icon: Calendar },
    { label: "My Documents", href: "/employee/documents", icon: FileText },
    { label: "Employment History", href: "/employee/history", icon: TrendingUp },
  ];

  const getInitials = (name) => {
    if (!name) return "EE";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 text-white border-r border-zinc-900/50 p-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1 overflow-hidden shrink-0 border border-white/10">
          <img src="/logo.png" alt="Unixparts Logo" className="w-full h-full object-contain" />
        </div>
        {isSidebarExpanded && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-black tracking-wider text-sm leading-tight text-white uppercase">Unixparts</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Self Service</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                ${isActive 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/20' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-semibold whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info card bottom */}
      {user && (
        <div className="mt-auto border-t border-zinc-900/50 pt-4 mb-2">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-300 shrink-0 border border-zinc-700/50 shadow-inner">
              {getInitials(user?.name)}
            </div>
            {isSidebarExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden flex-1"
              >
                <p className="text-xs font-bold text-white truncate leading-none mb-1">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 truncate leading-none uppercase font-bold tracking-tight">{user?.role?.name || "Employee"}</p>
              </motion.div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-bold"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarExpanded && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden md:block fixed left-0 top-0 h-screen z-30 transition-all duration-300 ease-in-out shrink-0
          ${isSidebarExpanded ? 'w-64' : 'w-20'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'md:pl-64' : 'md:pl-20'}`}>
        
        {/* Topbar */}
        <header 
          className={`
            sticky top-0 z-20 transition-all duration-200 border-b flex items-center justify-between px-4 md:px-8 py-4
            ${scrolled 
              ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-gray-100 dark:border-zinc-900/50 shadow-sm' 
              : 'bg-[#F8FAFC] dark:bg-zinc-950 border-transparent'}
          `}
        >
          {/* Collapse toggle / Mobile toggle button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="hidden md:flex p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] opacity-80">
              Employee Self Service
            </h2>
          </div>

          {/* Quick Actions / Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-zinc-300 md:hidden">
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      {/* Mobile Drawer (Sidebar) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-[280px] z-50 md:hidden flex flex-col"
            >
              <SidebarContent />
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl border border-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EmployeeLayout({ children }) {
  return (
    <AuthProvider>
      <EmployeeLayoutContent>{children}</EmployeeLayoutContent>
    </AuthProvider>
  );
}

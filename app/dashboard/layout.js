"use client";

import { 
  Search, Bell, Globe, 
  MoreVertical, Menu
} from "lucide-react";
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { ThemeToggle } from "./ThemeToggle";

function Topbar() {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900 px-4 md:px-8 py-4 flex items-center justify-between transition-colors duration-300"
    style={{
      display: "flex",
      padding: "20px 60px",
      backgroundColor: "#F8FAFC"
    }}
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Desktop Toggle */}
        <button 
          onClick={toggleSidebar} 
          className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Toggle */}
        <button 
          onClick={toggleMobileSidebar} 
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] dark:bg-zinc-900 border border-gray-100 rounded-[12px] focus:ring-2 focus:ring-red-500/20 transition-all dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium dark:text-gray-300">EN</span>
        </div>
        <ThemeToggle />
        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
        </button>
        <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-gray-100 dark:border-zinc-900">
           <div className="hidden md:block text-right">
              <p className="text-sm font-bold dark:text-white leading-tight">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
           </div>
           <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 shadow-inner">
              AU
           </div>
        </div>
      </div>
    </header>
  );
}

function LayoutContent({ children }) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Sidebar />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-[320px]' : 'lg:ml-[88px]'} overflow-x-hidden`}>
        <Topbar />

        {/* Page Content */}
        <div className="p-4 md:p-8 max-w-[94%] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}

"use client";

import { 
  Search, Bell, Globe, 
  MoreVertical, Menu
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { ThemeToggle } from "./ThemeToggle";
import { useCurrentUser } from "../lib/hooks/useCurrentUser";
import { authService } from "../lib/services/authService";
import { LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";

function Topbar() {
  const router = useRouter();
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useCurrentUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    console.log("🔄 Logout initiated...");
    try {
      await authService.logout();
      console.log("✅ Logout successful, redirecting to login page...");
    } catch (error) {
      // This should rarely happen now since authService.logout doesn't throw
      console.error("❌ Unexpected logout error:", error);
    } finally {
      // Always redirect regardless of any errors
      console.log("🔄 Redirecting to login page...");
      router.push("/");
    }
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "AU";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900 px-4 md:px-8 py-4 flex items-center justify-between transition-colors duration-300"
    >
      <div className="flex items-center gap-4 flex-1">
        {/* Desktop Toggle */}
        <button 
          onClick={toggleSidebar} 
          className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-gray-500 lg:ml-[35px]"
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

      <div className="flex items-center gap-3 md:gap-6 lg:mr-[40px]">
        <div className="hidden sm:flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium dark:text-gray-300">EN</span>
        </div>
        <ThemeToggle />
        <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-xl transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
        </button>
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-3 md:pl-6 border-l border-gray-100 dark:border-zinc-900 group hover:opacity-80 transition-all"
          >
             <div className="hidden md:block text-right">
                <p className="text-sm font-bold dark:text-white leading-tight">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role?.name || "User"}
                </p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 shadow-inner group-hover:scale-95 transition-transform">
                {getInitials(user?.name)}
             </div>
          </button>

          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-2xl z-20 py-3 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-4 mb-2 border-b border-gray-50 dark:border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-black text-xl">
                      {getInitials(user?.name)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[15px] font-black dark:text-white truncate leading-tight">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button 
                    onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/dashboard/settings/profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                  <button 
                    onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/dashboard/settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Account Settings</span>
                  </button>
                  
                  <div className="h-px bg-gray-100 dark:bg-zinc-800 my-2 mx-2" />
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
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

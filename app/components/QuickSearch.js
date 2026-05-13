"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Maximize2 } from "lucide-react";

export default function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [searchQuery, setSearchQuery] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const tabs = ["Item", "Invoice", "Create", "Actions"];

  return (
    <>
      {/* Floating Quick Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl shadow-red-600/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 group"
        aria-label="Quick Search"
      >
        <Search className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl w-full max-w-3xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            style={{ maxHeight: "85vh" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    Search or Scan Item
                  </h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                    Quick access to invoices, items, and more
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-2xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-8 pt-6">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-2xl">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                      activeTab === tab
                        ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-lg shadow-black/5"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="p-8">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Invoice, Stock, Customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-zinc-800/50 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Search Results Area */}
            <div className="px-8 pb-8">
              <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center">
                {searchQuery ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                      Searching for "{searchQuery}"
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Search functionality will be implemented based on the active tab
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                      Start typing to search
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                      Search for invoices, stock items, customers, or use the tabs above to access quick actions
                    </p>
                    
                    {/* Quick Tips */}
                    <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg mx-auto">
                      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                          Tip
                        </p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded text-xs font-black">ESC</kbd> to close
                        </p>
                      </div>
                      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                          Quick Access
                        </p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          Use tabs for actions
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 pb-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Quick Search Active
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

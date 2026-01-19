"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./SidebarContext";

export function NavItem({ item, depth = 0 }) {
  const { isSidebarOpen } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  const handleClick = () => {
    if (hasSubItems) {
      setIsOpen(!isOpen);
    }
  };

  const isActive = item.active;

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-4 p-3 rounded-xl transition-all relative group
          ${isActive ? 'bg-red-500/10 text-red-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900'}
          ${isSidebarOpen ? 'justify-start' : 'justify-center'}
        `}
      >
        {/* Active Indicator Line */}
        {isActive && isSidebarOpen && (
          <motion.div 
            layoutId="activeIndicator"
            className="absolute left-0 w-1 h-6 bg-red-600 rounded-r-full"
          />
        )}

        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-red-500'}`} />
        
        {isSidebarOpen && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-medium flex-1 text-left"
          >
            {item.label}
          </motion.span>
        )}

        {isSidebarOpen && hasSubItems && (
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        )}

        {/* Tooltip for collapsed state */}
        {!isSidebarOpen && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
            {item.label}
          </div>
        )}
      </button>

      {/* Submenu Items */}
      <AnimatePresence>
        {isSidebarOpen && hasSubItems && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden ml-4 pl-4 border-l border-gray-100 dark:border-zinc-800 mt-1 space-y-1"
          >
            {item.subItems.map((subItem, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-500 dark:text-gray-400 hover:text-red-500"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                <span>{subItem.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

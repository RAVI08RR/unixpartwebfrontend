"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Dashboard");
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(true);

  // Load persistence from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar_expanded");
    if (savedState !== null) {
      setIsSidebarOpen(savedState === "true");
    }
    const savedCategory = localStorage.getItem("sidebar_active_category");
    if (savedCategory) {
      setActiveCategory(savedCategory);
    }
  }, []);

  // Save persistence to localStorage
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar_expanded", newState.toString());
      return newState;
    });
  };

  const changeCategory = (category) => {
    setActiveCategory(category);
    setIsSecondaryOpen(true);
    localStorage.setItem("sidebar_active_category", category);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const toggleSecondary = () => {
    setIsSecondaryOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileSidebar,
        activeCategory,
        changeCategory,
        isSecondaryOpen,
        toggleSecondary,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

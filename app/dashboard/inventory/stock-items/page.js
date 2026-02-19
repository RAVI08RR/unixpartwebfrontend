"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Package, MoreVertical, Search, 
  Filter, Download, Plus, ChevronLeft, ChevronRight,
  Pencil, Trash2, X, Eye, Calendar,
  Tag, FileText, ChevronDown, ChevronUp, Wrench
} from "lucide-react";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { stockItemService } from "@/app/lib/services/stockItemService";
import { getAuthToken } from "@/app/lib/api";

export default function StockItemsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categories, setCategories] = useState([]);
  
  // Data Fetching
  const itemsPerPage = 8;
  const { stockItems: apiStockItems, isLoading, isError, mutate } = useStockItems(0, 100);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await stockItemService.getCategories();
        setCategories(cats || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Handle Data Selection (API only) - Fixed for hydration
  const stockItems = useMemo(() => {
    // During SSR, always return empty array to prevent hydration mismatch
    if (typeof window === 'undefined') return [];

    const token = getAuthToken();
    if (!token) { 
      // If no token, return empty array - user should be redirected to login
      return [];
    }
    
    // Log the data state for debugging
    console.log("STOCK-ITEMS-DASHBOARD DATA DEBUG:", {
      hasApiData: !!apiStockItems,
      apiCount: apiStockItems?.length,
      hasToken: !!token,
      isLoading,
      isError
    });
    
    // If we have API data, use it
    if (apiStockItems) {
        // Handle both array and object responses
        const data = Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
        return data;
    }

    // If no API data, return empty array
    return [];
  }, [apiStockItems, isError, isLoading]);

  // Add client-side mounting state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset to first page when stock items list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [stockItems.length]);

  // Menu state and modals
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState(null);

  // Group items by category
  const categorizedItems = useMemo(() => {
    if (!stockItems) return {};
    
    const filtered = stockItems.filter(item => {
      const matchesSearch = 
        (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || 
        (statusFilter === "Active" && item.status === true) ||
        (statusFilter === "Inactive" && item.status === false);
      
      return matchesSearch && matchesStatus;
    });

    // Group by parent_category_id
    const grouped = {};
    filtered.forEach(item => {
      const categoryId = item.parent_category_id || 'uncategorized';
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(item);
    });

    return grouped;
  }, [searchQuery, statusFilter, stockItems]);

  // Get category names from fetched categories
  const getCategoryName = (categoryId) => {
    if (categoryId === 'uncategorized') return "Uncategorized";
    const category = categories.find(cat => cat.id === parseInt(categoryId));
    return category ? category.name : `Category ${categoryId}`;
  };

  // Get category description
  const getCategoryDescription = (categoryId) => {
    if (categoryId === 'uncategorized') return "Items without a category";
    const category = categories.find(cat => cat.id === parseInt(categoryId));
    return category ? category.description : "";
  };

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Expand all categories
  useEffect(() => {
    const allCategories = Object.keys(categorizedItems);
    const expanded = {};
    allCategories.forEach(cat => {
      expanded[cat] = true;
    });
    setExpandedCategories(expanded);
  }, [categorizedItems]);

  // Filter and search logic (kept for compatibility)
  const filteredStockItems = useMemo(() => {
    if (!stockItems) return [];
    return stockItems.filter(item => {
      const matchesSearch = 
        (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || 
        (statusFilter === "Active" && item.status === true) ||
        (statusFilter === "Inactive" && item.status === false);
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, stockItems]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleViewStockItem = (item) => {
    setSelectedStockItem(item);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteClick = (item) => {
    setSelectedStockItem(item);
    setDeleteModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStockItem) return;
    
    try {
      await stockItemService.delete(selectedStockItem.id);
      mutate();
      setDeleteModalOpen(false);
      setSelectedStockItem(null);
    } catch (error) {
      console.error("Failed to delete stock item", error);
      alert("Failed to delete stock item");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedStockItem(null);
  };

  const handleViewClose = () => {
    setViewModalOpen(false);
    setSelectedStockItem(null);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state only after component is mounted to prevent hydration mismatch
  if (!isMounted || (isLoading && (!stockItems || stockItems.length === 0))) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Stock Items Management</h1>
            <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your stock items</p>
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="text-gray-500">Loading stock items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Stock Items Management</h1>
          <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your stock items</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, description..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 btn-mobile-arrange">
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all filter-button"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {["All", "Active", "Inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        statusFilter === status 
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {status === "All" ? "All Status" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <Link href="/dashboard/inventory/stock-items/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all add-button">
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add Stock Item</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Category-wise Display */}
      <div className="space-y-4">
        {Object.keys(categorizedItems).length > 0 ? (
          Object.keys(categorizedItems).sort().map((categoryId) => {
            const items = categorizedItems[categoryId];
            const isExpanded = expandedCategories[categoryId];
            
            return (
              <div 
                key={categoryId}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryId)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 flex items-center justify-center shadow-lg">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">
                        {getCategoryName(categoryId)}
                      </h3>
                      <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                        {categoryId !== 'uncategorized' ? `cat-${categoryId}` : 'No category'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-4 py-2 rounded-xl">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-zinc-800">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="group px-6 py-5 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all"
                        style={{ borderBottom: index < items.length - 1 ? "0.9px solid #E2E8F0" : "none" }}
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Item Info */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors truncate">
                                {item.name || 'N/A'}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                                item-{categoryId}-{items.indexOf(item) + 1}
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="hidden lg:block flex-1 min-w-0 max-w-md">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {item.description || 'No description'}
                            </p>
                          </div>

                          {/* Status */}
                          <div className="shrink-0">
                            <div className={item.status ? 'status-badge-active' : 'status-badge-inactive'}>
                              <div className={item.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                              {item.status ? "Active" : "Inactive"}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="relative shrink-0">
                            <button 
                              onClick={() => toggleMenu(item.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                                menuOpenId === item.id 
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 bg-gray-50 dark:bg-zinc-800/50'
                              }`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {menuOpenId === item.id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                  onClick={() => handleViewStockItem(item)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <Link 
                                  href={`/dashboard/inventory/stock-items/edit/${item.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit Stock Item
                                </Link>
                                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                <button 
                                  onClick={() => handleDeleteClick(item)} 
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Stock Item
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-24 text-center">
            <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No stock items found</p>
          </div>
        )}
      </div>

      {/* View Stock Item Modal */}
      {viewModalOpen && selectedStockItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                  <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStockItem.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedStockItem.id}</p>
                </div>
              </div>
              <button 
                onClick={handleViewClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Item Name</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedStockItem.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category ID</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedStockItem.parent_category_id || "Not assigned"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedStockItem.description || "No description provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className={`inline-flex mt-1 ${selectedStockItem.status ? 'status-badge-active' : 'status-badge-inactive'}`}>
                      <div className={selectedStockItem.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                      {selectedStockItem.status ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {selectedStockItem.created_at ? new Date(selectedStockItem.created_at).toLocaleString() : "Not available"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {selectedStockItem.updated_at ? new Date(selectedStockItem.updated_at).toLocaleString() : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button 
                onClick={handleViewClose}
                className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Close
              </button>
              <Link 
                href={`/dashboard/inventory/stock-items/edit/${selectedStockItem.id}`}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all btn-primary"
                onClick={handleViewClose}
              >
                Edit Stock Item
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedStockItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Stock Item</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedStockItem.name}</span>? 
                This action cannot be undone.
              </p>
              
              {/* Stock Item Info */}
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedStockItem.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedStockItem.description || 'No description'}</p>
                    <p className="text-xs text-gray-400 dark:text-white">ID: {selectedStockItem.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button 
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Stock Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
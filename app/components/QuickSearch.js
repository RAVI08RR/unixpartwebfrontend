"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Maximize2, Package, FileText, User, Receipt, Calendar, DollarSign, Scissors } from "lucide-react";
import { poItemService } from "@/app/lib/services/poItemService";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { useRouter } from "next/navigation";

export default function QuickSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Item");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [allInvoices, setAllInvoices] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  
  // Dismantle states
  const [dismantleStockNumber, setDismantleStockNumber] = useState("");
  const [dismantleSearchResults, setDismantleSearchResults] = useState([]);
  const [isDismantleSearching, setIsDismantleSearching] = useState(false);

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

  // Load all invoices when Invoice tab is opened
  useEffect(() => {
    const loadAllInvoices = async () => {
      if (activeTab !== "Invoice" || allInvoices.length > 0) return;
      
      setIsLoadingInvoices(true);
      try {
        const invoices = await invoiceService.getAll(0, 100);
        const invoiceList = Array.isArray(invoices) ? invoices : (invoices?.data || []);
        setAllInvoices(invoiceList);
      } catch (error) {
        console.error('Failed to load invoices:', error);
      } finally {
        setIsLoadingInvoices(false);
      }
    };

    loadAllInvoices();
  }, [activeTab, allInvoices.length]);

  // Filter invoices based on search query
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return allInvoices;
    
    const query = searchQuery.toLowerCase();
    return allInvoices.filter(invoice => 
      invoice.invoice_number?.toLowerCase().includes(query) ||
      invoice.customer?.full_name?.toLowerCase().includes(query) ||
      invoice.customer?.customer_code?.toLowerCase().includes(query)
    );
  }, [searchQuery, allInvoices]);

  // Search for PO items by stock number or item name using dropdown API
  useEffect(() => {
    const searchPOItem = async () => {
      if (!searchQuery.trim() || activeTab !== "Item") {
        setSearchResults(null);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        // Use dropdown API for better search with suggestions
        const result = await poItemService.getDropdown(searchQuery.trim());
        // The dropdown API returns an array of items
        if (result && result.length > 0) {
          setSearchResults(result); // Store all results for suggestions
        } else {
          setSearchError('No items found matching your search');
          setSearchResults(null);
        }
      } catch (error) {
        setSearchError(error.message);
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchPOItem, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  // Search for dismantle items
  useEffect(() => {
    const searchDismantleItems = async () => {
      if (!dismantleStockNumber.trim() || activeTab !== "Actions") {
        setDismantleSearchResults([]);
        return;
      }

      setIsDismantleSearching(true);

      try {
        const result = await poItemService.getDropdown(dismantleStockNumber.trim());
        if (result && result.length > 0) {
          setDismantleSearchResults(result.slice(0, 3)); // Show top 3 results
        } else {
          setDismantleSearchResults([]);
        }
      } catch (error) {
        console.error('Dismantle search error:', error);
        setDismantleSearchResults([]);
      } finally {
        setIsDismantleSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchDismantleItems, 300);
    return () => clearTimeout(timeoutId);
  }, [dismantleStockNumber, activeTab]);

  const tabs = ["Item", "Invoice", "Create", "Actions"];

  const handleDismantleItem = async (stockNumber) => {
    // Navigate to the dismantle page or open a modal
    // For now, let's navigate to the PO item details page where dismantle can be done
    try {
      const item = await poItemService.getByStockNumber(stockNumber);
      if (item && item.id) {
        router.push(`/dashboard/inventory/purchase-orders/items/${item.id}`);
        setIsOpen(false);
      }
    } catch (error) {
      alert('Item not found: ' + error.message);
    }
  };

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
            className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl w-full max-w-3xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden"
            style={{ maxHeight: "90vh" }}
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
            <div className="px-8 pb-8 flex-1 min-h-auto quick-search-box" >
              <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-6 h-full flex flex-col">
                {activeTab === "Invoice" ? (
                  <div className="flex flex-col h-full overflow-hidden">
                    {isLoadingInvoices ? (
                      <div className="flex flex-col items-center justify-center py-12 flex-1">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold text-gray-500">Loading invoices...</p>
                      </div>
                    ) : filteredInvoices.length > 0 ? (
                      <div className="flex flex-col h-full min-h-0">
                        <div className="flex items-center justify-between shrink-0 mb-3">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white">
                            {filteredInvoices.length} Invoice{filteredInvoices.length > 1 ? 's' : ''} {searchQuery ? 'Found' : ''} {filteredInvoices.length > 3 && '(Showing top 3)'}
                          </h3>
                        </div>
                        
                        <div className="space-y-2 overflow-y-auto min-h-0 pr-2">
                          {filteredInvoices.slice(0, 3).map((invoice) => (
                            <div 
                              key={invoice.id}
                              onClick={() => {
                                router.push(`/dashboard/sales/invoices/view/${invoice.id}`);
                                setIsOpen(false);
                              }}
                              className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 cursor-pointer transition-all hover:shadow-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <p className="text-base font-black text-gray-900 dark:text-white">
                                      {invoice.invoice_number}
                                    </p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      invoice.invoice_status === 'paid' || invoice.invoice_status === 'saved and paid'
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : invoice.invoice_status === 'overdue'
                                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                    }`}>
                                      {invoice.invoice_status || 'Pending'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {invoice.customer?.full_name || `Customer #${invoice.customer_id}`}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-black text-gray-900 dark:text-white">
                                    AED {parseFloat(invoice.invoice_total || 0).toFixed(2)}
                                  </p>
                                  {parseFloat(invoice.outstanding_amount || 0) > 0 && (
                                    <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-1">
                                      Due: AED {parseFloat(invoice.outstanding_amount || 0).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : searchQuery ? (
                      <div className="text-center py-12 flex-1 flex flex-col justify-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                          No Invoices Found
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No invoices match "{searchQuery}"
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12 flex-1 flex flex-col justify-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                          No Invoices
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No invoices available
                        </p>
                      </div>
                    )}
                  </div>
                ) : activeTab === "Item" && searchQuery ? (
                  <div className="flex flex-col h-full overflow-hidden">
                    {isSearching ? (
                      <div className="flex flex-col items-center justify-center py-12 flex-1">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold text-gray-500">Searching for "{searchQuery}"...</p>
                      </div>
                    ) : searchError ? (
                      <div className="text-center py-12 flex-1 flex flex-col justify-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                          Item Not Found
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchError}
                        </p>
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      <div className="flex flex-col h-full min-h-0">
                        <div className="flex items-center justify-between shrink-0 mb-3">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white">
                            {searchResults.length} Item{searchResults.length > 1 ? 's' : ''} Found {searchResults.length > 3 && '(Showing top 3)'}
                          </h3>
                        </div>
                        
                        <div className="space-y-3 overflow-y-auto min-h-0 pr-2">
                          {searchResults.slice(0, 3).map((item) => (
                            <div 
                              key={item.id}
                              className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="text-base font-black text-gray-900 dark:text-white">
                                      {item.stock_number}
                                    </p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      item.status === 'available' 
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : item.status === 'sold'
                                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : item.status === 'reserved'
                                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                    }`}>
                                      {item.status || 'Unknown'}
                                    </span>
                                  </div>
                                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {item.item_name || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {item.branch_name || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => {
                                    router.push(`/dashboard/inventory/purchase-orders/items/${item.id}`);
                                    setIsOpen(false);
                                  }}
                                  className="flex-1 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-xs hover:opacity-90 transition-all"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.stock_number);
                                    alert('Stock number copied!');
                                  }}
                                  className="px-3 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : activeTab === "Create" ? (
                  <div className="text-center py-8 flex-1 flex flex-col justify-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Package className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                      Create New
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                      Quick actions to create new records
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <button
                        onClick={() => {
                          router.push('/dashboard/sales/invoices/add');
                          setIsOpen(false);
                        }}
                        className="bg-white dark:bg-zinc-900 rounded-xl p-6 border-2 border-gray-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 transition-all hover:shadow-lg group"
                      >
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">
                          New Invoice
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Create invoice
                        </p>
                      </button>
                      
                      <button
                        onClick={() => {
                          router.push('/dashboard/inventory/purchase-orders/add');
                          setIsOpen(false);
                        }}
                        className="bg-white dark:bg-zinc-900 rounded-xl p-6 border-2 border-gray-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 transition-all hover:shadow-lg group"
                      >
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">
                          New Purchase Order
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Create PO
                        </p>
                      </button>
                    </div>
                  </div>
                ) : activeTab === "Actions" ? (
                  <div className="text-center py-8 flex-1 flex flex-col justify-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Scissors className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                      Dismantle Item
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Enter the stock number of the item you want to dismantle.
                    </p>
                    
                    {/* Dismantle Search Input */}
                    <div className="max-w-md mx-auto w-full relative">
                      <input
                        type="text"
                        placeholder="Enter stock number..."
                        value={dismantleStockNumber}
                        onChange={(e) => setDismantleStockNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
                      />
                      
                      {/* Dropdown Results */}
                      {dismantleStockNumber && dismantleSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg max-h-60 overflow-y-auto z-10">
                          {dismantleSearchResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setDismantleStockNumber(item.stock_number);
                                setDismantleSearchResults([]);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-zinc-800 last:border-b-0"
                            >
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {item.stock_number}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {item.item_name || 'N/A'}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Dismantle Button */}
                    <button
                      onClick={() => handleDismantleItem(dismantleStockNumber)}
                      disabled={!dismantleStockNumber.trim() || isDismantleSearching}
                      className="mt-6 mx-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-all disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Scissors className="w-4 h-4" />
                      Dismantle
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 flex-1 flex flex-col justify-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                      {activeTab === "Item" ? "Search for Items" : activeTab === "Invoice" ? "Loading Invoices..." : "Start Searching"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      {activeTab === "Item" 
                        ? "Enter a stock number or item name to search for PO items"
                        : activeTab === "Invoice"
                        ? "All invoices will appear here"
                        : "Use the tabs above to search or create new records"
                      }
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

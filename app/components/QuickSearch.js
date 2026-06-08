"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Maximize2, Package, FileText, User, Receipt, Calendar, DollarSign, Scissors, Camera } from "lucide-react";
import QRScannerModal from "./QRScannerModal";
import { poItemService } from "@/app/lib/services/poItemService";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/Toast";

export default function QuickSearch() {
  const router = useRouter();
  const { success, error: showError } = useToast();
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
  
  // Item details modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLoadingItemDetails, setIsLoadingItemDetails] = useState(false);
  
  // Scanner states
  const [isMainScannerOpen, setIsMainScannerOpen] = useState(false);
  const [isDismantleScannerOpen, setIsDismantleScannerOpen] = useState(false);

  const handleMainScanSuccess = (decodedText) => {
    setSearchQuery(decodedText);
    setIsMainScannerOpen(false);
    success("Scanned successfully!");
  };

  const handleDismantleScanSuccess = (decodedText) => {
    setDismantleStockNumber(decodedText);
    setIsDismantleScannerOpen(false);
    success("Scanned successfully!");
  };

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
      const query = searchQuery.trim();
      if (!query || activeTab !== "Item") {
        setSearchResults(null);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        // Special Case: Check if it looks like a full stock number (e.g. AUH-SUP-0012-AA00001)
        // Usually contains multiple hyphens and is long
        const isFullStockNumber = query.split('-').length >= 3;
        let result = [];

        if (isFullStockNumber) {
          try {
            const item = await poItemService.getByStockNumber(query);
            if (item) {
              result = [item];
            }
          } catch (e) {
            // Fallback to dropdown if exact stock number fails
          }
        }

        // If no direct result, use dropdown API for suggestions
        if (result.length === 0) {
          result = await poItemService.getDropdown(query);
        }
        
        if (result && result.length > 0) {
          // Fetch full details for the first 3 items to get status and branch info
          const topItems = result.slice(0, 3);
          const detailedItems = await Promise.all(
            topItems.map(async (item) => {
              try {
                // If nested fields are missing, fetch full details
                if (!item.status || !item.po_id || !item.stock_item) {
                  return await poItemService.getById(item.id);
                }
                return item;
              } catch (err) {
                return item;
              }
            })
          );
          
          setSearchResults(detailedItems);
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

  const handleViewItemDetails = async (item) => {
    // If we have po_id, redirect to the items list page with item_id for auto-open
    if (item.po_id) {
      router.push(`/dashboard/inventory/purchase-orders/items/${item.po_id}?item_id=${item.id}&stock=${item.stock_number}`);
      setIsOpen(false);
    } else {
      // Fallback: Show modal if po_id is missing
      setIsLoadingItemDetails(true);
      try {
        const itemDetails = await poItemService.getById(item.id);
        setSelectedItem(itemDetails);
        setIsItemModalOpen(true);
      } catch (error) {
        showError('Failed to load item details: ' + error.message);
      } finally {
        setIsLoadingItemDetails(false);
      }
    }
  };

  const handleDismantleItem = async (stockNumber) => {
    try {
      const item = await poItemService.getByStockNumber(stockNumber);
      if (item && item.id) {
        await poItemService.dismantle(item.id);
        success(`Item ${stockNumber} dismantled successfully`);
        // Clear the search input
        setDismantleStockNumber("");
        setDismantleSearchResults([]);
      }
    } catch (error) {
      showError('Failed to dismantle item: ' + error.message);
    }
  };

  return (
    <>
      {/* Floating Quick Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl shadow-red-600/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-50 group"
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
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-2xl overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all shrink-0 ${
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
              <div className="relative flex items-center">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Invoice, Stock, Customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-14 pr-16 py-5 bg-gray-50 dark:bg-zinc-800/50 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={() => setIsMainScannerOpen(true)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 bg-gray-200 dark:bg-zinc-700 hover:bg-red-600 hover:text-white rounded-xl transition-all text-gray-600 dark:text-gray-300"
                  title="Scan Barcode/QR"
                >
                  <Camera className="w-5 h-5" />
                </button>
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
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                      (item.status || item.po_item_status || 'unknown')?.toLowerCase() === 'in_stock' 
                                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                        : (item.status || item.po_item_status)?.toLowerCase() === 'sold'
                                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : (item.status || item.po_item_status)?.toLowerCase() === 'reserved'
                                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                    }`}>
                                      {(item.status || item.po_item_status)?.toLowerCase() === 'in_stock' ? 'Sell' : (item.status || item.po_item_status)?.toLowerCase() === 'sold' ? 'Sold' : (item.status || item.po_item_status)?.replace('_', ' ') || 'Unknown'}
                                    </span>
                                  </div>
                                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {item.item_name || item.stock_item?.name || item.label || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {item.branch_name || item.current_branch?.branch_name || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 mt-3">
                                {/* Sell Button - Only show if in_stock */}
                                {(item.status || item.po_item_status)?.toLowerCase() === 'in_stock' && (
                                  <button
                                    onClick={() => {
                                      router.push(`/dashboard/sales/invoices/add?item=${item.id}&stock=${item.stock_number}`);
                                      setIsOpen(false);
                                    }}
                                    className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                                  >
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Sell
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleViewItemDetails(item)}
                                  disabled={isLoadingItemDetails}
                                  className={`${(item.status || item.po_item_status)?.toLowerCase() === 'in_stock' ? 'flex-1' : 'flex-1'} px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50`}
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.stock_number);
                                    success('Stock number copied!');
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
                    <div className="max-w-md mx-auto w-full relative flex items-center">
                      <input
                        type="text"
                        placeholder="Enter stock number..."
                        value={dismantleStockNumber}
                        onChange={(e) => setDismantleStockNumber(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-400"
                      />
                      <button
                        onClick={() => setIsDismantleScannerOpen(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white rounded-lg transition-all text-gray-500 dark:text-gray-400"
                        title="Scan Barcode/QR"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      
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

      {/* Item Details Modal */}
      {isItemModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                    Inventory Item Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    STOCK #: {selectedItem.stock_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Top Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Quantity</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{selectedItem.quantity}</p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    selectedItem.status === 'available' || selectedItem.status === 'in_stock'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : selectedItem.status === 'sold'
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : selectedItem.status === 'reserved'
                      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                  }`}>
                    {selectedItem.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Branch</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">
                    {selectedItem.current_branch?.branch_name || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                    Product Information
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Item Name</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedItem.stock_item?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Stock Number</p>
                    <p className="text-base font-bold text-red-600 dark:text-red-400">
                      {selectedItem.stock_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">PO Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedItem.po_description || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Branch Information */}
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                    Branch Information
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Branch Code</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedItem.current_branch?.branch_code || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Branch Name</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedItem.current_branch?.branch_name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sale Information (if sold) */}
              {selectedItem.invoice_items && selectedItem.invoice_items.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
                      Sale Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {selectedItem.invoice_items.map((invoiceItem, index) => (
                      <div key={index} className="bg-white dark:bg-zinc-900 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Invoice Number</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {invoiceItem.invoice?.invoice_number || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Sale Amount</p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                              AED {parseFloat(invoiceItem.sale_amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Traceability */}
              <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide mb-3">
                  Traceability
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">PO ID</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      #{selectedItem.po_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Last Updated</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedItem.updated_at ? new Date(selectedItem.updated_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => {
                  router.push(`/dashboard/inventory/purchase-orders/view/${selectedItem.po_id}`);
                  setIsItemModalOpen(false);
                  setIsOpen(false);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all"
              >
                View Purchase Order
              </button>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="px-4 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <QRScannerModal 
        isOpen={isMainScannerOpen} 
        onClose={() => setIsMainScannerOpen(false)} 
        onScanSuccess={handleMainScanSuccess} 
      />
      <QRScannerModal 
        isOpen={isDismantleScannerOpen} 
        onClose={() => setIsDismantleScannerOpen(false)} 
        onScanSuccess={handleDismantleScanSuccess} 
      />
    </>
  );
}

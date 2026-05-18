"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Maximize2, Package, FileText, User, Receipt, Calendar, DollarSign } from "lucide-react";
import { poItemService } from "@/app/lib/services/poItemService";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { useRouter } from "next/navigation";

export default function QuickSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Item");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [invoiceResults, setInvoiceResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

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

  // Search for PO items by stock number
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
        const result = await poItemService.getByStockNumber(searchQuery.trim());
        setSearchResults(result);
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

  // Search for invoices by invoice number
  useEffect(() => {
    const searchInvoice = async () => {
      if (!searchQuery.trim() || activeTab !== "Invoice") {
        setInvoiceResults(null);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const result = await invoiceService.getByNumber(searchQuery.trim());
        setInvoiceResults(result);
      } catch (error) {
        setSearchError(error.message);
        setInvoiceResults(null);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchInvoice, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

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
              <div className="bg-gray-50 dark:bg-zinc-800/30 rounded-2xl p-8 min-h-[300px]">
                {searchQuery && activeTab === "Invoice" ? (
                  <div>
                    {isSearching ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold text-gray-500">Searching for invoice "{searchQuery}"...</p>
                      </div>
                    ) : searchError ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                          Invoice Not Found
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchError}
                        </p>
                      </div>
                    ) : invoiceResults ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white">
                            Invoice Found
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            invoiceResults.invoice_status === 'paid' || invoiceResults.invoice_status === 'saved and paid'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                              : invoiceResults.invoice_status === 'overdue'
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {invoiceResults.invoice_status || 'Pending'}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-800">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Invoice Number</p>
                              <p className="text-base font-black text-gray-900 dark:text-white">{invoiceResults.invoice_number}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Invoice Date</p>
                              <p className="text-base font-bold text-gray-700 dark:text-gray-300">
                                {invoiceResults.invoice_date ? new Date(invoiceResults.invoice_date).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Customer</p>
                              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {invoiceResults.customer?.full_name || `Customer #${invoiceResults.customer_id}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Amount</p>
                              <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                                AED {parseFloat(invoiceResults.invoice_total || 0).toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Outstanding</p>
                              <p className="text-base font-bold text-red-600 dark:text-red-400">
                                AED {parseFloat(invoiceResults.outstanding_amount || 0).toFixed(2)}
                              </p>
                            </div>
                            {(invoiceResults.invoice_items || invoiceResults.items) && (
                              <div className="col-span-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Items</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                  {(invoiceResults.invoice_items || invoiceResults.items || []).length} item(s)
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6 flex gap-3">
                            <button
                              onClick={() => {
                                router.push(`/dashboard/sales/invoices/view/${invoiceResults.id}`);
                                setIsOpen(false);
                              }}
                              className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                            >
                              View Invoice
                            </button>
                            <button
                              onClick={() => {
                                router.push(`/dashboard/sales/invoices/edit/${invoiceResults.id}`);
                                setIsOpen(false);
                              }}
                              className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : searchQuery && activeTab === "Item" ? (
                  <div>
                    {isSearching ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold text-gray-500">Searching for "{searchQuery}"...</p>
                      </div>
                    ) : searchError ? (
                      <div className="text-center py-12">
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
                    ) : searchResults ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white">
                            Item Found
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            searchResults.status === 'available' 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                              : searchResults.status === 'sold'
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                              : searchResults.status === 'reserved'
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                          }`}>
                            {searchResults.status || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-800">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Stock Number</p>
                              <p className="text-base font-black text-gray-900 dark:text-white">{searchResults.stock_number}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Current Branch</p>
                              <p className="text-base font-bold text-gray-700 dark:text-gray-300">
                                {searchResults.current_branch?.branch_name || searchResults.current_branch?.branch_code || 'N/A'}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Item Name</p>
                              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {searchResults.stock_item?.name || searchResults.item_name || 'N/A'}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Description</p>
                              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {searchResults.po_description || searchResults.stock_item?.description || 'N/A'}
                              </p>
                            </div>
                            {searchResults.purchase_price && (
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Purchase Price</p>
                                <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                                  AED {parseFloat(searchResults.purchase_price || 0).toFixed(2)}
                                </p>
                              </div>
                            )}
                            {searchResults.sale_price && (
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Sale Price</p>
                                <p className="text-base font-bold text-green-600 dark:text-green-400">
                                  AED {parseFloat(searchResults.sale_price || 0).toFixed(2)}
                                </p>
                              </div>
                            )}
                            {searchResults.invoice_items && searchResults.invoice_items.length > 0 && (
                              <div className="col-span-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Sold In Invoice</p>
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                                  <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                                    {searchResults.invoice_items[0].invoice?.invoice_number || 'N/A'}
                                  </p>
                                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                                    Sale Amount: AED {parseFloat(searchResults.invoice_items[0].sale_amount || 0).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            )}
                            {searchResults.supplier_name && (
                              <div className="col-span-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Supplier</p>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{searchResults.supplier_name}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6 flex gap-3">
                            <button
                              onClick={() => {
                                router.push(`/dashboard/inventory/purchase-orders/items/${searchResults.id}`);
                                setIsOpen(false);
                              }}
                              className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                            >
                              View Details
                            </button>
                            {searchResults.invoice_items && searchResults.invoice_items.length > 0 && (
                              <button
                                onClick={() => {
                                  router.push(`/dashboard/sales/invoices/view/${searchResults.invoice_items[0].invoice_id}`);
                                  setIsOpen(false);
                                }}
                                className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                              >
                                View Invoice
                              </button>
                            )}
                            <button
                              onClick={() => {
                                // Copy stock number to clipboard
                                navigator.clipboard.writeText(searchResults.stock_number);
                                alert('Stock number copied to clipboard!');
                              }}
                              className="px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                            >
                              Copy Stock #
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                      Searching for "{searchQuery}"
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Search functionality for {activeTab} will be implemented
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white mb-2">
                      Start typing to search
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      {activeTab === "Item" 
                        ? "Enter a stock number to search for PO items"
                        : "Search for invoices, stock items, customers, or use the tabs above to access quick actions"
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

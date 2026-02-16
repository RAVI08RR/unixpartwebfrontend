"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Receipt, MoreVertical, Search, 
  Filter, Download, Plus, ChevronLeft, ChevronRight,
  DollarSign, Pencil, Trash2, Check, X, Eye, Calendar,
  User, Building2
} from "lucide-react";
import { useInvoices } from "@/app/lib/hooks/useInvoices";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { customerService } from "@/app/lib/services/customerService";
import { getAuthToken } from "@/app/lib/api";

function InvoiceManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Initialize filters from URL params after component mounts
  useEffect(() => {
    if (searchParams) {
      const urlStatus = searchParams.get('status');
      const urlCustomer = searchParams.get('customer');
      
      if (urlStatus) setStatusFilter(urlStatus);
      if (urlCustomer) setCustomerFilter(urlCustomer);
    }
  }, [searchParams]);
  
  // Data Fetching with API-level filtering
  const itemsPerPage = 8;
  
  // Convert status filter to API parameter
  const getApiStatusParam = (statusFilter) => {
    if (statusFilter === "Active") return "true";
    if (statusFilter === "Inactive") return "false";
    return null; // "All" case
  };
  
  // Convert customer filter to API parameter
  const getApiCustomerParam = (customerFilter) => {
    return customerFilter === "All" ? null : customerFilter;
  };
  
  const { invoices: apiInvoices, isLoading, isError, mutate } = useInvoices(
    0, 
    100, 
    getApiCustomerParam(customerFilter),
    getApiStatusParam(statusFilter)
  );
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    customerService.getAll().then(data => {
      if (data && data.length > 0) setCustomers(data);
    }).catch(err => console.error("Failed to fetch customers", err));
  }, []);

  // Update URL parameters when filters change
  const updateUrlParams = (status, customer) => {
    const params = new URLSearchParams();
    
    // Map status names to boolean values for API
    if (status !== "All") {
      if (status === "Active") {
        params.set('status', 'true');
      } else if (status === "Inactive") {
        params.set('status', 'false');
      }
    }
    
    if (customer !== "All") params.set('customer', customer);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/dashboard/sales/invoices${newUrl}`, { scroll: false });
  };
  
  // Handle Data Selection (API only) - Fixed for hydration
  const invoices = useMemo(() => {
    // During SSR, always return empty array to prevent hydration mismatch
    if (typeof window === 'undefined') return [];

    const token = getAuthToken();
    if (!token) { 
      // If no token, return empty array - user should be redirected to login
      return [];
    }
    
    // Log the data state for debugging
    console.log("INVOICE-DASHBOARD DATA DEBUG:", {
      hasApiData: !!apiInvoices,
      apiCount: apiInvoices?.length,
      hasToken: !!token,
      isLoading,
      isError
    });
    
    // If we have API data, use it
    if (apiInvoices) {
        // Handle both array and object responses
        const data = Array.isArray(apiInvoices) ? apiInvoices : (apiInvoices?.invoices || []);
        return data;
    }

    // If no API data, return empty array
    return [];
  }, [apiInvoices, isError, isLoading]);

  // Add client-side mounting state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset to first page when invoices list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [invoices.length]);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Filter and search logic (API handles status and customer filtering)
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(invoice => {
      const matchesSearch = 
        (invoice.invoice_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (invoice.invoice_notes?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [searchQuery, invoices]);

  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // Action handlers
  const handleEdit = (invoice) => {
    router.push(`/dashboard/sales/invoices/edit/${invoice.id}`);
    setMenuOpenId(null);
  };

  // Modal handlers
  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteClick = (invoice) => {
    setSelectedInvoice(invoice);
    setDeleteModalOpen(true);
    setMenuOpenId(null);
  };

  const confirmDelete = async () => {
    if (!selectedInvoice) return;
    
    try {
      await invoiceService.delete(selectedInvoice.id);
      mutate();
      setDeleteModalOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error("Failed to delete invoice", error);
      alert("Failed to delete invoice");
    }
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  // Helper function to get customer name
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.full_name : `Customer #${customerId}`;
  };

  // Helper function to get customer invoice link
  const getCustomerInvoiceLink = (customerId) => {
    return `/dashboard/sales/invoices?customer=${customerId}`;
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    
    try {
      // Handle very long decimal strings by parsing and formatting
      let numAmount;
      
      if (typeof amount === 'string') {
        // Remove leading zeros and handle very long strings
        const cleanAmount = amount.replace(/^[+-]?0+/, '') || '0';
        
        // If the string is extremely long, truncate it to a reasonable length
        if (cleanAmount.length > 15) {
          // Take first 10 digits and add decimal point
          const truncated = cleanAmount.substring(0, 10) + '.' + cleanAmount.substring(10, 12);
          numAmount = parseFloat(truncated);
        } else {
          numAmount = parseFloat(cleanAmount);
        }
      } else {
        numAmount = parseFloat(amount);
      }
      
      if (isNaN(numAmount)) return "₹0.00";
      
      // Cap extremely large numbers for display
      if (numAmount > 999999999) {
        return "₹999M+";
      }
      
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numAmount);
    } catch (error) {
      console.warn('Currency formatting error:', error, 'for amount:', amount);
      return "₹0.00";
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Show loading state only after component is mounted to prevent hydration mismatch
  if (!isMounted || (isLoading && (!invoices || invoices.length === 0))) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Invoice Management</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your sales invoices</p>
              {(statusFilter !== "All" || customerFilter !== "All") && (
                <div className="flex items-center gap-2">
                  {statusFilter !== "All" && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                      Status: {statusFilter}
                    </span>
                  )}
                  {customerFilter !== "All" && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                      Customer: {customers.find(c => c.id.toString() === customerFilter)?.full_name || customerFilter} ({filteredInvoices.length} invoices)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="text-gray-500">Loading invoices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Invoice Management</h1>
          <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your sales invoices</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by invoice number, notes..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Status Filter */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Status</h4>
                    <div className="space-y-1">
                      {["All", "Active", "Inactive"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setCurrentPage(1);
                            updateUrlParams(status, customerFilter);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === status 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {status === "All" ? "All Status" : status}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Customer Filter */}
                  <div className="mb-3">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Customer</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      <button
                        onClick={() => {
                          setCustomerFilter("All");
                          setCurrentPage(1);
                          updateUrlParams(statusFilter, "All");
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          customerFilter === "All" 
                            ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        All Customers
                      </button>
                      {customers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => {
                            setCustomerFilter(customer.id.toString());
                            setCurrentPage(1);
                            updateUrlParams(statusFilter, customer.id.toString());
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            customerFilter === customer.id.toString() 
                              ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {customer.full_name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Clear Filters */}
                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setStatusFilter("All");
                        setCustomerFilter("All");
                        setCurrentPage(1);
                        setIsFilterOpen(false);
                        updateUrlParams("All", "All");
                      }}
                      className="w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <Link href="/dashboard/sales/invoices/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add Invoice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full responsive-table-container">
        <div className="overflow-x-auto lg:overflow-x-visible w-full scrollbar-hide">
          <table className="w-full lg:min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Invoice</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Customer</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Amount</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Date</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Outstanding</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice, index) => {
                  return (
                    <tr key={invoice.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30"
                    style= {{borderBottom :"0.9px solid #E2E8F0"}}
                    >
                      {/* Invoice Number */}
                      <td className="px-6 py-6" data-label="Invoice">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-400 mt-1 font-medium tracking-wide">ID: {invoice.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-6" data-label="Customer">
                        <div className="space-y-1.5 min-w-[180px]">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <User className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{getCustomerName(invoice.customer_id)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-6" data-label="Amount">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                            {formatCurrency(invoice.invoice_total)}
                          </span>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Paid: {formatCurrency(invoice.paid_amount)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6" data-label="Status">
                        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-black ${
                          invoice.invoice_status === 'paid'
                            ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                            : invoice.invoice_status === 'overdue'
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                            : invoice.invoice_status === 'cancelled'
                            ? 'bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                            : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            invoice.invoice_status === 'paid' ? 'bg-green-600' : 
                            invoice.invoice_status === 'overdue' ? 'bg-red-600' :
                            invoice.invoice_status === 'cancelled' ? 'bg-gray-600' : 'bg-yellow-600'
                          }`}></div>
                          {invoice.invoice_status?.charAt(0).toUpperCase() + invoice.invoice_status?.slice(1) || "Pending"}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-6" data-label="Date">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                            {formatDate(invoice.invoice_date)}
                          </span>
                        </div>
                      </td>

                      {/* Outstanding */}
                      <td className="px-6 py-6" data-label="Outstanding">
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(invoice.outstanding_amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6 text-right relative" data-label="Actions">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <button 
                              onClick={() => toggleMenu(invoice.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                                menuOpenId === invoice.id 
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 bg-gray-50 dark:bg-zinc-800/50 lg:bg-transparent lg:dark:bg-transparent'
                              }`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-widest lg:hidden">Actions</span>
                              <MoreVertical className="w-5 h-5" />
                            </button>
                                
                                {menuOpenId === invoice.id && (
                                  <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                    index > paginatedInvoices.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                                  }`}>
                                    <button 
                                      onClick={() => handleView(invoice)}
                                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </button>
                                    <button 
                                      onClick={() => handleEdit(invoice)}
                                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                    >
                                      <Pencil className="w-4 h-4" />
                                      Edit Invoice
                                    </button>
                                    <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                    <button 
                                      onClick={() => handleDeleteClick(invoice)} 
                                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete Invoice
                                    </button>
                                  </div>
                                )}
                              </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No invoices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredInvoices.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredInvoices.length}</span> entries
          </p>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                    currentPage === i + 1 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' 
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Invoice Modal */}
      {viewModalOpen && selectedInvoice && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50" 
            onClick={() => setViewModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-black-100 dark:bg-black-900/20 flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Details</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedInvoice.invoice_number}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setViewModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Invoice Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Invoice Number</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedInvoice.invoice_number}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Customer</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{getCustomerName(selectedInvoice.customer_id)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Invoice Date</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(selectedInvoice.invoice_date)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                      selectedInvoice.invoice_status === 'paid'
                        ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                        : selectedInvoice.invoice_status === 'overdue'
                        ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        : selectedInvoice.invoice_status === 'cancelled'
                        ? 'bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                        : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        selectedInvoice.invoice_status === 'paid' ? 'bg-green-600' : 
                        selectedInvoice.invoice_status === 'overdue' ? 'bg-red-600' :
                        selectedInvoice.invoice_status === 'cancelled' ? 'bg-gray-600' : 'bg-yellow-600'
                      }`}></div>
                      {selectedInvoice.invoice_status?.charAt(0).toUpperCase() + selectedInvoice.invoice_status?.slice(1) || "Pending"}
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.invoice_total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(selectedInvoice.paid_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(selectedInvoice.outstanding_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Load Status */}
                {selectedInvoice.overall_load_status && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Load Status</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {selectedInvoice.overall_load_status.replace('_', ' ')}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedInvoice.invoice_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-3">
                      {selectedInvoice.invoice_notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3">
                <button 
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setViewModalOpen(false);
                    handleEdit(selectedInvoice);
                  }}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Invoice
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedInvoice && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50" 
            onClick={() => setDeleteModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Invoice</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedInvoice.invoice_number}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getCustomerName(selectedInvoice.customer_id)}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.invoice_total)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <span className={`font-semibold ${
                        selectedInvoice.invoice_status === 'paid' ? 'text-green-600 dark:text-green-400' :
                        selectedInvoice.invoice_status === 'overdue' ? 'text-red-600 dark:text-red-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {selectedInvoice.invoice_status?.charAt(0).toUpperCase() + selectedInvoice.invoice_status?.slice(1) || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this invoice? This will permanently remove the invoice and all associated data.
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function InvoiceManagementPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Invoice Management</h1>
            <p className="text-gray-400 dark:text-white text-sm font-normal">Loading invoices...</p>
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <InvoiceManagementContent />
    </Suspense>
  );
}
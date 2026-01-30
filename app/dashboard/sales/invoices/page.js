"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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

export default function InvoiceManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Data Fetching
  const itemsPerPage = 8;
  const { invoices: apiInvoices, isLoading, isError, mutate } = useInvoices(0, 100);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    customerService.getAll().then(data => {
      if (data && data.length > 0) setCustomers(data);
    }).catch(err => console.error("Failed to fetch customers", err));
  }, []);
  
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

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Filter and search logic
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(invoice => {
      const matchesSearch = 
        (invoice.invoice_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (invoice.invoice_notes?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || invoice.invoice_status === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, invoices]);

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

  // Inline Editing Handlers
  const handleEdit = (invoice) => {
    setEditingId(invoice.id);
    setEditForm({ ...invoice });
    setMenuOpenId(null);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
        // Construct a clean payload for invoice update
        const payload = {
            invoice_number: editForm.invoice_number || undefined,
            customer_id: editForm.customer_id ? parseInt(editForm.customer_id) : undefined,
            invoice_date: editForm.invoice_date || undefined,
            invoice_status: editForm.invoice_status || undefined,
            overall_load_status: editForm.overall_load_status || undefined,
            invoice_notes: editForm.invoice_notes || undefined,
        };

        // Clean up undefined fields
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        console.log("Saving Invoice Update:", { id: editingId, payload });

        await invoiceService.update(editingId, payload);
        
        // Success: Refresh and clean up
        mutate(); 
        setEditingId(null);
        setEditForm({});
        setMenuOpenId(null);
    } catch (error) {
        console.error("Update Error Details:", error);
        alert(`Update Failed: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
      if(confirm("Are you sure you want to delete this invoice?")) {
          try {
              await invoiceService.delete(id);
              mutate();
          } catch (error) {
              console.error("Failed to delete invoice", error);
              alert("Failed to delete invoice");
          }
      }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to get customer name
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.full_name : `Customer #${customerId}`;
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
            <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Manage your sales invoices</p>
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
          <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Manage your sales invoices</p>
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
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {["All", "Pending", "Paid", "Overdue", "Cancelled"].map((status) => (
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
            <Link href="/dashboard/sales/invoices/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add Invoice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Invoice</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Customer</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Amount</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Date</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Outstanding</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice, index) => {
                  const isEditing = editingId === invoice.id;
                  
                  return (
                    <tr key={invoice.id} className={`group transition-all ${isEditing ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'}`}
                    style= {{borderBottom :"0.9px solid #E2E8F0"}}
                    >
                      {/* Invoice Number */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            {isEditing ? (
                              <input 
                                type="text"
                                name="invoice_number"
                                value={editForm.invoice_number}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{invoice.invoice_number}</p>
                            )}
                            <p className="text-sm text-gray-400 mt-1 font-medium tracking-wide">ID: {invoice.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-6">
                        <div className="space-y-1.5 min-w-[180px]">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <User className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            {isEditing ? (
                              <select
                                name="customer_id"
                                value={editForm.customer_id}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Customer</option>
                                {customers.map(customer => (
                                  <option key={customer.id} value={customer.id}>{customer.full_name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{getCustomerName(invoice.customer_id)}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-6">
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
                      <td className="px-6 py-6">
                        {isEditing ? (
                           <select
                              name="invoice_status"
                              value={editForm.invoice_status}
                              onChange={handleChange}
                              className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-black focus:ring-2 focus:ring-blue-500"
                           >
                             <option value="pending">Pending</option>
                             <option value="paid">Paid</option>
                             <option value="overdue">Overdue</option>
                             <option value="cancelled">Cancelled</option>
                           </select>
                        ) : (
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
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {isEditing ? (
                            <input 
                              type="date"
                              name="invoice_date"
                              value={editForm.invoice_date}
                              onChange={handleChange}
                              className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                              {formatDate(invoice.invoice_date)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Outstanding */}
                      <td className="px-6 py-6">
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(invoice.outstanding_amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                           {isEditing ? (
                              <>
                                <button onClick={handleSave} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-xl transition-all shadow-md shadow-green-500/20" title="Save">
                                  <Check className="w-5 h-5" />
                                </button>
                                <button onClick={handleCancel} className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-500/20" title="Cancel">
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                           ) : (
                              <div className="relative">
                                <button 
                                  onClick={() => toggleMenu(invoice.id)}
                                  className={`p-2 rounded-xl transition-all ${
                                    menuOpenId === invoice.id 
                                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                  }`}
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                                
                                {menuOpenId === invoice.id && (
                                  <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                    index > paginatedInvoices.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                                  }`}>
                                    <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </button>
                                    <button 
                                      onClick={() => handleEdit(invoice)}
                                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                                    >
                                      <Pencil className="w-4 h-4" />
                                      Edit Invoice
                                    </button>
                                    <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                    <button onClick={() => handleDelete(invoice.id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                      Delete Invoice
                                    </button>
                                  </div>
                                )}
                              </div>
                           )}
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
    </div>
  );
}
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, Download, 
  ChevronLeft, ChevronRight, 
  Eye, DollarSign, Hash, Calendar, Building2, User, CreditCard, FileText, X
} from "lucide-react";
import { apiClient } from "@/app/lib/api";

export default function PaymentsReceivedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    setIsMounted(true);
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/invoices/payments/all');
      console.log('Payments response:', response);
      setPayments(response || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (invoiceId) => {
    try {
      setInvoiceLoading(true);
      const response = await apiClient.get(`/api/invoices/${invoiceId}`);
      console.log('Invoice details:', response);
      setSelectedInvoice(response);
    } catch (error) {
      console.error('Failed to fetch invoice details:', error);
      setSelectedInvoice(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    setInvoiceModalOpen(true);
    await fetchInvoiceDetails(invoiceId);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [payments.length, searchQuery, typeFilter, branchFilter]);

  // Filter and search logic
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return payments.filter(payment => {
      const searchTarget = `${payment.id || ''} ${payment.invoice?.invoice_number || ''} ${payment.received_by_user?.name || ''} ${payment.payment_notes || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "All" || payment.payment_method?.toLowerCase().replace('_', ' ') === typeFilter.toLowerCase();
      const matchesBranch = branchFilter === "All" || payment.branch?.branch_code === branchFilter;
      return matchesSearch && matchesType && matchesBranch;
    });
  }, [searchQuery, typeFilter, branchFilter, payments]);

  // Calculate total filtered amount
  const totalFilteredAmount = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => sum + (parseFloat(payment.payment_amount) || 0), 0);
  }, [filteredPayments]);

  // Get unique branches for filter
  const branches = useMemo(() => {
    const uniqueBranches = [...new Set(payments.map(p => p.branch?.branch_code).filter(Boolean))];
    return uniqueBranches;
  }, [payments]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const getPaymentTypeBadge = (type) => {
    const t = type?.toLowerCase().replace('_', ' ') || 'cash';
    const styles = {
      cash: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50',
      'bank transfer': 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50',
      'credit card': 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50',
      cheque: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50'
    };
    
    const resolvedStyle = styles[t] || 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 border border-gray-200 dark:border-zinc-700';
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${resolvedStyle}`}>
        {t}
      </span>
    );
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Payments Received</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">A log of all payments received against invoices</p>
        </div>
        
        {/* Total Filtered Amount */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 px-6 py-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50">
          <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Filtered Amount</p>
            <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300">
              AED {totalFilteredAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Payment ID, Invoice #, Collected By..."
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                {/* Type Filter */}
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Filter by Type</label>
                  <div className="space-y-1">
                    {['All', 'Cash', 'Bank Transfer', 'Credit Card', 'Cheque'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          typeFilter === type 
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Branch Filter */}
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Filter by Branch</label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setBranchFilter('All')}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        branchFilter === 'All' 
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      All Branches
                    </button>
                    {branches.map((branch) => (
                      <button
                        key={branch}
                        onClick={() => setBranchFilter(branch)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          branchFilter === branch 
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {branch}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTypeFilter('All');
                    setBranchFilter('All');
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Payment ID</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Payment Date</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Invoice #</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Payment Amount</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Received By</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Payment Method</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Payment Notes</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">Loading Payments...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => {
                  return (
                    <tr key={payment.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Hash className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">
                              PAY-{String(payment.id).padStart(3, '0')}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }) : '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                            {payment.invoice?.invoice_number || '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-black dark:text-white">
                            AED {parseFloat(payment.payment_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                              {payment.received_by_user?.name || '-'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500">
                              {payment.received_by_user?.user_code || ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        {getPaymentTypeBadge(payment.payment_method)}
                      </td>

                      <td className="px-6 py-6">
                        <span className="text-sm font-bold text-gray-600 dark:text-zinc-400 truncate max-w-[200px] block">
                          {payment.payment_notes || '-'}
                        </span>
                      </td>

                      <td className="px-6 py-6 text-right">
                        <button 
                          onClick={() => handleViewInvoice(payment.invoice_id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest italic animate-pulse">No payments found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredPayments.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredPayments.length}</span> entries
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

      {/* Invoice Details Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] max-w-4xl w-full border border-gray-100 dark:border-zinc-800 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Invoice Details</h2>
                  <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">
                    {selectedInvoice?.invoice_number || 'Loading...'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setInvoiceModalOpen(false);
                  setSelectedInvoice(null);
                }}
                className="p-3 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {invoiceLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-bold text-sm mt-4">Loading invoice details...</p>
                </div>
              ) : selectedInvoice ? (
                <>
                  {/* Invoice Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Invoice Number</label>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{selectedInvoice.invoice_number}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Invoice Date</label>
                      <p className="text-lg font-bold text-gray-700 dark:text-zinc-300">
                        {selectedInvoice.invoice_date ? new Date(selectedInvoice.invoice_date).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        }) : '-'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer</label>
                      <p className="text-lg font-bold text-gray-700 dark:text-zinc-300">
                        {selectedInvoice.customer?.customer_name || '-'}
                      </p>
                      {selectedInvoice.customer?.customer_code && (
                        <p className="text-sm text-gray-500 dark:text-zinc-500">
                          Code: {selectedInvoice.customer.customer_code}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Branch</label>
                      <p className="text-lg font-bold text-gray-700 dark:text-zinc-300">
                        {selectedInvoice.branch?.branch_name || '-'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</label>
                      <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        AED {parseFloat(selectedInvoice.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Outstanding Balance</label>
                      <p className="text-2xl font-black text-red-600 dark:text-red-400">
                        AED {parseFloat(selectedInvoice.outstanding_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Invoice Items</h3>
                      <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-zinc-700">
                              <th className="px-4 py-3 text-left text-xs font-black text-gray-400 uppercase">Item</th>
                              <th className="px-4 py-3 text-right text-xs font-black text-gray-400 uppercase">Qty</th>
                              <th className="px-4 py-3 text-right text-xs font-black text-gray-400 uppercase">Price</th>
                              <th className="px-4 py-3 text-right text-xs font-black text-gray-400 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                            {selectedInvoice.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-zinc-300">
                                  {item.stock_item?.item_name || item.description || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-zinc-300 text-right">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-zinc-300 text-right">
                                  AED {parseFloat(item.unit_price || 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-sm font-black text-gray-900 dark:text-white text-right">
                                  AED {parseFloat(item.total_price || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Payment History</h3>
                      <div className="space-y-3">
                        {selectedInvoice.payments.map((payment, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  }) : '-'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-zinc-500">
                                  {payment.payment_method?.replace('_', ' ').toUpperCase()} • {payment.received_by_user?.name || '-'}
                                </p>
                              </div>
                            </div>
                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                              AED {parseFloat(payment.payment_amount || 0).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedInvoice.notes && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Notes</label>
                      <p className="text-sm font-medium text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                        {selectedInvoice.notes}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-bold">Failed to load invoice details</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-8 border-t border-gray-100 dark:border-zinc-800">
              <button 
                onClick={() => {
                  setInvoiceModalOpen(false);
                  setSelectedInvoice(null);
                }}
                className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => window.location.href = `/dashboard/sales/invoices/view/${selectedInvoice?.id}`}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
              >
                View Full Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

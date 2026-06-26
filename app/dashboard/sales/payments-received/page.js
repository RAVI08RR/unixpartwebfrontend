"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, Download, 
  ChevronLeft, ChevronRight, 
  Eye, DollarSign, Hash, Calendar, Building2, User, CreditCard, FileText, X, RotateCcw
} from "lucide-react";
import { apiClient } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";
import { exportToExcel } from "@/app/lib/utils/exportUtils";
import useSWR from "swr";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { PERMISSIONS } from "@/app/lib/constants/permissions";
import Pagination from "@/app/components/Pagination";
import { invoiceService } from "@/app/lib/services/invoiceService";

export default function PaymentsReceivedPage() {
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Auto-expand filters if active filters exist on load
  useEffect(() => {
    if (typeFilter !== "All" || branchFilter !== "All" || supplierFilter !== "All" || userFilter !== "All" || dateRange.start || dateRange.end) {
      setIsFilterOpen(true);
    }
  }, []);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;
  const [isMounted, setIsMounted] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  
  // Load dropdown lists using dropdown spec
  const { data: dropdownBranches } = useSWR('/api/dropdown/branches', () => apiClient.get('/api/dropdown/branches'));
  const { data: dropdownSuppliers } = useSWR('/api/dropdown/suppliers', () => apiClient.get('/api/dropdown/suppliers'));
  const { data: dropdownUsers } = useSWR('/api/dropdown/users', () => apiClient.get('/api/dropdown/users'));
  const { data: salesDataRaw } = useSWR('/api/invoices/sales-data?page=1&page_size=500', () => apiClient.get('/api/invoices/sales-data', { page: 1, page_size: 500 }));

  const branches = useMemo(() => Array.isArray(dropdownBranches) ? dropdownBranches : [], [dropdownBranches]);
  const suppliers = useMemo(() => Array.isArray(dropdownSuppliers) ? dropdownSuppliers : [], [dropdownSuppliers]);
  const users = useMemo(() => Array.isArray(dropdownUsers) ? dropdownUsers : [], [dropdownUsers]);
  const salesData = useMemo(() => Array.isArray(salesDataRaw) ? salesDataRaw : [], [salesDataRaw]);

  // Build a map of invoice_number -> resolved branch & supplier info from sales data
  const invoiceBranchSupplierMap = useMemo(() => {
    const map = {};
    salesData.forEach(item => {
      const invNum = item.invoice?.invoice_number;
      if (!invNum) return;
      
      let branchCode = null;
      let branchId = null;
      let supplierCode = null;
      let supplierId = null;
      
      // Parse branch code and ID from stock number
      const stockNum = item.po_item?.stock_number;
      if (stockNum) {
        branchCode = stockNum.split('-')[0]?.toUpperCase();
        if (branchCode === 'DXB') branchId = 1;
        else if (branchCode === 'AUH') branchId = 2;
        else if (branchCode === 'SHJ') branchId = 3;
      }
      
      // Parse supplier code and ID from supplier_code
      const supCode = item.po_item?.purchase_order?.container?.supplier?.supplier_code;
      if (supCode) {
        supplierCode = supCode;
        const idNum = parseInt(supCode.replace('SUP-', ''));
        if (!isNaN(idNum)) {
          supplierId = idNum;
        }
      }
      
      if (!map[invNum]) {
        map[invNum] = { branchCode, branchId, supplierCode, supplierId };
      } else {
        if (branchCode) {
          map[invNum].branchCode = branchCode;
          map[invNum].branchId = branchId;
        }
        if (supplierCode) {
          map[invNum].supplierCode = supplierCode;
          map[invNum].supplierId = supplierId;
        }
      }
    });
    return map;
  }, [salesData]);

  useEffect(() => {
    setIsMounted(true);
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAllPayments(currentPage, PAGE_SIZE);
      console.log('Payments response:', response);
      setPayments(response?.data || []);
      setTotal(response?.total || 0);
      setTotalPages(response?.total_pages || 1);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setPayments([]);
      setTotal(0);
      setTotalPages(1);
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
  }, [searchQuery, typeFilter, branchFilter, supplierFilter, userFilter, dateRange]);

  useEffect(() => {
    const hasActive = searchQuery !== "" ||
                      typeFilter !== "All" ||
                      branchFilter !== "All" ||
                      supplierFilter !== "All" ||
                      userFilter !== "All" ||
                      (dateRange && (dateRange.start !== "" || dateRange.end !== ""));
    if (hasActive) {
      setIsFilterOpen(true);
    }
  }, [searchQuery, typeFilter, branchFilter, supplierFilter, userFilter, dateRange]);

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    return payments.filter(payment => {
      const searchTarget = `${payment.id || ''} ${payment.invoice?.invoice_number || ''} ${payment.received_by_user?.name || ''} ${payment.payment_notes || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "All" || payment.payment_method?.toLowerCase().replace('_', ' ') === typeFilter.toLowerCase();
      
      // Resolve branch & supplier IDs
      const resolvedInfo = invoiceBranchSupplierMap[payment.invoice?.invoice_number];
      const paymentBranchId = payment.branch_id || payment.branch?.id || resolvedInfo?.branchId;
      const paymentSupplierId = payment.supplier_id || payment.invoice?.supplier_id || payment.invoice?.supplier?.id || resolvedInfo?.supplierId;

      const matchesBranch = branchFilter === "All" || 
        String(paymentBranchId) === String(branchFilter) ||
        (payment.branch && String(payment.branch.id) === String(branchFilter)) ||
        payment.branch?.branch_code === branchFilter ||
        (payment.received_by_user?.branches && payment.received_by_user.branches.some(b => String(b.id) === String(branchFilter)));
      
      // Date range match
      let matchesDateRange = true;
      if (payment.payment_date) {
        const pDate = new Date(payment.payment_date);
        if (dateRange.start) {
          const sDate = new Date(dateRange.start);
          sDate.setHours(0,0,0,0);
          if (pDate < sDate) matchesDateRange = false;
        }
        if (dateRange.end) {
          const eDate = new Date(dateRange.end);
          eDate.setHours(23,59,59,999);
          if (pDate > eDate) matchesDateRange = false;
        }
      }
      
      // Supplier match
      const matchesSupplier = supplierFilter === "All" || 
        String(paymentSupplierId) === String(supplierFilter) ||
        (payment.invoice?.supplier && String(payment.invoice.supplier.id) === String(supplierFilter)) ||
        payment.invoice?.supplier?.name === supplierFilter ||
        payment.invoice?.supplier?.supplier_code === supplierFilter;
      
      // User match
      const matchesUser = userFilter === "All" || 
        (payment.received_by_user && String(payment.received_by_user.id) === String(userFilter)) ||
        payment.received_by_user?.name === userFilter ||
        payment.received_by_user?.user_code === userFilter;
        
      return matchesSearch && matchesType && matchesBranch && matchesDateRange && matchesSupplier && matchesUser;
    });
  }, [searchQuery, typeFilter, branchFilter, dateRange, supplierFilter, userFilter, payments, invoiceBranchSupplierMap]);

  // Calculate total filtered amount
  const totalFilteredAmount = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => sum + (parseFloat(payment.payment_amount) || 0), 0);
  }, [filteredPayments]);

  const handleExport = async () => {
    try {
      const exportColumns = [
        { key: 'id', label: 'Pymt ID', formatter: (val) => `PAY-${val}` },
        { key: 'payment_date', label: 'Payment Date' },
        { key: 'invoice.invoice_number', label: 'Invoice #' },
        { key: 'payment_amount', label: 'Payment Amount', formatter: (val) => `AED ${parseFloat(val || 0).toFixed(2)}` },
        { key: 'received_by_user.name', label: 'Collected By' },
        { key: 'payment_method', label: 'Type' },
        { key: 'payment_notes', label: 'Type Notes' },
        { key: 'branch_code', label: 'Branch Code' },
        { key: 'supplier_code', label: 'Supplier Code' }
      ];
      
      const preparedData = filteredPayments.map(payment => {
        const resolvedInfo = invoiceBranchSupplierMap[payment.invoice?.invoice_number];
        return {
          ...payment,
          branch_code: payment.branch?.branch_code || resolvedInfo?.branchCode || '-',
          supplier_code: payment.invoice?.supplier?.supplier_code || resolvedInfo?.supplierCode || '-'
        };
      });
      
      await exportToExcel(
        preparedData,
        exportColumns,
        `payments-received-${new Date().toISOString().split('T')[0]}.xlsx`
      );
      success("Payments list exported successfully!");
    } catch (err) {
      console.error(err);
      error("Failed to export to Excel: " + err.message);
    }
  };

  // Pagination logic (hybrid server/client)
  const displayTotalPages = filteredPayments.length > PAGE_SIZE ? Math.ceil(filteredPayments.length / PAGE_SIZE) : totalPages;
  const displayTotal = filteredPayments.length > PAGE_SIZE ? filteredPayments.length : total;
  const paginatedPayments = filteredPayments.length > PAGE_SIZE
    ? filteredPayments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filteredPayments;

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
    <ProtectedRoute permission={PERMISSIONS.INVOICES.VIEW}>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Payments Received</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal mt-1">A log of all payments received against invoices.</p>
        </div>
        
        {/* Total Filtered Amount & Export Button */}
        <div className="flex items-center gap-6 justify-end">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Total Filtered Amount</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              AED {totalFilteredAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all filter-button ${
              isFilterOpen 
                ? 'bg-red-600 text-white shadow-red-600/10' 
                : 'bg-black dark:bg-white text-white dark:text-black shadow-black/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm shrink-0 active:scale-95"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Filters Section Card */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-zinc-800/50">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the payments list below.</p>
            </div>
            {(searchQuery !== "" || typeFilter !== "All" || branchFilter !== "All" || supplierFilter !== "All" || userFilter !== "All" || dateRange.start !== "" || dateRange.end !== "") && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('All');
                  setBranchFilter('All');
                  setSupplierFilter('All');
                  setUserFilter('All');
                  setDateRange({ start: '', end: '' });
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="space-y-4 pt-2">
            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Search by Invoice # */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by Invoice #..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/30 dark:focus:ring-red-500/20 transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Pick Date Range */}
              <div className="relative">
                <button 
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="w-full flex items-center gap-2 px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-all text-left shadow-sm justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {dateRange.start || dateRange.end 
                        ? `${dateRange.start ? new Date(dateRange.start).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : ''} - ${dateRange.end ? new Date(dateRange.end).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : ''}`
                        : "Pick a date range"
                      }
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isDatePickerOpen ? 'rotate-90' : ''}`} />
                </button>

                {isDatePickerOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDatePickerOpen(false)} />
                    <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[200] p-4 animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Start Date</label>
                        <input 
                          type="date"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">End Date</label>
                        <input 
                          type="date"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <button 
                          onClick={() => { setDateRange({ start: '', end: '' }); setIsDatePickerOpen(false); }}
                          className="px-3 py-1.5 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600"
                        >
                          Clear
                        </button>
                        <button 
                          onClick={() => setIsDatePickerOpen(false)}
                          className="px-3 py-1.5 text-[10px] font-black uppercase bg-black text-white dark:bg-white dark:text-black rounded-lg"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Filter by Type */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Filter by Branch */}
              <div>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Supplier */}
              <div>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by User */}
              <div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Main Table / Mobile Cards */}
      <div className="bg-white dark:bg-zinc-900 md:rounded-[32px] border-y md:border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20">
        {/* Mobile Cards */}
        <div className="block lg:hidden divide-y divide-gray-100 dark:divide-zinc-800">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
              <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase">Loading payments...</p>
            </div>
          ) : paginatedPayments.length > 0 ? (
            paginatedPayments.map((payment, index) => {
              const resolvedInfo = invoiceBranchSupplierMap[payment.invoice?.invoice_number];
              const branchCode = payment.branch?.branch_code || resolvedInfo?.branchCode || '-';
              const supplierCode = payment.invoice?.supplier?.supplier_code || resolvedInfo?.supplierCode || '-';
              
              return (
                <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase">PAY-{payment.id}</span>
                        {getPaymentTypeBadge(payment.payment_method)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium">
                        Invoice: <span className="font-bold text-gray-700 dark:text-zinc-300">{payment.invoice?.invoice_number || '-'}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium mt-0.5">
                        Date: {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-gray-900 dark:text-white">AED {parseFloat(payment.payment_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-gray-400 font-medium">{payment.received_by_user?.name || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">Branch Code</span>
                      <span className="font-bold text-gray-700 dark:text-zinc-300">{branchCode}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">Supplier Code</span>
                      <span className="font-bold text-gray-700 dark:text-zinc-300">{supplierCode}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-gray-400">Type Notes</span>
                      <span className="truncate block font-bold text-gray-700 dark:text-zinc-300">{payment.payment_notes || '-'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewInvoice(payment.invoice_id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Invoice</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 flex flex-col items-center gap-3">
              <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No payments found</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800">
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Pymt ID</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Payment Date</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Invoice #</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Payment Amount</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Collected By</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Type</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Type Notes</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Branch Code</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Supplier Code</th>
                <th className="px-4 py-6 text-right text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">View Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-24 text-center">
                    <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto mb-4"></div>
                    <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase">Loading payments...</p>
                  </td>
                </tr>
              ) : paginatedPayments && paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment, index) => {
                  const resolvedInfo = invoiceBranchSupplierMap[payment.invoice?.invoice_number];
                  const branchCode = payment.branch?.branch_code || resolvedInfo?.branchCode || '-';
                  const supplierCode = payment.invoice?.supplier?.supplier_code || resolvedInfo?.supplierCode || '-';
                  
                  return (
                    <tr key={index} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-black text-gray-900 dark:text-white uppercase">
                            PAY-{payment.id}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            }) : '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                            {payment.invoice?.invoice_number || '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3 h-3 text-gray-400" />
                          <span className="text-sm font-black dark:text-white">
                            AED {parseFloat(payment.payment_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-zinc-300 leading-tight">
                              {payment.received_by_user?.name || '-'}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-none">
                              {payment.received_by_user?.user_code || ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        {getPaymentTypeBadge(payment.payment_method)}
                      </td>

                      <td className="px-4 py-5">
                        <span className="text-sm font-medium text-gray-600 dark:text-zinc-400 truncate max-w-[150px] block">
                          {payment.payment_notes || '-'}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {branchCode}
                        </span>
                      </td>

                      <td className="px-4 py-5">
                        <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {supplierCode}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-right">
                        <button 
                          onClick={() => handleViewInvoice(payment.invoice_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all active:scale-95"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest italic animate-pulse">No payments found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={displayTotalPages}
          total={displayTotal}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Invoice Details Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in zoom-in duration-200 overflow-y-auto">
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
    </ProtectedRoute>
  );
}

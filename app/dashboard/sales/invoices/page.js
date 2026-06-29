"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Receipt, MoreVertical, Search,
  Filter, Download, Plus, ChevronLeft, ChevronRight,
  DollarSign, Pencil, Trash2, Check, X, Eye, Calendar,
  User, Building2, Printer, FileText, RefreshCcw
} from "lucide-react";
import { useInvoices } from "@/app/lib/hooks/useInvoices";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { customerService } from "@/app/lib/services/customerService";
import { getAuthToken, apiClient } from "@/app/lib/api";
import useSWR from "swr";
import Pagination from "@/app/components/Pagination";
import { TableContainer, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/app/components/Table";
import ExportButton from "@/app/components/ExportButton";
import { formatDateForExport, formatCurrencyForExport, formatStatusForExport } from "@/app/lib/utils/exportUtils";
import CancelReturnItemsModal from "@/app/components/CancelReturnItemsModal";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { usePermission } from "@/app/lib/hooks/usePermission";
import { PERMISSIONS } from "@/app/lib/constants/permissions";

function InvoiceManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = usePermission();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState("");
  const [stockNumberFilter, setStockNumberFilter] = useState("");
  const [userFilter, setUserFilter] = useState("All");
  const [loadStatusFilter, setLoadStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Initialize filters from URL params after component mounts
  useEffect(() => {
    if (searchParams) {
      const urlStatus = searchParams.get('status');
      const urlCustomer = searchParams.get('customer');

      if (urlStatus) {
        setStatusFilter(urlStatus);
        setIsFilterOpen(true);
      }
      if (urlCustomer) {
        setCustomerFilter(urlCustomer);
        setIsFilterOpen(true);
      }
    }
  }, [searchParams]);

  // Auto-expand filters if active filters exist on load
  useEffect(() => {
    if (statusFilter !== 'All' || customerFilter !== 'All' || branchFilter !== 'All' || invoiceNumberFilter !== '' || stockNumberFilter !== '' || userFilter !== 'All' || loadStatusFilter !== 'All' || dateRange.start || dateRange.end) {
      setIsFilterOpen(true);
    }
  }, []);

  // Data Fetching with API-level filtering and server-side pagination
  const PAGE_SIZE = 10;
  const { invoices: apiInvoices, isLoading, isError, mutate, total, totalPages } = useInvoices(
    currentPage,
    PAGE_SIZE,
    customerFilter === "All" ? null : customerFilter,
    statusFilter === "All" ? null : statusFilter.toLowerCase()
  );

  // Load dropdown lists using dropdown spec
  const { data: dropdownBranches } = useSWR('/api/dropdown/branches', () => apiClient.get('/api/dropdown/branches'));
  const { data: dropdownCustomers } = useSWR('/api/dropdown/customers', () => apiClient.get('/api/dropdown/customers'));
  const { data: dropdownUsers } = useSWR('/api/dropdown/users', () => apiClient.get('/api/dropdown/users'));
  const { data: salesDataRaw } = useSWR('/api/invoices/sales-data?page=1&page_size=500', () => apiClient.get('/api/invoices/sales-data', { page: 1, page_size: 500 }));

  const branches = useMemo(() => Array.isArray(dropdownBranches) ? dropdownBranches : [], [dropdownBranches]);
  const customers = useMemo(() => Array.isArray(dropdownCustomers) ? dropdownCustomers : [], [dropdownCustomers]);
  const users = useMemo(() => Array.isArray(dropdownUsers) ? dropdownUsers : [], [dropdownUsers]);
  const salesData = useMemo(() => Array.isArray(salesDataRaw) ? salesDataRaw : [], [salesDataRaw]);

  // Build a map of invoice_number -> resolved branch & supplier & stock numbers info
  const invoiceDetailsMap = useMemo(() => {
    const map = {};
    salesData.forEach(item => {
      const invNum = item.invoice?.invoice_number;
      if (!invNum) return;

      let branchCode = null;
      let branchId = null;
      let supplierCode = null;
      let supplierId = null;
      const stockNum = item.po_item?.stock_number;

      if (stockNum) {
        branchCode = stockNum.split('-')[0]?.toUpperCase();
        if (branchCode === 'DXB') branchId = 1;
        else if (branchCode === 'AUH') branchId = 2;
        else if (branchCode === 'SHJ') branchId = 3;
      }

      const supCode = item.po_item?.purchase_order?.container?.supplier?.supplier_code;
      if (supCode) {
        supplierCode = supCode;
        const idNum = parseInt(supCode.replace('SUP-', ''));
        if (!isNaN(idNum)) {
          supplierId = idNum;
        }
      }

      if (!map[invNum]) {
        map[invNum] = {
          branchId,
          supplierId,
          stockNumbers: new Set()
        };
      }
      if (stockNum) map[invNum].stockNumbers.add(stockNum);
      if (branchId) map[invNum].branchId = branchId;
      if (supplierId) map[invNum].supplierId = supplierId;
    });

    // Convert sets to arrays
    Object.keys(map).forEach(key => {
      map[key].stockNumbers = Array.from(map[key].stockNumbers);
    });

    return map;
  }, [salesData]);

  // Update URL parameters when filters change
  const updateUrlParams = (status, customer) => {
    const params = new URLSearchParams();

    if (status !== "All") {
      params.set('status', status.toLowerCase());
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
      // Handle both array and object responses (checking data, invoices keys)
      const data = Array.isArray(apiInvoices)
        ? apiInvoices
        : (apiInvoices?.data || apiInvoices?.invoices || []);
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, customerFilter, branchFilter, invoiceNumberFilter, stockNumberFilter, userFilter, loadStatusFilter, dateRange]);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Filter and search logic
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(invoice => {
      // Resolve branch, supplier, and stock numbers from sales data mapping
      const resolvedInfo = invoiceDetailsMap[invoice.invoice_number];
      const invoiceBranchId = resolvedInfo?.branchId;
      const invoiceStockNumbers = resolvedInfo?.stockNumbers || [];

      // Status check (local filter fallback)
      const matchesStatus = statusFilter === "All" || invoice.invoice_status?.toLowerCase() === statusFilter.toLowerCase();

      // Customer check (local filter fallback)
      const matchesCustomer = customerFilter === "All" || String(invoice.customer_id) === String(customerFilter);

      // Branch check
      const matchesBranch = branchFilter === "All" ||
        String(invoiceBranchId) === String(branchFilter) ||
        (invoice.created_by?.branches && invoice.created_by.branches.some(b => String(b.id) === String(branchFilter)));

      // Invoice Number check
      const matchesInvoiceNumber = !invoiceNumberFilter || (invoice.invoice_number?.toLowerCase() || "").includes(invoiceNumberFilter.toLowerCase());

      // Stock Number check
      const matchesStockNumber = !stockNumberFilter || invoiceStockNumbers.some(sn => sn.toLowerCase().includes(stockNumberFilter.toLowerCase()));

      // User check
      const matchesUser = userFilter === "All" ||
        String(invoice.invoice_by) === String(userFilter) ||
        String(invoice.created_by?.id) === String(userFilter);

      // Load Status check
      const matchesLoadStatus = loadStatusFilter === "All" || invoice.overall_load_status?.toLowerCase() === loadStatusFilter.replace(' ', '_').toLowerCase();

      // Date range match
      let matchesDateRange = true;
      if (invoice.invoice_date) {
        const pDate = new Date(invoice.invoice_date);
        if (dateRange.start) {
          const sDate = new Date(dateRange.start);
          sDate.setHours(0, 0, 0, 0);
          if (pDate < sDate) matchesDateRange = false;
        }
        if (dateRange.end) {
          const eDate = new Date(dateRange.end);
          eDate.setHours(23, 59, 59, 999);
          if (pDate > eDate) matchesDateRange = false;
        }
      }

      // Generic search bar fallback check
      const matchesSearch = !searchQuery ||
        (invoice.invoice_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (invoice.invoice_notes?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      return matchesStatus && matchesCustomer && matchesBranch && matchesInvoiceNumber &&
        matchesStockNumber && matchesUser && matchesLoadStatus && matchesDateRange && matchesSearch;
    });
  }, [
    invoices, statusFilter, customerFilter, branchFilter, invoiceNumberFilter,
    stockNumberFilter, userFilter, loadStatusFilter, dateRange, searchQuery, invoiceDetailsMap
  ]);

  // Pagination logic (using server totalPages and items already paginated from backend)
  const paginatedInvoices = filteredInvoices;

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

  const handleCancelReturnClick = async (invoice) => {
    try {
      // Ensure we have the full invoice details including items
      const fullInvoice = await invoiceService.getById(invoice.id);
      setSelectedInvoice(fullInvoice);
      setCancelModalOpen(true);
      setMenuOpenId(null);
    } catch (error) {
      console.error("Failed to fetch full invoice details", error);
      alert("Failed to load invoice details");
    }
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
  const getCustomerName = (customerId, customerObj = null) => {
    if (customerObj?.full_name) return customerObj.full_name;
    if (customerObj?.label) return customerObj.label;
    const customer = customers.find(c => c.id === customerId);
    return customer ? (customer.label || customer.full_name) : `Customer #${customerId}`;
  };

  // Helper function to get customer invoice link
  const getCustomerInvoiceLink = (customerId) => {
    return `/dashboard/sales/invoices?customer=${customerId}`;
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return "AED 0.00";

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

      if (isNaN(numAmount)) return "AED 0.00";

      // Cap extremely large numbers for display
      if (numAmount > 999999999) {
        return "AED 999M+";
      }

      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numAmount);
    } catch (error) {
      console.warn('Currency formatting error:', error, 'for amount:', amount);
      return "AED 0.00";
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
      <div className="space-y-6 pb-12 w-full max-w-full">
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
    <div className="space-y-6 pb-12 w-full max-w-full">
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
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 btn-mobile-arrange">
            <ExportButton
              data={filteredInvoices}
              columns={[
                { key: 'invoice_number', label: 'Invoice Number' },
                { key: 'customer_name', label: 'Customer' },
                { key: 'invoice_date', label: 'Date', formatter: formatDateForExport },
                { key: 'invoice_total', label: 'Total Amount', formatter: formatCurrencyForExport },
                { key: 'total_paid', label: 'Paid Amount', formatter: formatCurrencyForExport },
                { key: 'balance_due', label: 'Balance Due', formatter: formatCurrencyForExport },
                { key: 'invoice_status', label: 'Status', formatter: formatStatusForExport },
                { key: 'overall_load_status', label: 'Load Status', formatter: formatStatusForExport },
              ]}
              filename={`invoices-${new Date().toISOString().split('T')[0]}`}
            />
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all filter-button ${isFilterOpen
                ? 'bg-red-600 text-white shadow-red-600/10'
                : 'bg-black dark:bg-white text-white dark:text-black shadow-black/10'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            {hasPermission(PERMISSIONS.INVOICES.CREATE) && (
              <Link href="/dashboard/sales/invoices/add" className="flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline whitespace-nowrap font-black">Create Invoice</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section Card */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-zinc-800/50">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the invoice list below.</p>
            </div>
            {(statusFilter !== 'All' || customerFilter !== 'All' || branchFilter !== 'All' || invoiceNumberFilter !== '' || stockNumberFilter !== '' || userFilter !== 'All' || loadStatusFilter !== 'All' || dateRange.start !== '' || dateRange.end !== '') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setCustomerFilter('All');
                  setBranchFilter('All');
                  setInvoiceNumberFilter('');
                  setStockNumberFilter('');
                  setUserFilter('All');
                  setLoadStatusFilter('All');
                  setDateRange({ start: '', end: '' });
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
                        ? `${dateRange.start ? new Date(dateRange.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''} - ${dateRange.end ? new Date(dateRange.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}`
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

              {/* Filter by Invoice # */}
              <div>
                <input
                  type="text"
                  placeholder="Filter by Invoice #..."
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white"
                  value={invoiceNumberFilter}
                  onChange={(e) => setInvoiceNumberFilter(e.target.value)}
                />
              </div>

              {/* Filter by Customer */}
              <div>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Stock Number */}
              <div>
                <input
                  type="text"
                  placeholder="Filter by Stock Number..."
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white"
                  value={stockNumberFilter}
                  onChange={(e) => setStockNumberFilter(e.target.value)}
                />
              </div>

              {/* Filter by Invoice Status */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by Invoice Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Pending">Pending</option>
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

              {/* Filter by Load Status */}
              <div>
                <select
                  value={loadStatusFilter}
                  onChange={(e) => setLoadStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by Load Status</option>
                  <option value="Not Loaded">Not Loaded</option>
                  <option value="Pending">Pending</option>
                  <option value="Loaded">Loaded</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <TableContainer>
        <Table minWidth="800px">
          <TableHeader>
            <TableHeaderCell>Invoice #</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>Date & Time</TableHeaderCell>
            <TableHeaderCell>Invoice By</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Invoice Balance</TableHeaderCell>
            <TableHeaderCell>Invoice Status</TableHeaderCell>
            <TableHeaderCell>Load Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {paginatedInvoices && paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((invoice, index) => {
                return (
                  <TableRow key={invoice.id}>
                    {/* Invoice Number */}
                    <TableCell>
                      <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                        {invoice.invoice_number || "-"}
                      </span>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {getCustomerName(invoice.customer_id, invoice.customer)}
                      </span>
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) : "-"}
                      </span>
                    </TableCell>

                    {/* Invoice By */}
                    <TableCell>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {invoice.created_by?.name || invoice.created_by_name || "Admin User"}
                      </span>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        {formatCurrency(invoice.invoice_total)}
                      </span>
                    </TableCell>

                    {/* Invoice Balance */}
                    <TableCell>
                      {(() => {
                        const balance = parseFloat(invoice.invoice_total || 0) - parseFloat(invoice.paid_amount || invoice.total_paid || 0);
                        return (
                          <span className={`text-sm font-black ${balance > 0 ? "text-red-600 dark:text-red-400 font-bold" : "text-gray-500 dark:text-zinc-500"}`}>
                            {formatCurrency(balance > 0 ? balance : 0)}
                          </span>
                        );
                      })()}
                    </TableCell>

                    {/* Invoice Status */}
                    <TableCell>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${invoice.invoice_status === 'paid' || invoice.invoice_status === 'Saved and Paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : invoice.invoice_status === 'overdue' || invoice.invoice_status === 'Overdue'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          : invoice.invoice_status === 'cancelled'
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                        {invoice.invoice_status || "Pending"}
                      </div>
                    </TableCell>

                    {/* Load Status */}
                    <TableCell>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${invoice.overall_load_status === 'loaded' || invoice.overall_load_status === 'Loaded' || invoice.overall_load_status === 'full' || invoice.overall_load_status === 'Full'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : invoice.overall_load_status === 'partial' || invoice.overall_load_status === 'Partial' || invoice.overall_load_status === 'partially_loaded'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : invoice.overall_load_status === 'pending' || invoice.overall_load_status === 'Pending'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : invoice.overall_load_status === 'draft' || invoice.overall_load_status === 'Draft'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        {invoice.overall_load_status === 'loaded' || invoice.overall_load_status === 'Loaded' ? 'Loaded' :
                          invoice.overall_load_status === 'full' || invoice.overall_load_status === 'Full' ? 'Full' :
                            invoice.overall_load_status === 'partial' || invoice.overall_load_status === 'Partial' || invoice.overall_load_status === 'partially_loaded' ? 'Partial' :
                              invoice.overall_load_status === 'pending' || invoice.overall_load_status === 'Pending' ? 'Pending' :
                                invoice.overall_load_status === 'draft' || invoice.overall_load_status === 'Draft' ? 'Draft' :
                                  'Not Loaded'}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <button
                            onClick={() => toggleMenu(invoice.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${menuOpenId === invoice.id
                              ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                              : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 bg-gray-50 dark:bg-zinc-800/50 lg:bg-transparent lg:dark:bg-transparent'
                              }`}
                          >
                            <span className="text-[11px] font-black uppercase tracking-widest lg:hidden">Actions</span>
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {menuOpenId === invoice.id && (
                            <div className={`absolute right-0 w-56 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[200] p-1.5 animate-in fade-in zoom-in-95 duration-200 ${index > paginatedInvoices.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                              }`}>
                              <Link
                                href={`/dashboard/sales/invoices/view/${invoice.id}`}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View/Modify Invoice
                              </Link>
                              {hasPermission(PERMISSIONS.INVOICES.UPDATE) && (
                                <Link
                                  href={`/dashboard/sales/invoices/edit/${invoice.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit Invoice
                                </Link>
                              )}
                              <button
                                onClick={() => {
                                  window.open(`/dashboard/sales/invoices/view/${invoice.id}?print=preview`, '_blank');
                                  setMenuOpenId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 rounded-xl transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                                Print Preview
                              </button>
                              {hasPermission(PERMISSIONS.INVOICES.UPDATE) && (
                                <>
                                  <div className="h-px bg-gray-100 dark:border-zinc-800 my-1" />
                                  <button
                                    onClick={() => handleCancelReturnClick(invoice)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
                                  >
                                    <RefreshCcw className="w-4 h-4" />
                                    Cancel / Return Items
                                  </button>
                                </>
                              )}
                              {hasPermission(PERMISSIONS.INVOICES.DELETE) && (
                                <button
                                  onClick={() => handleDeleteClick(invoice)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Invoice
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan="9" className="py-24 text-center">
                  <p className="text-gray-400 font-black text-sm uppercase tracking-widest text-center w-full">No invoices found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />



      {/* View Invoice Modal */}
      {
        viewModalOpen && selectedInvoice && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setViewModalOpen(false)}
            />
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{getCustomerName(selectedInvoice.customer_id, selectedInvoice.customer)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Invoice Date</h3>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(selectedInvoice.invoice_date)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</h3>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${selectedInvoice.invoice_status === 'paid'
                        ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                        : selectedInvoice.invoice_status === 'overdue'
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          : selectedInvoice.invoice_status === 'cancelled'
                            ? 'bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400'
                            : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${selectedInvoice.invoice_status === 'paid' ? 'bg-green-600' :
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
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteModalOpen && selectedInvoice && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setDeleteModalOpen(false)}
            />
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">{getCustomerName(selectedInvoice.customer_id, selectedInvoice.customer)}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedInvoice.invoice_total)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`font-semibold ${selectedInvoice.invoice_status === 'paid' ? 'text-green-600 dark:text-green-400' :
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
        )
      }

      {/* Cancel/Return Items Modal */}
      <CancelReturnItemsModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        invoice={selectedInvoice}
        onSuccess={() => mutate()}
      />
    </div >
  );
}

export default function InvoiceManagementPage() {
  return (
    <ProtectedRoute permission={PERMISSIONS.INVOICES.VIEW}>
      <Suspense fallback={
        <div className="space-y-6 pb-12 w-full max-w-full">
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
    </ProtectedRoute>
  );
}
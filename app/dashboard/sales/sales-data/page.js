"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3, Search, Filter, Download,
  Eye, FileText, Calendar, User,
  ChevronLeft, ChevronRight, X,
  Building2, ShoppingCart, RefreshCcw, MoreVertical,
  Package, Hash, DollarSign, Truck, MapPin
} from "lucide-react";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { apiClient } from "@/app/lib/api";
import Link from "next/link";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { PERMISSIONS } from "@/app/lib/constants/permissions";
import Pagination from "@/app/components/Pagination";
import { TableContainer, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/app/components/Table";

export default function SalesDataPage() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dropdown data
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stockItems, setStockItems] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    user: "All",
    supplier: "All",
    customerName: "All",
    customerNumber: "",
    dateRange: "", // Empty by default to show all data
    itemSold: "All",
    stockNumber: "",
    invoiceStatus: "All",
    loadStatus: "All"
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpenId !== null && !event.target.closest('.actions-menu-container')) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Auto-expand filters if active filters exist on load
  useEffect(() => {
    if (activeFiltersCount > 0) {
      setIsFilterOpen(true);
    }
  }, []);

  // Fetch sales data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getSalesData(currentPage, PAGE_SIZE);
      const items = response?.data || [];
      setSalesData(items);
      setTotal(response?.total || 0);
      setTotalPages(response?.total_pages || 1);

      // Debug: Log unique customer IDs in sales data
      if (Array.isArray(items) && items.length > 0) {
        const customerIds = [...new Set(items.map(item => item.invoice?.customer?.id).filter(Boolean))];
        const customerNames = [...new Set(items.map(item => item.invoice?.customer?.full_name).filter(Boolean))];
        console.log("📊 Sales Data Loaded:");
        console.log("  - Total items:", items.length);
        console.log("  - Unique customer IDs:", customerIds);
        console.log("  - Unique customer names:", customerNames);
        console.log("  - Sample item:", items[0]);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [customersData, usersData, suppliersData, stockItemsData] = await Promise.all([
        apiClient.get('/api/dropdown/customers').catch(() => []),
        apiClient.get('/api/dropdown/users').catch(() => []),
        apiClient.get('/api/dropdown/suppliers').catch(() => []),
        apiClient.get('/api/dropdown/stock-items').catch(() => [])
      ]);

      console.log("📦 Dropdown Data Loaded:");
      console.log("  - Customers:", customersData);
      console.log("  - Users:", usersData);
      console.log("  - Suppliers:", suppliersData);
      console.log("  - Stock Items:", stockItemsData);

      setCustomers(Array.isArray(customersData) ? customersData : (customersData?.data || customersData?.items || customersData?.customers || []));
      setUsers(Array.isArray(usersData) ? usersData : (usersData?.data || usersData?.items || usersData?.users || []));
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : (suppliersData?.data || suppliersData?.items || suppliersData?.suppliers || []));
      setStockItems(Array.isArray(stockItemsData) ? stockItemsData : (stockItemsData?.data || stockItemsData?.items || stockItemsData?.stock_items || []));
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Filter logic
  const filteredData = useMemo(() => {
    console.log("🔍 Applying filters:", filters);
    console.log("📊 Total sales data:", salesData.length);

    const filtered = salesData.filter(item => {
      const matchesUser = filters.user === "All" || item.invoice?.created_by?.id === parseInt(filters.user);
      const matchesSupplier = filters.supplier === "All" || item.po_item?.purchase_order?.container?.supplier?.id === parseInt(filters.supplier);

      // Customer filter - match by name since customer ID is not in sales data
      let matchesCustomer = true;
      if (filters.customerName !== "All") {
        // Get the selected customer's label (name) from the customers dropdown
        const selectedCustomer = customers.find(c => c.id === parseInt(filters.customerName));
        if (selectedCustomer) {
          matchesCustomer = item.invoice?.customer?.full_name === selectedCustomer.label;
          console.log("🔍 Customer Filter Debug:", {
            filterValue: filters.customerName,
            selectedCustomerName: selectedCustomer.label,
            itemCustomerName: item.invoice?.customer?.full_name,
            matches: matchesCustomer
          });
        } else {
          matchesCustomer = false;
        }
      }

      const matchesCustomerNum = !filters.customerNumber || (item.invoice?.customer?.phone || "").includes(filters.customerNumber);
      const matchesStock = !filters.stockNumber || (item.po_item?.stock_number || "").toLowerCase().includes(filters.stockNumber.toLowerCase());
      const matchesLoadStatus = filters.loadStatus === "All" || item.load_status === filters.loadStatus;

      // Item Sold Filter - match by stock_item name since ID is not available in sales data
      let matchesItemSold = true;
      if (filters.itemSold !== "All") {
        // Get the selected stock item's label (name) from the stockItems dropdown
        const selectedStockItem = stockItems.find(si => si.id === parseInt(filters.itemSold));
        if (selectedStockItem) {
          const itemStockItemName = item.po_item?.stock_item?.name;
          matchesItemSold = itemStockItemName === selectedStockItem.label;

          // Debug logging for item sold filter
          console.log("🔍 Item Sold Filter Debug:", {
            filterValue: filters.itemSold,
            selectedStockItemName: selectedStockItem.label,
            itemStockItemId: item.po_item?.stock_item?.id,
            itemStockItemName: itemStockItemName,
            matches: matchesItemSold
          });
        } else {
          matchesItemSold = false;
        }
      }

      // Invoice Status Filter
      let matchesInvoiceStatus = true;
      if (filters.invoiceStatus !== "All") {
        const paidAmount = parseFloat(item.invoice?.paid_amount || 0);
        const outstandingAmount = parseFloat(item.invoice?.outstanding_amount || 0);

        if (filters.invoiceStatus === "paid") {
          matchesInvoiceStatus = paidAmount > 0 && outstandingAmount === 0;
        } else if (filters.invoiceStatus === "partial") {
          matchesInvoiceStatus = paidAmount > 0 && outstandingAmount > 0;
        } else if (filters.invoiceStatus === "unpaid") {
          matchesInvoiceStatus = paidAmount === 0 && outstandingAmount > 0;
        }
      }

      // Date filter - check if invoice date matches selected date OR if no date filter is set
      let matchesDate = true;
      if (filters.dateRange) {
        const invoiceDate = item.invoice?.created_at || item.invoice?.invoice_date;
        if (invoiceDate) {
          const invoiceDateOnly = new Date(invoiceDate).toISOString().split('T')[0];
          matchesDate = invoiceDateOnly === filters.dateRange;
        } else {
          // If item has no date, exclude it when date filter is active
          matchesDate = false;
        }
      }

      const matches = matchesUser && matchesSupplier && matchesCustomer && matchesCustomerNum && matchesStock && matchesLoadStatus && matchesInvoiceStatus && matchesDate && matchesItemSold;

      return matches;
    });

    console.log("✅ Filtered results:", filtered.length);
    console.log("📋 Sample filtered items:", filtered.slice(0, 2));
    return filtered;
  }, [salesData, filters, customers, stockItems]);

  // Totals
  const totals = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      // Assuming unit price refers to sale_amount or similar from backend
      // In the sample JSON, we don't have unit_price directly, usually derived
      // Sample JSON has invoice.paid_amount and invoice.outstanding_amount
      // We'll use values from the invoice or po_item as appropriate for the UI demo
      const paid = parseFloat(item.invoice?.paid_amount) || 0;
      const outstanding = parseFloat(item.invoice?.outstanding_amount) || 0;
      const total = paid + outstanding;

      return {
        unitPrice: acc.unitPrice + total,
        paid: acc.paid + paid,
        balance: acc.balance + outstanding
      };
    }, { unitPrice: 0, paid: 0, balance: 0 });
  }, [filteredData]);

  // Pagination logic (hybrid server/client)
  const displayTotalPages = filteredData.length > PAGE_SIZE ? Math.ceil(filteredData.length / PAGE_SIZE) : totalPages;
  const displayTotal = filteredData.length > PAGE_SIZE ? filteredData.length : total;
  const paginatedData = filteredData.length > PAGE_SIZE
    ? filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filteredData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  const clearFilters = () => {
    setFilters({
      user: "All",
      supplier: "All",
      customerName: "All",
      customerNumber: "",
      dateRange: "", // Clear date filter completely
      itemSold: "All",
      stockNumber: "",
      invoiceStatus: "All",
      loadStatus: "All"
    });
    setCurrentPage(1);
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.user !== "All") count++;
    if (filters.supplier !== "All") count++;
    if (filters.customerName !== "All") count++;
    if (filters.customerNumber) count++;
    if (filters.dateRange) count++;
    if (filters.itemSold !== "All") count++;
    if (filters.stockNumber) count++;
    if (filters.invoiceStatus !== "All") count++;
    if (filters.loadStatus !== "All") count++;
    return count;
  }, [filters]);

  const toggleMenu = (id, item = null) => {
    if (item) console.log("📊 Sales Item context:", item);
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleViewDetails = (item) => {
    console.log("🔍 Selected Sales Item Structure:", item);
    setSelectedItem(item);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  return (
    <ProtectedRoute permission={PERMISSIONS.INVOICES.VIEW}>
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Sales Data</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">A detailed breakdown of all sales activity.</p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:flex-wrap lg:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-auto flex flex-col min-[430px]:flex-row min-[430px]:items-center gap-3 min-[430px]:gap-0 bg-white dark:bg-zinc-900 px-4 sm:px-6 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="text-left min-[430px]:text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Unit Price</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(totals.unitPrice)}</p>
              </div>
              <div className="hidden min-[430px]:block w-px h-8 bg-gray-100 dark:bg-zinc-800 mx-4"></div>
              <div className="text-left min-[430px]:text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Paid</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(totals.paid)}</p>
              </div>
              <div className="hidden min-[430px]:block w-px h-8 bg-gray-100 dark:bg-zinc-800 mx-4"></div>
              <div className="text-left min-[430px]:text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Balance</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(totals.balance)}</p>
              </div>
            </div>

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

            <button className="flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export to Excel</span>
            </button>
          </div>
        </div>

        {/* Filters Card */}
        {isFilterOpen && (
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-zinc-800/50">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
                {activeFiltersCount > 0 && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-black">
                    {activeFiltersCount} Active
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Filter by User */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by User</label>
                <select
                  value={filters.user}
                  onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  <option value="All">All Users</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Supplier */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Supplier</label>
                <select
                  value={filters.supplier}
                  onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  <option value="All">All Suppliers</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Customer Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Customer Name</label>
                <select
                  value={filters.customerName}
                  onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  <option value="All">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Customer Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Customer Number</label>
                <input
                  type="text"
                  placeholder="Search number..."
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                  value={filters.customerNumber}
                  onChange={(e) => setFilters({ ...filters, customerNumber: e.target.value })}
                />
              </div>

              {/* Invoice Date Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Invoice Date Range</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Filter by Item Sold */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Item Sold</label>
                <select
                  value={filters.itemSold}
                  onChange={(e) => setFilters({ ...filters, itemSold: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  <option value="All">All Items</option>
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Stock # */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Stock #</label>
                <input
                  type="text"
                  placeholder="Search stock..."
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                  value={filters.stockNumber}
                  onChange={(e) => setFilters({ ...filters, stockNumber: e.target.value })}
                />
              </div>

              {/* Filter by Invoice Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Invoice Status</label>
                <select
                  value={filters.invoiceStatus}
                  onChange={(e) => setFilters({ ...filters, invoiceStatus: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  <option value="All">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Filter by Load Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Load Status</label>
                <select
                  value={filters.loadStatus}
                  onChange={(e) => setFilters({ ...filters, loadStatus: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                >
                  <option value="All">All Statuses</option>
                  <option value="loaded">Loaded</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="draft">Draft</option>
                  <option value="not_loaded">Not Loaded</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Table Card */}
        <TableContainer>
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-50 dark:border-zinc-800/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Sales Table</h3>
              <p className="text-sm text-gray-500 mt-1">All sales data from invoices and inventory.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/30">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                {filteredData.length} Results
              </span>
            </div>
          </div>

          <Table minWidth="1800px">
            <TableHeader>
              <TableHeaderCell>Invoice By (User)</TableHeaderCell>
              <TableHeaderCell>Supplier Code</TableHeaderCell>
              <TableHeaderCell>Invoice Date & Time</TableHeaderCell>
              <TableHeaderCell>Customer Name</TableHeaderCell>
              <TableHeaderCell>Customer Number</TableHeaderCell>
              <TableHeaderCell>Item Sold</TableHeaderCell>
              <TableHeaderCell>Stock #</TableHeaderCell>
              <TableHeaderCell>Container No</TableHeaderCell>
              <TableHeaderCell>Sale Description</TableHeaderCell>
              <TableHeaderCell>Invoice Number</TableHeaderCell>
              <TableHeaderCell>Qty</TableHeaderCell>
              <TableHeaderCell className="text-right">Unit Price</TableHeaderCell>
              <TableHeaderCell className="text-right">Paid Amount</TableHeaderCell>
              <TableHeaderCell className="text-right">Balance Amount</TableHeaderCell>
              <TableHeaderCell>Load Status</TableHeaderCell>
              <TableHeaderCell>Load Date and Time</TableHeaderCell>
              <TableHeaderCell></TableHeaderCell>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="17" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCcw className="w-8 h-8 text-gray-300 animate-spin mx-auto" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center w-full">Loading Sales Data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-gray-600">
                          {item.invoice?.created_by?.name?.substring(0, 2).toUpperCase() || "AU"}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.invoice?.created_by?.name || "Admin User"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-black text-gray-500">{item.po_item?.purchase_order?.container?.supplier?.supplier_code || "N/A"}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-600 dark:text-gray-400">{formatDate(item.invoice?.created_at)}</TableCell>
                    <TableCell className="font-black text-gray-900 dark:text-white leading-tight">{item.invoice?.customer?.full_name || "-"}</TableCell>
                    <TableCell className="text-sm font-bold text-gray-500 tracking-wider">{item.invoice?.customer?.phone || "-"}</TableCell>
                    <TableCell className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px]">{item.po_item?.stock_item?.name || "-"}</TableCell>
                    <TableCell><span className="text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded-md">{item.po_item?.stock_number || "-"}</span></TableCell>
                    <TableCell className="text-xs font-bold text-gray-500">{item.po_item?.purchase_order?.container?.container_number || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-xs truncate" title={item.sale_description || "-"}>{item.sale_description || "-"}</TableCell>
                    <TableCell className="font-bold text-blue-600 text-sm">{item.invoice?.invoice_number || "-"}</TableCell>
                    <TableCell className="font-black text-xs">{item.po_item?.quantity || "1"}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white font-black text-sm text-right">AED {(parseFloat(item.invoice?.paid_amount || 0) + parseFloat(item.invoice?.outstanding_amount || 0)).toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-600 font-black text-sm text-right">AED {(parseFloat(item.invoice?.paid_amount || 0)).toLocaleString()}</TableCell>
                    <TableCell className="text-red-600 font-black text-sm text-right">AED {(parseFloat(item.invoice?.outstanding_amount || 0)).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.load_status === 'loaded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.load_status || 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-500">{item.load_date ? formatDate(item.load_date) : "-"}</TableCell>
                    <TableCell className="text-right relative actions-menu-container">
                      <button onClick={() => toggleMenu(idx)} className="p-2 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><MoreVertical className="w-5 h-5" /></button>
                      {menuOpenId === idx && (
                        <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 rounded-2xl shadow-xl z-[200] p-1.5 ${idx % itemsPerPage > 4 ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                          <button onClick={() => handleViewDetails(item)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl"><Eye className="w-4 h-4" />View Details</button>
                          <Link href={`/dashboard/sales/invoices/view/${item.invoice?.id}`} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-blue-50 rounded-xl"><FileText className="w-4 h-4 text-blue-600" />View Invoice</Link>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="17" className="py-24 text-center text-gray-400 font-black uppercase tracking-widest italic animate-pulse text-center w-full">No sales data found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={displayTotalPages}
          total={displayTotal}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />


        {/* View Details Modal */}
        {viewModalOpen && selectedItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 rounded-[24px] sm:rounded-[32px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 flex items-center justify-between gap-4 p-4 sm:p-8 border-b border-gray-50 dark:border-zinc-900">
                <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20 shrink-0">
                    <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate">Sales Item Details</h2>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Invoice: <span className="text-red-600">{selectedItem.invoice?.invoice_number}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-2xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">
                {/* Main Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Amount</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(selectedItem.invoice?.paid_amount) + parseFloat(selectedItem.invoice?.outstanding_amount))}
                    </p>
                  </div>
                  <div className="bg-green-50/50 dark:bg-green-900/10 rounded-3xl p-6 border border-green-100 dark:border-green-900/20">
                    <p className="text-[10px] font-black text-green-600/60 dark:text-green-400/60 uppercase tracking-[0.2em] mb-2">Paid Amount</p>
                    <p className="text-2xl font-black text-green-700 dark:text-green-400">
                      {formatCurrency(selectedItem.invoice?.paid_amount)}
                    </p>
                  </div>
                  <div className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl p-6 border border-red-100 dark:border-red-900/20">
                    <p className="text-[10px] font-black text-red-600/60 dark:text-red-400/60 uppercase tracking-[0.2em] mb-2">Balance Due</p>
                    <p className="text-2xl font-black text-red-700 dark:text-red-400">
                      {formatCurrency(selectedItem.invoice?.outstanding_amount)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left Column: Product & Sale */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        Product Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                          <span className="text-sm font-bold text-gray-400">Item Name</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{selectedItem.po_item?.stock_item?.name || "-"}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                          <span className="text-sm font-bold text-gray-400">Stock Number</span>
                          <span className="text-xs font-black text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-xl">
                            {selectedItem.po_item?.stock_number || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                          <span className="text-sm font-bold text-gray-400">Quantity</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{selectedItem.po_item?.quantity || "1"}</span>
                        </div>
                        <div className="flex flex-col gap-2 py-3">
                          <span className="text-sm font-bold text-gray-400">Sale Description</span>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl">
                            {selectedItem.sale_description || "No description provided."}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                          <Truck className="w-4 h-4 text-orange-600" />
                        </div>
                        Logistics Details
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                          <span className="text-sm font-bold text-gray-400">Load Status</span>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedItem.load_status === 'loaded'
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/10'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10'
                            }`}>
                            {selectedItem.load_status || 'Pending'}
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                          <span className="text-sm font-bold text-gray-400">Load Date</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{formatDate(selectedItem.load_date)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                          <span className="text-sm font-bold text-gray-400">Container #</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {selectedItem.po_item?.purchase_order?.container?.container_number || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-sm font-bold text-gray-400">Supplier Code</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {selectedItem.po_item?.purchase_order?.container?.supplier?.supplier_code || "-"}
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Customer & Audit */}
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        Customer Information
                      </h3>
                      <div className="bg-gray-50 dark:bg-zinc-900 rounded-[24px] p-6 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center font-black text-gray-400 border border-gray-100 dark:border-zinc-700 shadow-sm">
                            {selectedItem.invoice?.customer?.full_name?.substring(0, 2).toUpperCase() || "CU"}
                          </div>
                          <div>
                            <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                              {selectedItem.invoice?.customer?.full_name || "Guest Customer"}
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                              {selectedItem.invoice?.customer?.phone || "No Phone"}
                            </p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>Regional Customer</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                          <Hash className="w-4 h-4 text-gray-600" />
                        </div>
                        Transaction Details
                      </h3>
                      <div className="space-y-4 bg-gray-50 dark:bg-zinc-900 p-6 rounded-[24px] border border-gray-100 dark:border-zinc-800">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoiced By</span>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-white dark:bg-zinc-800 flex items-center justify-center text-[8px] font-black text-gray-500 border border-gray-100 dark:border-zinc-700">
                              {selectedItem.invoice?.created_by?.name?.substring(0, 2).toUpperCase() || "AU"}
                            </div>
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                              {selectedItem.invoice?.created_by?.name || "System Admin"}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Date</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {formatDate(selectedItem.invoice?.created_at)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-zinc-800">
                          <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Unit Price</span>
                          <span className="text-lg font-black text-blue-600">
                            {formatCurrency(parseFloat(selectedItem.invoice?.paid_amount) + parseFloat(selectedItem.invoice?.outstanding_amount))}
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-8 border-t border-gray-50 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-zinc-900 rounded-full border border-gray-100 dark:border-zinc-800">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Transaction Record</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setViewModalOpen(false)}
                    className="flex-1 sm:flex-none px-8 py-3.5 text-sm font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    href={(selectedItem.invoice?.id || selectedItem.invoice_id) ? `/dashboard/sales/invoices/view/${selectedItem.invoice?.id || selectedItem.invoice_id}` : "#"}
                    onClick={(e) => {
                      if (!selectedItem.invoice?.id && !selectedItem.invoice_id) {
                        e.preventDefault();
                        alert("Link unavailable: This record doesn't have an associated Invoice ID.");
                      }
                    }}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all ${(selectedItem.invoice?.id || selectedItem.invoice_id)
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-black/10'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Invoice</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

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
import Link from "next/link";

export default function SalesDataPage() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Filters state
  const [filters, setFilters] = useState({
    user: "All",
    supplier: "All",
    customerName: "",
    customerNumber: "",
    dateRange: "",
    container: "All",
    itemSold: "All",
    stockNumber: "",
    invoiceStatus: "All",
    loadStatus: "All"
  });

  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Fetch sales data
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await invoiceService.getSalesData(0, 500);
      setSalesData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filteredData = useMemo(() => {
    return salesData.filter(item => {
      const matchesUser = filters.user === "All" || item.invoice?.created_by?.name === filters.user;
      const matchesSupplier = filters.supplier === "All" || item.po_item?.purchase_order?.container?.supplier?.supplier_code === filters.supplier;
      const matchesCustomer = !filters.customerName || item.invoice?.customer?.full_name?.toLowerCase().includes(filters.customerName.toLowerCase());
      const matchesCustomerNum = !filters.customerNumber || (item.invoice?.customer?.phone || "").includes(filters.customerNumber);
      const matchesStock = !filters.stockNumber || (item.po_item?.stock_number || "").toLowerCase().includes(filters.stockNumber.toLowerCase());
      const matchesLoadStatus = filters.loadStatus === "All" || item.load_status === filters.loadStatus;
      
      return matchesUser && matchesSupplier && matchesCustomer && matchesCustomerNum && matchesStock && matchesLoadStatus;
    });
  }, [salesData, filters]);

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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
      customerName: "",
      customerNumber: "",
      dateRange: "",
      container: "All",
      itemSold: "All",
      stockNumber: "",
      invoiceStatus: "All",
      loadStatus: "All"
    });
    setCurrentPage(1);
  };

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
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Sales Data</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">A detailed breakdown of all sales activity.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-6 bg-white dark:bg-zinc-900 px-6 py-3 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Unit Price</p>
              <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(totals.unitPrice)}</p>
            </div>
            <div className="w-px h-8 bg-gray-100 dark:bg-zinc-800"></div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Paid</p>
              <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(totals.paid)}</p>
            </div>
            <div className="w-px h-8 bg-gray-100 dark:bg-zinc-800"></div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Balance</p>
              <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(totals.balance)}</p>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all">
            <Download className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-gray-100 dark:border-zinc-800 shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Filters</h3>
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <Filter className={`w-5 h-5 ${isFilterOpen ? 'text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>
        
        {isFilterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Filter by User */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by User</label>
              <select 
                value={filters.user}
                onChange={(e) => setFilters({...filters, user: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
              >
                <option value="All">All Users</option>
                <option value="Admin User">Admin User</option>
              </select>
            </div>

            {/* Filter by Supplier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Supplier</label>
              <select 
                value={filters.supplier}
                onChange={(e) => setFilters({...filters, supplier: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
              >
                <option value="All">All Suppliers</option>
                <option value="SUP-001">SUP-001</option>
              </select>
            </div>

            {/* Filter by Customer Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Customer Name</label>
              <input 
                type="text" 
                placeholder="Search customer..."
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                value={filters.customerName}
                onChange={(e) => setFilters({...filters, customerName: e.target.value})}
              />
            </div>

            {/* Filter by Customer Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Customer Number</label>
              <input 
                type="text" 
                placeholder="Search number..."
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                value={filters.customerNumber}
                onChange={(e) => setFilters({...filters, customerNumber: e.target.value})}
              />
            </div>

            {/* Invoice Date Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Invoice Date Range</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="date" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                />
              </div>
            </div>

            {/* Filter by Container */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Container #</label>
              <select className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all">
                <option value="All">All Containers</option>
              </select>
            </div>

            {/* Filter by Item Sold */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Filter by Item Sold</label>
              <select className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all">
                <option value="All">All Items</option>
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
                onChange={(e) => setFilters({...filters, stockNumber: e.target.value})}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Clear Filters
          </button>
          
          <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-90 transition-all">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-gray-50 dark:border-zinc-800/50">
          <h3 className="text-lg font-black text-gray-900 dark:text-white">Sales Table</h3>
          <p className="text-sm text-gray-500 mt-1">All sales data from invoices and inventory.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1800px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-800/20">
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Invoice By (User)</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Supplier Code</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Invoice Date & Time</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Customer Name</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Customer Number</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Item Sold</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Stock #</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Container No</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Sale Description</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Invoice Number</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Qty</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Unit Price</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Paid Amount</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Balance Amount</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Load Status</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Load Date and Time</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                   <td colSpan="17" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <RefreshCcw className="w-8 h-8 text-gray-300 animate-spin" />
                         <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Sales Data...</p>
                      </div>
                   </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <tr key={idx} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-gray-600">
                          {item.invoice?.created_by?.name?.substring(0, 2).toUpperCase() || "AU"}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.invoice?.created_by?.name || "Admin User"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-gray-500 dark:text-gray-400 tracking-wider">
                        {item.po_item?.purchase_order?.container?.supplier?.supplier_code || "SUP-001"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{formatDate(item.invoice?.created_at)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-gray-900 dark:text-white leading-tight">{item.invoice?.customer?.full_name || "-"}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider">{item.invoice?.customer?.phone || "-"}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 dark:text-white wrap-break-word max-w-[200px]">{item.po_item?.stock_item?.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">{item.po_item?.stock_number || "-"}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                        {item.po_item?.purchase_order?.container?.container_number || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-600 dark:text-gray-400 italic max-w-[300px] block truncate">{item.sale_description || "-"}</span>
                    </td>
                    <td className="px-6 py-5 font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {item.invoice?.invoice_number || "-"}
                    </td>
                    <td className="px-6 py-5">
                      <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xs text-gray-900 dark:text-white">
                        {item.po_item?.quantity || "1"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(item.invoice?.paid_amount) + parseFloat(item.invoice?.outstanding_amount))}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-green-600 dark:text-green-400 text-sm font-black text-right pr-12">
                      {formatCurrency(item.invoice?.paid_amount)}
                    </td>
                    <td className="px-6 py-5 text-red-600 dark:text-red-400 text-sm font-black text-right pr-12">
                      {formatCurrency(item.invoice?.outstanding_amount)}
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.load_status === 'loaded' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {item.load_status || "pending"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[14px] font-bold text-gray-500 dark:text-gray-400">{formatDate(item.load_date)}</span>
                    </td>
                    <td className="px-6 py-5 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <button 
                            onClick={() => toggleMenu(item.id || idx, item)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                              menuOpenId === (item.id || idx)
                                ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {menuOpenId === (item.id || idx) && (
                            <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                              idx % itemsPerPage > 4 ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}>
                              <button 
                                onClick={() => handleViewDetails(item)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <Link 
                                href={ (item.invoice?.id || item.invoice_id) ? `/dashboard/sales/invoices/edit/${item.invoice?.id || item.invoice_id}` : "#"}
                                onClick={(e) => {
                                  if (!item.invoice?.id && !item.invoice_id) {
                                    e.preventDefault();
                                    alert("Invoice ID not found for this sales item.");
                                  }
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold rounded-xl transition-colors ${
                                  (item.invoice?.id || item.invoice_id)
                                    ? 'text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                                View Invoice
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="17" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <ShoppingCart className="w-12 h-12 text-gray-200" />
                      <div>
                        <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">No Sales Found</p>
                        <p className="text-sm text-gray-400 font-medium">Try adjusting your filters to find what you're looking for.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Showing <span className="text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-gray-900 dark:text-white">{filteredData.length}</span> entries
          </p>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {viewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-[32px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 flex items-center justify-between p-8 border-b border-gray-50 dark:border-zinc-900">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Sales Item Details</h2>
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

            <div className="p-8 space-y-10">
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
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          selectedItem.load_status === 'loaded' 
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
                  </section>Section Content
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
            <div className="p-8 border-t border-gray-50 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                  href={(selectedItem.invoice?.id || selectedItem.invoice_id) ? `/dashboard/sales/invoices/edit/${selectedItem.invoice?.id || selectedItem.invoice_id}` : "#"}
                  onClick={(e) => {
                    if (!selectedItem.invoice?.id && !selectedItem.invoice_id) {
                      e.preventDefault();
                      alert("Link unavailable: This record doesn't have an associated Invoice ID.");
                    }
                  }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all ${
                    (selectedItem.invoice?.id || selectedItem.invoice_id)
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
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Receipt, Search, Filter, Eye, Phone, MapPin,
  Building, DollarSign, AlertTriangle, TrendingUp, FileText,
  Calendar, ChevronLeft, ChevronRight, X, CheckCircle,
  Clock, RefreshCcw, Download, User, BadgeCheck
} from "lucide-react";
import { customerService } from "@/app/lib/services/customerService";
import { invoiceService } from "@/app/lib/services/invoiceService";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { PERMISSIONS } from "@/app/lib/constants/permissions";
import { TableContainer, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/app/components/Table";

export default function CustomerPurchaseHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Auto-expand filters if active filters exist on load
  useEffect(() => {
    if (statusFilter !== "All" || dateRange.start || dateRange.end) {
      setIsFilterOpen(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const customerData = await customerService.getById(customerId);
        setCustomer(customerData);

        try {
          const invoicesData = await invoiceService.getAll(0, 200, customerId);
          let list = [];
          if (Array.isArray(invoicesData)) list = invoicesData;
          else if (invoicesData?.data) list = invoicesData.data;
          else if (invoicesData?.invoices) list = invoicesData.invoices;
          setInvoices(list);
        } catch {
          setInvoices([]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (customerId) fetchData();
  }, [customerId]);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    if (isNaN(num)) return "AED 0.00";
    return `AED ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-AE", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid" || s === "saved and paid") return { cls: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400", dot: "bg-green-500", label: "Paid" };
    if (s === "overdue") return { cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", dot: "bg-red-500", label: "Overdue" };
    if (s === "partial" || s === "partially_paid") return { cls: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400", dot: "bg-orange-500", label: "Partial" };
    if (s === "pending") return { cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400", dot: "bg-yellow-500", label: "Pending" };
    if (s === "cancelled" || s === "canceled") return { cls: "bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400", dot: "bg-gray-400", label: "Cancelled" };
    return { cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", dot: "bg-blue-500", label: status || "Draft" };
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = invoices.reduce((s, inv) => s + parseFloat(inv.invoice_total || inv.invoice_amount || 0), 0);
    const paid = invoices.filter(i => ["paid", "saved and paid"].includes((i.invoice_status || "").toLowerCase()));
    const pending = invoices.filter(i => ["pending", "partial", "partially_paid"].includes((i.invoice_status || "").toLowerCase()));
    const overdue = invoices.filter(i => (i.invoice_status || "").toLowerCase() === "overdue");
    return { count: invoices.length, total, paidCount: paid.length, pendingCount: pending.length, overdueCount: overdue.length };
  }, [invoices]);

  // Filtered invoices
  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = !searchQuery ||
        (inv.invoice_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.invoice_notes || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" ||
        (inv.invoice_status || "").toLowerCase().includes(statusFilter.toLowerCase());
      let matchDate = true;
      if (inv.invoice_date) {
        const d = new Date(inv.invoice_date);
        if (dateRange.start && d < new Date(dateRange.start)) matchDate = false;
        if (dateRange.end) { const e = new Date(dateRange.end); e.setHours(23,59,59,999); if (d > e) matchDate = false; }
      }
      return matchSearch && matchStatus && matchDate;
    });
  }, [invoices, searchQuery, statusFilter, dateRange]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const hasActiveFilters = statusFilter !== "All" || dateRange.start || dateRange.end;

  if (loading) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Purchase History</h1>
            <p className="text-gray-400 text-sm">Loading customer data...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-2/3 mb-3" />
              <div className="h-7 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 p-10 text-center">
          <div className="w-10 h-10 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-bold">Loading purchase history...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Customer Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute permission={PERMISSIONS.CUSTOMERS.VIEW}>
      <div className="space-y-6 pb-12 w-full max-w-full">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-black dark:text-white tracking-tight">Purchase History</h1>
              <p className="text-gray-400 text-sm font-normal">All invoices for this customer</p>
            </div>
          </div>
        </div>

        {/* ── Customer Card ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-black to-zinc-700 dark:from-zinc-800 dark:to-zinc-900 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center flex-shrink-0">
                {customer.profile_image ? (
                  <img
                    src={customerService.getProfileImageUrl(customer.profile_image)}
                    alt={customer.full_name}
                    className="w-full h-full object-cover rounded-2xl"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=E31E24&color=fff`; }}
                  />
                ) : (
                  <span className="text-white text-2xl font-black">
                    {customer.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-black text-white truncate">{customer.full_name}</h2>
                  {customer.status && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[10px] font-black text-green-400 uppercase tracking-widest">
                      <BadgeCheck className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">{customer.customer_code}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {customer.phone && (
                    <div className="flex items-center gap-1.5 text-white/70 text-xs">
                      <Phone className="w-3.5 h-3.5" /> {customer.phone}
                    </div>
                  )}
                  {customer.business_name && (
                    <div className="flex items-center gap-1.5 text-white/70 text-xs">
                      <Building className="w-3.5 h-3.5" /> {customer.business_name}
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-1.5 text-white/70 text-xs">
                      <MapPin className="w-3.5 h-3.5" /> <span className="truncate max-w-[200px]">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y sm:divide-y-0 divide-gray-100 dark:divide-zinc-800">
            <div className="p-4 sm:p-5">
              <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Purchases</p>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">{formatCurrency(customer.total_purchase)}</p>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Outstanding Balance</p>
              <p className={`text-lg font-black ${parseFloat(customer.outstanding_balance || 0) > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {formatCurrency(customer.outstanding_balance)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Invoices", value: stats.count, icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { label: "Total Value", value: formatCurrency(stats.total), icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
            { label: "Pending", value: stats.pendingCount, icon: Clock, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10" },
            { label: "Overdue", value: stats.overdueCount, icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 sm:p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} />
              </div>
              <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
              <p className={`text-lg font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Search + Filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoice number or notes..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex-none p-3.5 sm:px-5 sm:py-3.5 flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all filter-button ${
              isFilterOpen 
                ? 'bg-red-600 text-white shadow-red-600/10' 
                : 'bg-black dark:bg-white text-white dark:text-black shadow-black/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Collapsible Filters Card */}
        {isFilterOpen && (
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-zinc-800/50">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the customer's purchase history below.</p>
              </div>
              {hasActiveFilters && (
                <button 
                  onClick={() => { setStatusFilter("All"); setDateRange({ start: "", end: "" }); setCurrentPage(1); }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="partial">Partial</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, start: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, end: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Invoices Table / Cards ── */}
        <TableContainer>
          <Table minWidth="800px">
            <TableHeader>
              <TableHeaderCell>Invoice #</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Balance</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Action</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? paginated.map((invoice) => {
                const { cls, dot, label } = getStatusStyle(invoice.invoice_status);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{invoice.invoice_number || "—"}</p>
                          {invoice.invoice_notes && <p className="text-xs text-gray-400 truncate max-w-[150px]">{invoice.invoice_notes}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(invoice.invoice_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {formatCurrency(invoice.invoice_total || invoice.invoice_amount || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-black ${parseFloat(invoice.balance_due || 0) > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                        {formatCurrency(invoice.balance_due || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cls}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/sales/invoices/view/${invoice.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-xl transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan="6" className="py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                      <Receipt className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
                    </div>
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest text-center w-full">No invoices found</p>
                    <p className="text-gray-300 dark:text-zinc-600 text-xs mt-1 text-center w-full">Try adjusting your filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="px-6 py-5 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Showing <span className="text-gray-900 dark:text-white font-black">{Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}</span> – <span className="text-gray-900 dark:text-white font-black">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-sm font-black transition-all ${currentPage === i + 1 ? "bg-black text-white dark:bg-white dark:text-black shadow-lg" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
      </div>
    </ProtectedRoute>
  );
}

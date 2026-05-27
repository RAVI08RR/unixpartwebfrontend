"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, Download, ChevronLeft, ChevronRight, 
  DollarSign, Hash, Calendar, Building2, User, FileText, 
  X, RotateCcw, Package, ChevronDown, CheckSquare, Square
} from "lucide-react";
import { apiClient } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";
import { exportToExcel } from "@/app/lib/utils/exportUtils";
import useSWR from "swr";

// Premium Multi-Select Dropdown Component
function MultiSelectFilter({ label, options, selectedValues, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (val) => {
    const isSelected = selectedValues.includes(val);
    const newSelected = isSelected 
      ? selectedValues.filter(v => v !== val) 
      : [...selectedValues, val];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.value));
    }
  };

  return (
    <div className="relative">
      <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all text-left shadow-sm truncate"
      >
        <span className="truncate">
          {selectedValues.length === 0 
            ? placeholder 
            : selectedValues.length === options.length
              ? `All ${label} Selected`
              : `${selectedValues.length} Selected`
          }
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800 mb-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:opacity-80"
              >
                {selectedValues.length === options.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 hover:opacity-80"
              >
                Clear
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {options.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleOption(opt.value)}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-gray-700 dark:text-zinc-300"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-300 dark:text-zinc-700 shrink-0" />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RetainedProfitReportPage() {
  const { success, error } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  
  // State variables for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true); // default true for better visibility on load
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load dropdown lists
  const { data: dropdownBranches } = useSWR('/api/dropdown/branches', () => apiClient.get('/api/dropdown/branches'));
  const { data: dropdownSuppliers } = useSWR('/api/dropdown/suppliers', () => apiClient.get('/api/dropdown/suppliers'));
  const { data: dropdownStockItems } = useSWR('/api/dropdown/stock-items', () => apiClient.get('/api/dropdown/stock-items'));
  
  // Load refund records
  const { data: rawRefunds, error: fetchError, mutate } = useSWR('/api/refund-items', () => apiClient.get('/api/refund-items/'));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format drop downs
  const branchOptions = useMemo(() => {
    if (!dropdownBranches) return [];
    return dropdownBranches.map(b => ({ label: b.label || b.name, value: String(b.id) }));
  }, [dropdownBranches]);

  const supplierOptions = useMemo(() => {
    if (!dropdownSuppliers) return [];
    return dropdownSuppliers.map(s => ({ label: s.label || s.name, value: String(s.id) }));
  }, [dropdownSuppliers]);

  const stockItemOptions = useMemo(() => {
    if (!dropdownStockItems) return [];
    return dropdownStockItems.map(i => ({ label: i.label || i.name, value: String(i.id) }));
  }, [dropdownStockItems]);

  // Clean / parse refund records to include unified fields
  const parsedRefunds = useMemo(() => {
    if (!Array.isArray(rawRefunds)) return [];
    
    return rawRefunds.map(ref => {
      // Find branch details
      const invoice = ref.invoice_item?.invoice || ref.invoice;
      const branchId = invoice?.branch_id || invoice?.branch?.id;
      let branchName = invoice?.branch?.branch_name || invoice?.branch?.name || "-";
      let branchCode = invoice?.branch?.branch_code || "-";
      
      // Stock prefix extraction
      const stockNum = ref.invoice_item?.stock_number || ref.invoice_item?.po_item?.stock_number || ref.stock_number;
      if (stockNum && branchCode === "-") {
        const prefix = stockNum.split('-')[0]?.toUpperCase();
        if (prefix === 'DXB') {
          branchCode = 'DXB';
          branchName = 'Dubai Branch';
        } else if (prefix === 'AUH') {
          branchCode = 'AUH';
          branchName = 'Abu Dhabi Branch';
        } else if (prefix === 'SHJ') {
          branchCode = 'SHJ';
          branchName = 'Sharjah Branch';
        }
      }

      // Find supplier details
      const supplier = ref.invoice_item?.po_item?.purchase_order?.container?.supplier || invoice?.supplier;
      const supplierId = supplier?.id || ref.invoice_item?.po_item?.supplier_id;
      const supplierName = supplier?.name || supplier?.supplier_name || "-";
      const supplierCode = supplier?.supplier_code || "-";

      // Find stock item details
      const stockItem = ref.invoice_item?.po_item?.stock_item;
      const stockItemId = stockItem?.id || ref.invoice_item?.stock_item_id;
      const itemName = ref.invoice_item?.item_name || stockItem?.name || "-";

      const originalPaid = parseFloat(ref.invoice_item?.paid_amount_calculated || ref.invoice_item?.paid_amount || ref.invoice_item?.sale_amount || 0);
      const refundAmount = parseFloat(ref.refund_amount || 0);
      const supplierProfit = parseFloat(ref.supplier_profit || 0);

      return {
        ...ref,
        resolvedBranchId: branchId ? String(branchId) : null,
        resolvedBranchName: branchName,
        resolvedBranchCode: branchCode,
        resolvedSupplierId: supplierId ? String(supplierId) : null,
        resolvedSupplierName: supplierName,
        resolvedSupplierCode: supplierCode,
        resolvedStockItemId: stockItemId ? String(stockItemId) : null,
        resolvedItemName: itemName,
        resolvedStockNum: stockNum || "-",
        resolvedInvoiceNum: invoice?.invoice_number || "-",
        originalPaid,
        refundAmount,
        supplierProfit
      };
    });
  }, [rawRefunds]);

  // Apply filters
  const filteredRefunds = useMemo(() => {
    return parsedRefunds.filter(ref => {
      // 1. Search Query
      const searchTarget = `${ref.id || ''} ${ref.resolvedInvoiceNum} ${ref.resolvedItemName} ${ref.resolvedStockNum} ${ref.refund_reason || ''}`.toLowerCase();
      if (searchQuery && !searchTarget.includes(searchQuery.toLowerCase())) return false;

      // 2. Branch Filter (Multi-select)
      if (selectedBranches.length > 0) {
        const branchMatch = selectedBranches.includes(ref.resolvedBranchId) || selectedBranches.includes(ref.resolvedBranchCode);
        if (!branchMatch) return false;
      }

      // 3. Supplier Filter (Multi-select)
      if (selectedSuppliers.length > 0) {
        if (!selectedSuppliers.includes(ref.resolvedSupplierId) && !selectedSuppliers.includes(ref.resolvedSupplierCode)) return false;
      }

      // 4. Stock Item Filter (Multi-select)
      if (selectedItems.length > 0) {
        if (!selectedItems.includes(ref.resolvedStockItemId)) return false;
      }

      // 5. Date Range Filter
      if (ref.refund_date) {
        const refDate = new Date(ref.refund_date);
        if (dateRange.start) {
          const sDate = new Date(dateRange.start);
          sDate.setHours(0, 0, 0, 0);
          if (refDate < sDate) return false;
        }
        if (dateRange.end) {
          const eDate = new Date(dateRange.end);
          eDate.setHours(23, 59, 59, 999);
          if (refDate > eDate) return false;
        }
      }

      return true;
    });
  }, [parsedRefunds, searchQuery, selectedBranches, selectedSuppliers, selectedItems, dateRange]);

  // Summary counts
  const summaries = useMemo(() => {
    let totalRetained = 0;
    let totalRefunded = 0;
    let totalPaid = 0;

    filteredRefunds.forEach(ref => {
      totalRetained += ref.supplierProfit;
      totalRefunded += ref.refundAmount;
      totalPaid += ref.originalPaid;
    });

    return {
      totalRetained,
      totalRefunded,
      totalPaid,
      count: filteredRefunds.length
    };
  }, [filteredRefunds]);

  // Pagination
  const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRefunds = filteredRefunds.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = async () => {
    try {
      const exportColumns = [
        { key: 'id', label: 'Refund ID', formatter: (val) => `REF-${val}` },
        { key: 'refund_date', label: 'Date' },
        { key: 'resolvedInvoiceNum', label: 'Invoice #' },
        { key: 'resolvedItemName', label: 'Part Name' },
        { key: 'resolvedStockNum', label: 'Stock #' },
        { key: 'resolvedBranchCode', label: 'Branch' },
        { key: 'resolvedSupplierName', label: 'Supplier' },
        { key: 'originalPaid', label: 'Original Paid', formatter: (val) => `AED ${parseFloat(val || 0).toFixed(2)}` },
        { key: 'refundAmount', label: 'Refund Amount', formatter: (val) => `AED ${parseFloat(val || 0).toFixed(2)}` },
        { key: 'supplierProfit', label: 'Retained Profit', formatter: (val) => `AED ${parseFloat(val || 0).toFixed(2)}` },
        { key: 'refund_reason', label: 'Notes' }
      ];

      await exportToExcel(
        filteredRefunds,
        exportColumns,
        `retained-profit-report-${new Date().toISOString().split('T')[0]}.xlsx`
      );
      success("Report exported successfully!");
    } catch (err) {
      console.error(err);
      error("Export failed: " + err.message);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Retained Profit Report</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal mt-1">
            Track retained profits and supplier profits generated from cancelled or returned items.
          </p>
        </div>
        
        {/* Export Button */}
        <div className="flex items-center gap-6 justify-end">
          <button 
            onClick={handleExport}
            disabled={filteredRefunds.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shrink-0 active:scale-95"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Retained Profit Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
            <DollarSign className="w-40 h-40 text-emerald-500" />
          </div>
          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Retained Profit</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2">
            AED {summaries.totalRetained.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Supplier retains unrefunded credit</p>
        </div>

        {/* Total Refunded Card */}
        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 dark:border-orange-500/10 rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
            <RotateCcw className="w-40 h-40 text-orange-500" />
          </div>
          <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Total Refunded Amount</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2">
            AED {summaries.totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Returned to original customers</p>
        </div>

        {/* Original Paid Amount Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-500/10 rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
            <Package className="w-40 h-40 text-blue-500" />
          </div>
          <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Original Value (Paid)</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2">
            AED {summaries.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Sale amount before returns</p>
        </div>

        {/* Transactions Card */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 dark:border-purple-500/10 rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
            <Hash className="w-40 h-40 text-purple-500" />
          </div>
          <p className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Returns & Refunds</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2">
            {summaries.count}
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Processed transactions</p>
        </div>
      </div>

      {/* Collapsible Filters Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800/80 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Filter the retained profit summaries below.</p>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-lg transition-colors border border-gray-200/40 dark:border-zinc-800"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {isFilterOpen && (
          <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Search</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Invoice #, stock #, name..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Branch Multi-select */}
              <MultiSelectFilter
                label="Branch"
                options={branchOptions}
                selectedValues={selectedBranches}
                onChange={setSelectedBranches}
                placeholder="All Branches"
              />

              {/* Supplier Multi-select */}
              <MultiSelectFilter
                label="Supplier"
                options={supplierOptions}
                selectedValues={selectedSuppliers}
                onChange={setSelectedSuppliers}
                placeholder="All Suppliers"
              />

              {/* Stock Items Multi-select */}
              <MultiSelectFilter
                label="Stock Items"
                options={stockItemOptions}
                selectedValues={selectedItems}
                onChange={setSelectedItems}
                placeholder="All Items"
              />

              {/* Pick Date Range */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Date Range</label>
                <div className="relative">
                  <button 
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    type="button"
                    className="w-full flex items-center justify-between px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-all text-left shadow-sm truncate"
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
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDatePickerOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
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
                            type="button"
                            onClick={() => { setDateRange({ start: '', end: '' }); setIsDatePickerOpen(false); }}
                            className="px-3 py-1.5 text-[10px] font-black uppercase text-gray-400 hover:text-gray-600"
                          >
                            Clear
                          </button>
                          <button 
                            type="button"
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
              </div>
            </div>

            {/* Clear Filters Button Row */}
            <div className="flex items-center">
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBranches([]);
                  setSelectedSuppliers([]);
                  setSelectedItems([]);
                  setDateRange({ start: '', end: '' });
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table / Mobile Cards */}
      <div className="bg-white dark:bg-zinc-900 md:rounded-[32px] border-y md:border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20 overflow-hidden">
        
        {/* Mobile Cards View */}
        <div className="block lg:hidden divide-y divide-gray-100 dark:divide-zinc-800">
          {!rawRefunds ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
              <p className="text-red-600 font-bold text-sm tracking-widest uppercase">Loading records...</p>
            </div>
          ) : paginatedRefunds.length > 0 ? (
            paginatedRefunds.map((ref, index) => (
              <div key={index} className="p-4 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-gray-900 dark:text-white">REF-{ref.id}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-[10px] font-black uppercase tracking-wider rounded">
                        {ref.resolvedBranchCode}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200 truncate">{ref.resolvedItemName}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Stock #: {ref.resolvedStockNum}</p>
                    <p className="text-xs text-gray-400">Invoice: <span className="font-semibold text-gray-600 dark:text-zinc-300">{ref.resolvedInvoiceNum}</span></p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Retained Profit</p>
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400">AED {ref.supplierProfit.toFixed(2)}</p>
                    <p className="text-xs text-orange-500 font-bold mt-1">Ref: AED {ref.refundAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-zinc-800/40 rounded-xl text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
                  <div>
                    <span className="block text-[9px] font-black text-gray-400 uppercase">Supplier</span>
                    <span className="font-semibold">{ref.resolvedSupplierName}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] font-black text-gray-400 uppercase">Return Date</span>
                    <span className="font-semibold">
                      {ref.refund_date ? new Date(ref.refund_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
              No refunds found matching search filters
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800">
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Refund ID</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Date</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Invoice #</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Part / Item</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Stock #</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Branch</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10">Supplier</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10 text-right">Original Paid</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10 text-right">Refund Amount</th>
                <th className="px-4 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] bg-gray-50/10 text-right">Retained Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {!rawRefunds ? (
                <tr>
                  <td colSpan="10" className="py-24 text-center">
                    <div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="text-red-600 font-bold text-sm tracking-widest uppercase">Loading records...</p>
                  </td>
                </tr>
              ) : paginatedRefunds.length > 0 ? (
                paginatedRefunds.map((ref, index) => (
                  <tr key={index} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-5 text-sm font-black text-gray-900 dark:text-white uppercase">REF-{ref.id}</td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-700 dark:text-zinc-300">
                      {ref.refund_date ? new Date(ref.refund_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-700 dark:text-zinc-300">{ref.resolvedInvoiceNum}</td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-700 dark:text-zinc-300 truncate max-w-[200px]" title={ref.resolvedItemName}>
                      {ref.resolvedItemName}
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-500 dark:text-zinc-400">{ref.resolvedStockNum}</td>
                    <td className="px-4 py-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {ref.resolvedBranchCode}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-700 dark:text-zinc-300 leading-tight">
                      {ref.resolvedSupplierName}
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-gray-500 dark:text-zinc-400 text-right">
                      AED {ref.originalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-orange-500 dark:text-orange-400 text-right">
                      AED {ref.refundAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-5 text-sm font-black text-emerald-600 dark:text-emerald-400 text-right">
                      AED {ref.supplierProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="py-24 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
                    No records found matching search filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredRefunds.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredRefunds.length}</span> entries
          </p>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

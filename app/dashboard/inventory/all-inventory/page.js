"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, Search, Filter, Download, 
  Eye, FileText, Calendar, User, 
  ChevronLeft, ChevronRight, X, 
  Building2, ShoppingCart, RefreshCcw, MoreVertical,
  Package, Hash, DollarSign, Truck, MapPin, Layers, Box, Check, ClipboardList
} from "lucide-react";
import { poItemService } from "@/app/lib/services/poItemService";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { useSuppliers } from "@/app/lib/hooks/useSuppliers";
import { useToast } from "@/app/components/Toast";
import Link from "next/link";
import ExportButton from "@/app/components/ExportButton";
import { formatDateForExport, formatCurrencyForExport } from "@/app/lib/utils/exportUtils";

export default function AllInventoryPage() {
  const router = useRouter();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Custom filter states matching screenshot specs
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [stockNumberFilter, setStockNumberFilter] = useState("");
  const [itemNameFilter, setItemNameFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [saleDateRange, setSaleDateRange] = useState({ start: "", end: "" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [operatorFilter, setOperatorFilter] = useState("=");
  const [saleAmountFilter, setSaleAmountFilter] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { branches: apiBranches } = useBranches(0, 100, true);
  const { stockItems: apiStockItems } = useStockItems(0, 100, null, true);
  const { suppliers } = useSuppliers(0, 100, null, true);
  const { success, error: showError } = useToast();

  const branches = useMemo(() => Array.isArray(apiBranches) ? apiBranches : [], [apiBranches]);
  const branchList = branches;
  const supplierList = useMemo(() => Array.isArray(suppliers) ? suppliers : [], [suppliers]);
  const stockItemsList = useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);

  const [editFormData, setEditFormData] = useState({
    stock_number: "",
    item_id: "",
    po_description: "",
    stock_notes: "",
    current_branch_id: "",
    status: "in_stock",
    quantity: 1,
    po_id: ""
  });

  // Fetch inventory data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetching first 100 items to enable client-side filtering (backend max limit is 100)
      const data = await poItemService.getAll(0, 100);
      setInventoryItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle direct stock number search/scan for navigation
  useEffect(() => {
    const query = stockNumberFilter.trim();
    if (query.split('-').length >= 3 && query.length > 10) {
      const match = inventoryItems.find(i => i.stock_number === query);
      if (match) {
        handleViewDetails(match);
      }
    }
  }, [stockNumberFilter, inventoryItems]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [inventoryItems.length, supplierFilter, stockNumberFilter, itemNameFilter, branchFilter, statusFilter, saleDateRange, operatorFilter, saleAmountFilter]);

  useEffect(() => {
    const hasActive = supplierFilter !== "All" ||
                      stockNumberFilter !== "" ||
                      itemNameFilter !== "" ||
                      branchFilter !== "All" ||
                      statusFilter !== "All" ||
                      saleAmountFilter !== "" ||
                      (saleDateRange && (saleDateRange.start !== "" || saleDateRange.end !== ""));
    if (hasActive) {
      setIsFilterOpen(true);
    }
  }, [supplierFilter, stockNumberFilter, itemNameFilter, branchFilter, statusFilter, saleDateRange, saleAmountFilter]);

  // Filter logic
  const filteredData = useMemo(() => {
    return inventoryItems.filter(item => {
      // 1. Supplier Filter
      const matchesSupplier = supplierFilter === "All" || 
                              String(item.purchase_order?.container?.supplier_id) === String(supplierFilter) || 
                              String(item.purchase_order?.container?.supplier?.id) === String(supplierFilter);
      
      // 2. Stock Number Filter
      const matchesStock = !stockNumberFilter || (item.stock_number || "").toLowerCase().includes(stockNumberFilter.toLowerCase());
      
      // 3. Item Name Filter
      const matchesItemName = !itemNameFilter || (item.stock_item?.name || "").toLowerCase().includes(itemNameFilter.toLowerCase());
      
      // 4. Branch Filter
      const matchesBranch = branchFilter === "All" || 
                            String(item.current_branch_id) === String(branchFilter) || 
                            String(item.current_branch?.id) === String(branchFilter) ||
                            item.current_branch?.branch_code === branchFilter;
      
      // 5. Status Filter
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      
      // 6. Sale Date Range Filter
      let matchesSaleDate = true;
      if (saleDateRange.start || saleDateRange.end) {
        const saleDateStr = item.invoice_items?.[0]?.sale_date;
        const saleDate = saleDateStr ? new Date(saleDateStr) : null;
        if (saleDate) {
          if (saleDateRange.start && new Date(saleDateRange.start) > saleDate) {
            matchesSaleDate = false;
          }
          if (saleDateRange.end) {
            const endDate = new Date(saleDateRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (saleDate > endDate) {
              matchesSaleDate = false;
            }
          }
        } else {
          matchesSaleDate = false;
        }
      }

      // 7. Sale Amount & Operator Filter
      let matchesSaleAmount = true;
      if (saleAmountFilter) {
        const saleAmount = parseFloat(item.invoice_items?.[0]?.sale_amount);
        const filterVal = parseFloat(saleAmountFilter);
        if (!isNaN(saleAmount) && !isNaN(filterVal)) {
          if (operatorFilter === "=") matchesSaleAmount = (saleAmount === filterVal);
          else if (operatorFilter === ">") matchesSaleAmount = (saleAmount > filterVal);
          else if (operatorFilter === "<") matchesSaleAmount = (saleAmount < filterVal);
          else if (operatorFilter === ">=") matchesSaleAmount = (saleAmount >= filterVal);
          else if (operatorFilter === "<=") matchesSaleAmount = (saleAmount <= filterVal);
        } else {
          matchesSaleAmount = false;
        }
      }

      return matchesSupplier && matchesStock && matchesItemName && matchesBranch && matchesStatus && matchesSaleDate && matchesSaleAmount;
    });
  }, [inventoryItems, supplierFilter, stockNumberFilter, itemNameFilter, branchFilter, statusFilter, saleDateRange, operatorFilter, saleAmountFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount) => {
    if (!amount) return "-";
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
        year: 'numeric'
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  // Export columns configuration
  const exportColumns = [
    { key: 'stock_number', label: 'Stock Number' },
    { 
      key: 'purchase_order.container.supplier.supplier_code', 
      label: 'Supplier Code',
      formatter: (value, row) => row.purchase_order?.container?.supplier?.supplier_code || row.stock_number?.split('-')[1] || '-'
    },
    { 
      key: 'purchase_order.container.container_number', 
      label: 'Container Code',
      formatter: (value, row) => row.purchase_order?.container?.container_number || '-'
    },
    { 
      key: 'stock_item.name', 
      label: 'Item Name',
      formatter: (value, row) => row.stock_item?.name || '-'
    },
    { key: 'po_description', label: 'PO Description' },
    { 
      key: 'current_branch.branch_code', 
      label: 'Branch',
      formatter: (value, row) => row.current_branch?.branch_code || '-'
    },
    { key: 'status', label: 'Status' },
    { key: 'quantity', label: 'Quantity' },
    { 
      key: 'invoice_items[0].sale_amount', 
      label: 'Sale Amount',
      formatter: (value, row) => row.invoice_items?.[0]?.sale_amount ? formatCurrencyForExport(row.invoice_items[0].sale_amount) : '-'
    },
    { 
      key: 'invoice_items[0].invoice.invoice_number', 
      label: 'Invoice Number',
      formatter: (value, row) => row.invoice_items?.[0]?.invoice?.invoice_number || '-'
    },
    { 
      key: 'invoice_items[0].sale_date', 
      label: 'Sale Date',
      formatter: (value, row) => row.invoice_items?.[0]?.sale_date ? formatDateForExport(row.invoice_items[0].sale_date) : '-'
    },
    { 
      key: 'created_at', 
      label: 'Created Date',
      formatter: formatDateForExport
    }
  ];

  const clearFilters = () => {
    setSupplierFilter("All");
    setStockNumberFilter("");
    setItemNameFilter("");
    setBranchFilter("All");
    setStatusFilter("All");
    setSaleDateRange({ start: "", end: "" });
    setOperatorFilter("=");
    setSaleAmountFilter("");
    setCurrentPage(1);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleViewDetails = (item) => {
    router.push(`/dashboard/inventory/all-inventory/view/${item.stock_number}`);
    setMenuOpenId(null);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditFormData({
      stock_number: item.stock_number || "",
      item_id: item.item_id ? String(item.item_id) : "",
      po_description: item.po_description || "",
      stock_notes: item.stock_notes || "",
      current_branch_id: item.current_branch_id ? String(item.current_branch_id) : "",
      status: item.status || "in_stock",
      quantity: item.quantity || 1,
      po_id: item.po_id || ""
    });
    setEditModalOpen(true);
    setMenuOpenId(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Include all required fields from API schema
      const payload = {
        po_id: parseInt(editFormData.po_id),
        item_id: parseInt(editFormData.item_id),
        po_description: editFormData.po_description,
        stock_notes: editFormData.stock_notes || "",
        current_branch_id: parseInt(editFormData.current_branch_id),
        status: editFormData.status,
        quantity: parseInt(editFormData.quantity)
      };
      
      console.log('📦 Updating item ID:', selectedItem.id);
      console.log('📦 Payload:', JSON.stringify(payload, null, 2));
      
      await poItemService.update(selectedItem.id, payload);
      success("Item updated successfully");
      setEditModalOpen(false);
      fetchData(); // Refresh the data
    } catch (err) {
      console.error('❌ Update failed:', err);
      showError(err.message || "Failed to update item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Inventory</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">A complete list of all stock items in your inventory.</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 lg:mt-0 justify-end">
          <button 
            onClick={() => success("Stock taking process initiated.")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all active:scale-95"
          >
            <ClipboardList className="w-4 h-4 text-gray-500" />
            <span>Stock Taking</span>
          </button>

          <ExportButton
            data={filteredData}
            columns={exportColumns}
            filename={`all-inventory-${new Date().toISOString().split('T')[0]}`}
            onSuccess={(format) => success(`Inventory exported successfully as ${format}!`)}
            onError={(err) => showError(`Export failed: ${err.message}`)}
          />
        </div>
      </div>

      {/* Filters Section Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the inventory list below.</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Filter by Supplier */}
              <div>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by Supplier</option>
                  {supplierList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label || s.name || s.supplier_code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search by Stock Number */}
              <div>
                <input 
                  type="text" 
                  placeholder="Search by Stock Number..."
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white"
                  value={stockNumberFilter}
                  onChange={(e) => setStockNumberFilter(e.target.value)}
                />
              </div>

              {/* Filter by Item name */}
              <div>
                <input 
                  type="text" 
                  placeholder="Filter by Item name..."
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white"
                  value={itemNameFilter}
                  onChange={(e) => setItemNameFilter(e.target.value)}
                />
              </div>

              {/* Filter by Branch */}
              <div>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by Branch</option>
                  {branchList.map((b) => (
                    <option key={b.id || b.branch_code} value={b.id || b.branch_code}>
                      {b.label || b.branch_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">Filter by Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="sold">Sold</option>
                  <option value="dismantled">Dismantled</option>
                </select>
              </div>

              {/* Filter by Sale Date (Range) */}
              <div className="relative">
                <button 
                  onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  className="w-full flex items-center gap-2 px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-all text-left shadow-sm justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {saleDateRange.start || saleDateRange.end 
                        ? `${saleDateRange.start ? new Date(saleDateRange.start).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : ''} - ${saleDateRange.end ? new Date(saleDateRange.end).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : ''}`
                        : "Filter by Sale Date (Range)"
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
                          value={saleDateRange.start}
                          onChange={(e) => setSaleDateRange({ ...saleDateRange, start: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">End Date</label>
                        <input 
                          type="date"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none"
                          value={saleDateRange.end}
                          onChange={(e) => setSaleDateRange({ ...saleDateRange, end: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <button 
                          onClick={() => { setSaleDateRange({ start: '', end: '' }); setIsDatePickerOpen(false); }}
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

              {/* Operator + Sale Amount Selector */}
              <div className="flex gap-2">
                <select
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                  className="w-16 px-2.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="=">=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Sale Amount"
                  className="flex-1 px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white"
                  value={saleAmountFilter}
                  onChange={(e) => setSaleAmountFilter(e.target.value)}
                />
              </div>

              {/* Empty spacing for matching grid columns */}
              <div className="hidden md:block"></div>
            </div>

            {/* Clear Filters Button Row */}
            <div className="flex items-center pt-2">
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-950/20 border border-gray-200/65 dark:border-zinc-700/50 rounded-xl text-sm font-bold text-gray-600 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400 shadow-sm active:scale-95 transition-all animate-in fade-in duration-200"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table / Mobile Cards */}
      <div className="bg-white dark:bg-zinc-900 md:rounded-[32px] border-y md:border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20">
        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-gray-100 dark:divide-zinc-800">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
              <p className="text-red-600 font-bold text-sm tracking-widest uppercase">Loading...</p>
            </div>
          ) : paginatedData.length > 0 ? (
            paginatedData.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">{item.stock_item?.name || item.po_description || "-"}</p>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">{item.stock_number || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      item.status === 'in_stock' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                      item.status === 'sold' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' :
                      'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                    }`}>{item.status?.replace('_', ' ') || "-"}</span>
                    <div className="relative">
                      <button onClick={() => toggleMenu(item.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      {menuOpenId === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 z-[200] py-1.5">
                          <button onClick={() => handleViewDetails(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                            <Eye className="w-4 h-4" />View Details
                          </button>
                          <button onClick={() => handleEditItem(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                            <FileText className="w-4 h-4" />Edit Item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 pl-13">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-bold">
                    <Building2 className="w-3 h-3" />{item.current_branch?.branch_code || "-"}
                  </span>
                  <span className="text-xs text-gray-400">Qty: <strong className="text-gray-700 dark:text-gray-300">{item.quantity || 1}</strong></span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-gray-300 dark:text-zinc-600" />
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">No Items Found</p>
              <p className="text-xs text-gray-400">Try adjusting your filters.</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Item / Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Stock Number</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Quantity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Branch</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-inner">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{item.stock_item?.name || item.po_description || "-"}</p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">{item.po_description || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{item.stock_number || "-"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.quantity || 1}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold">
                        <Building2 className="w-3 h-3" />
                        {item.current_branch?.branch_code || "-"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${
                        item.status === 'in_stock' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                        item.status === 'sold' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' :
                        item.status === 'reserved' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' :
                        'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {item.status?.replace('_', ' ') || "-"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="relative inline-block">
                        <button onClick={() => toggleMenu(item.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {menuOpenId === item.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 z-[200] py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                            <button onClick={() => handleViewDetails(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                              <Eye className="w-4 h-4" />View Details
                            </button>
                            <button onClick={() => handleEditItem(item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                              <FileText className="w-4 h-4" />Edit Item
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                        <Package className="w-7 h-7 text-gray-300 dark:text-zinc-600" />
                      </div>
                      <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">No Items Found</p>
                      <p className="text-sm text-gray-400 font-medium">Try adjusting your filters to find what you&apos;re looking for.</p>
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


      {/* Removed View Details Modal as it's now a dedicated page */}

      {/* Edit Item Modal */}
      {editModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-zinc-800">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">Edit Inventory Item</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Update details for stock #{selectedItem.stock_number}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
              {/* Read-only Info Display */}
              <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Supplier Code</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {selectedItem.purchase_order?.container?.supplier?.supplier_code || selectedItem.stock_number?.split('-')[1] || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Container Code</p>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {selectedItem.purchase_order?.container?.container_number || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stock Number */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="DXB-001-000001"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white uppercase"
                      value={editFormData.stock_number}
                      onChange={(e) => setEditFormData({...editFormData, stock_number: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Item Category */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Item <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white appearance-none cursor-pointer"
                      value={editFormData.item_id}
                      onChange={(e) => setEditFormData({...editFormData, item_id: e.target.value})}
                      required
                    >
                      <option value="">Select Item Category</option>
                      {stockItemsList.map(si => (
                        <option key={si.id} value={si.id}>{si.label || si.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white appearance-none cursor-pointer"
                      value={editFormData.current_branch_id}
                      onChange={(e) => setEditFormData({...editFormData, current_branch_id: e.target.value})}
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.label || b.branch_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white appearance-none cursor-pointer"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    required
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>

                {/* Quantity */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number"
                    min="1"
                    placeholder="1"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({...editFormData, quantity: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* PO Description */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  PO Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Ceramic Brake Pads"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white"
                    value={editFormData.po_description}
                    onChange={(e) => setEditFormData({...editFormData, po_description: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Stock Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock Notes
                </label>
                <textarea 
                  placeholder="Additional notes about this item..."
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all dark:text-white resize-none"
                  value={editFormData.stock_notes}
                  onChange={(e) => setEditFormData({...editFormData, stock_notes: e.target.value})}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button 
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-6 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

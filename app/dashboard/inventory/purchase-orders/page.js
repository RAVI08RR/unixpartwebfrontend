"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  MoreVertical, Search, Filter, Plus, 
  ChevronLeft, ChevronRight, Pencil, Trash2, Check, X, 
  Eye, Package, Calendar, Building2, DollarSign, Hash,
  AlertCircle, FileText, Upload, Trash, ExternalLink, RefreshCcw, Download, RotateCcw
} from "lucide-react";
import { usePurchaseOrders } from "@/app/lib/hooks/usePurchaseOrders";
import { purchaseOrderService } from "@/app/lib/services/purchaseOrderService";
import { useToast } from "@/app/components/Toast";
import ExportButton from "@/app/components/ExportButton";
import { formatDateForExport, formatStatusForExport, formatCurrencyForExport } from "@/app/lib/utils/exportUtils";
import { useSuppliers } from "@/app/lib/hooks/useSuppliers";
import { useBranches } from "@/app/lib/hooks/useBranches";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { PERMISSIONS } from "@/app/lib/constants/permissions";
import { usePermission } from "@/app/lib/hooks/usePermission";

export default function PurchaseOrdersPage() {
  const { hasPermission } = usePermission();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { success, error } = useToast();
  
  // Custom filter states matching visual specs
  const [containerCodeFilter, setContainerCodeFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== "" ||
      containerCodeFilter !== "" ||
      supplierFilter !== "All" ||
      branchFilter !== "All" ||
      statusFilter !== "All" ||
      (dateRange && (dateRange.start !== "" || dateRange.end !== ""));
  }, [searchQuery, containerCodeFilter, supplierFilter, branchFilter, statusFilter, dateRange]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setContainerCodeFilter('');
    setSupplierFilter('All');
    setBranchFilter('All');
    setDateRange({ start: '', end: '' });
    setStatusFilter('All');
  };

  // Dropdown list data using dropdown spec hooks
  const { suppliers } = useSuppliers(0, 100, null, true);
  const { branches } = useBranches(0, 100, true);

  const supplierList = useMemo(() => Array.isArray(suppliers) ? suppliers : [], [suppliers]);
  const branchList = useMemo(() => Array.isArray(branches) ? branches : [], [branches]);
  
  // Data Fetching
  const itemsPerPage = 6;
  const { purchaseOrders, loading, refetch } = usePurchaseOrders(0, 100);

  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [purchaseOrders.length, searchQuery, statusFilter, containerCodeFilter, supplierFilter, branchFilter, dateRange]);

  useEffect(() => {
    const hasActive = searchQuery !== "" ||
                      containerCodeFilter !== "" ||
                      supplierFilter !== "All" ||
                      branchFilter !== "All" ||
                      statusFilter !== "All" ||
                      (dateRange && (dateRange.start !== "" || dateRange.end !== ""));
    if (hasActive) {
      setIsFilterOpen(true);
    }
  }, [searchQuery, containerCodeFilter, supplierFilter, branchFilter, statusFilter, dateRange]);

  // Menu state and delete modal
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deleteDocModalOpen, setDeleteDocModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // Filter and search logic
  const filteredPOs = useMemo(() => {
    if (!purchaseOrders) return [];
    return purchaseOrders.filter(po => {
      // 1. Search Query (PO ID, Notes)
      const searchTarget = `${po.po_id || ''} ${po.notes || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      
      // 2. Container Code Filter
      const containerCode = (po.container?.container_code || '').toLowerCase();
      const matchesContainerCode = !containerCodeFilter || containerCode.includes(containerCodeFilter.toLowerCase());
      
      // 3. Supplier Filter
      const poSupplierId = po.container?.supplier?.id || po.supplier?.id || po.supplier_id;
      const matchesSupplier = supplierFilter === "All" || String(poSupplierId) === String(supplierFilter);
      
      // 4. Branch Filter
      const poBranchId = po.container?.destination_branch?.id || po.branch?.id || po.destination_branch_id;
      const matchesBranch = branchFilter === "All" || String(poBranchId) === String(branchFilter);
      
      // 5. Date Range Filter
      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        const poDate = po.created_at ? new Date(po.created_at) : null;
        if (poDate) {
          if (dateRange.start && new Date(dateRange.start) > poDate) {
            matchesDate = false;
          }
          if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (poDate > endDate) {
              matchesDate = false;
            }
          }
        } else {
          matchesDate = false;
        }
      }

      // 6. Status Filter
      const matchesStatus = statusFilter === "All" || po.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesContainerCode && matchesSupplier && matchesBranch && matchesDate && matchesStatus;
    });
  }, [searchQuery, containerCodeFilter, supplierFilter, branchFilter, dateRange, statusFilter, purchaseOrders]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPOs = filteredPOs.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPO) return;
    setDeleteError(null);
    try {
      await purchaseOrderService.delete(selectedPO.id);
      success("Purchase order deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedPO(null);
      refetch();
    } catch (err) {
      const errorMsg = err.message || "Unknown error";
      if (errorMsg.includes("Cannot delete purchase order with items")) {
        setDeleteError("This purchase order has items. Please delete all items first before deleting the purchase order.");
      } else {
        setDeleteError(errorMsg);
        error("Failed to delete purchase order: " + errorMsg);
      }
    }
  };

  // Handle documents modal
  const handleOpenDocuments = async (po) => {
    setSelectedPO(po);
    setDocumentsModalOpen(true);
    await fetchDocuments(po.id);
  };

  const fetchDocuments = async (poId) => {
    setLoadingDocuments(true);
    try {
      const docs = await purchaseOrderService.getDocuments(poId);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleFileUpload = async (e, documentName) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPO) return;

    setUploadingDocument(true);
    try {
      await purchaseOrderService.uploadDocument(selectedPO.id, file, documentName);
      success("Document uploaded successfully!");
      await fetchDocuments(selectedPO.id);
    } catch (err) {
      error("Failed to upload document: " + err.message);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!selectedPO) return;
    try {
      await purchaseOrderService.deleteDocument(selectedPO.id, documentId);
      success("Document deleted successfully!");
      await fetchDocuments(selectedPO.id);
      setDeleteDocModalOpen(false);
      setDocToDelete(null);
    } catch (err) {
      error("Failed to delete document: " + err.message);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    if (!selectedPO) return;
    try {
      await purchaseOrderService.downloadDocument(selectedPO.id, documentId);
    } catch (err) {
      error("Failed to download document: " + err.message);
    }
  };

  const handleViewDocument = async (documentId) => {
    if (!selectedPO) return;
    try {
      const token = localStorage.getItem('access_token');
      const url = `/api/purchase-orders/${selectedPO.id}/documents/${documentId}/download`;
      
      // Open in new tab with authorization
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load document');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      // Clean up after a delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (err) {
      error("Failed to view document: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'pending';
    const styles = {
      pending: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50',
      in_stock: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50',
      cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50',
      active: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
    };
    
    // Fallback if status isn't mapping exactly
    const resolvedStyle = styles[s] || 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 border border-gray-200 dark:border-zinc-700';
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${resolvedStyle}`}>
        {s.replace('_', ' ')}
      </span>
    );
  };

  // Export columns configuration
  const exportColumns = [
    { key: 'po_id', label: 'PO ID' },
    { 
      key: 'supplier.name', 
      label: 'Supplier',
      formatter: (val, row) => row.supplier?.name || 'N/A'
    },
    { 
      key: 'supplier.supplier_code', 
      label: 'Supplier Code',
      formatter: (val, row) => row.supplier?.supplier_code || 'N/A'
    },
    { 
      key: 'branch.branch_name', 
      label: 'Branch',
      formatter: (val, row) => row.branch?.branch_name || 'N/A'
    },
    { 
      key: 'total_amount', 
      label: 'Total Amount',
      formatter: (amount) => formatCurrencyForExport(amount)
    },
    { 
      key: 'status', 
      label: 'Status',
      formatter: (status) => status?.replace('_', ' ').toUpperCase() || 'PENDING'
    },
    { 
      key: 'notes', 
      label: 'Notes'
    },
    { 
      key: 'created_at', 
      label: 'Created Date',
      formatter: formatDateForExport
    },
    { 
      key: 'updated_at', 
      label: 'Last Updated',
      formatter: formatDateForExport
    }
  ];

  if (!isMounted) return null;

  return (
    <ProtectedRoute permission={PERMISSIONS.PURCHASE_ORDERS.VIEW}>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Purchase Orders</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">Create and manage purchase orders for stock replenishment.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by PO ID, notes..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 btn-mobile-arrange">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all filter-button ${
                isFilterOpen 
                  ? 'bg-red-600 text-white shadow-red-600/10' 
                  : 'bg-black dark:bg-white text-white dark:text-black shadow-black/10'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            <ExportButton
              data={filteredPOs}
              columns={exportColumns}
              filename={`purchase-orders-${new Date().toISOString().split('T')[0]}`}
              onSuccess={(format) => success(`Purchase orders exported successfully as ${format}!`)}
              onError={(err) => error(`Export failed: ${err.message}`)}
            />

            {hasPermission(PERMISSIONS.PURCHASE_ORDERS.CREATE) && (
              <Link 
                href="/dashboard/inventory/purchase-orders/add"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all add-button"
              >
                <Plus className="w-4 h-4" />
                <span className="whitespace-nowrap font-black">New Purchase Order</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Filters Card */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-zinc-800/50">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the purchase orders list below.</p>
            </div>
            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Search by Container Code */}
            <div>
              <input 
                type="text" 
                placeholder="Search by Container Code..."
                className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all placeholder-gray-400 dark:placeholder-zinc-500 text-gray-900 dark:text-white"
                value={containerCodeFilter}
                onChange={(e) => setContainerCodeFilter(e.target.value)}
              />
            </div>

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
                    {s.supplier_name || s.name || s.label || (s.supplier_code ? `Supplier ${s.supplier_code}` : `Supplier #${s.id}`)}
                  </option>
                ))}
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
                {branchList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label || b.branch_name || b.name || `Branch #${b.id}`}
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
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="In_Stock">In Stock</option>
                <option value="Cancelled">Cancelled</option>
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
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[200] p-4 animate-in fade-in slide-in-from-top-1 duration-200 space-y-3">
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
          </div>
        </div>
      )}

      {/* Main Table / Mobile Cards */}
      <div className="bg-white dark:bg-zinc-900 md:rounded-[32px] border-y md:border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800">
                <th className="px-6 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">PO ID</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Container Code</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Container No.</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Supplier Code</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Arrival Date</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Arrival Branch</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Revenue</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Items In Stock</th>
                <th className="px-6 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr><td colSpan="9" className="py-24 text-center"><RefreshCcw className="w-8 h-8 mx-auto animate-spin text-gray-300" /></td></tr>
              ) : paginatedPOs.map((po, index) => (
                <tr key={po.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                        <Hash className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{po.po_id}</p>
                        <p className="text-xs text-gray-400 mt-1 font-bold truncate max-w-[150px]">{po.notes || 'No notes'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6"><span className="text-sm font-bold text-gray-700 dark:text-zinc-300">{po.container?.container_code || '-'}</span></td>
                  <td className="px-6 py-6"><span className="text-sm font-bold text-gray-700 dark:text-zinc-300">{po.container?.container_number || '-'}</span></td>
                  <td className="px-6 py-6"><span className="text-sm font-bold text-gray-700 dark:text-zinc-300">{po.container?.supplier?.supplier_code || '-'}</span></td>
                  <td className="px-6 py-6"><span className="text-sm font-bold text-gray-700 dark:text-zinc-300">{po.created_at ? new Date(po.created_at).toLocaleDateString() : '-'}</span></td>
                  <td className="px-6 py-6 font-bold text-sm">{po.container?.destination_branch?.branch_name || '-'}</td>
                  <td className="px-6 py-6 font-black text-sm text-gray-900 dark:text-white">AED {parseFloat(po.total_container_revenue).toLocaleString()}</td>
                  <td className="px-6 py-6"><span className="text-sm font-bold text-gray-600 dark:text-zinc-400">{po.items_in_stock} units</span></td>
                  <td className="px-6 py-6 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => toggleMenu(po.id)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {menuOpenId === po.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[200] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <Link 
                            href={`/dashboard/inventory/purchase-orders/items/${po.id}`}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-blue-500" /> View Items
                          </Link>
                          <button 
                            onClick={() => { handleOpenDocuments(po); setMenuOpenId(null); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
                          >
                            <FileText className="w-4 h-4 text-purple-500" /> Documents
                          </button>
                          {hasPermission(PERMISSIONS.PURCHASE_ORDERS.UPDATE) && (
                            <Link 
                              href={`/dashboard/inventory/purchase-orders/edit/${po.id}`}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-amber-500" /> Edit Order
                            </Link>
                          )}
                          {hasPermission(PERMISSIONS.PURCHASE_ORDERS.DELETE) && (
                            <>
                              <div className="my-1 border-t border-gray-100 dark:border-zinc-800"></div>
                              <button 
                                onClick={() => { setSelectedPO(po); setDeleteModalOpen(true); setMenuOpenId(null); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                              >
                                <Trash2 className="w-4 h-4" /> Delete Order
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="lg:hidden divide-y divide-gray-50 dark:divide-zinc-800/50">
          {paginatedPOs.map((po) => (
            <div key={po.id} className="p-5 active:bg-gray-50 dark:active:bg-zinc-900 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/10 rounded-xl flex items-center justify-center text-red-600">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{po.po_id}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{po.container?.container_code || 'No Container'}</p>
                  </div>
                </div>
                <button onClick={() => toggleMenu(po.id)} className="p-2 -mr-2 text-gray-400 active:scale-90 transition-transform"><MoreVertical className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Revenue</p><p className="text-sm font-black text-gray-900 dark:text-white">AED {parseFloat(po.total_container_revenue).toLocaleString()}</p></div>
                <div className="space-y-1"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Stock Items</p><p className="text-sm font-black text-gray-900 dark:text-white truncate">{po.items_in_stock} units</p></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Active</div>
                </div>
                <Link href={`/dashboard/inventory/purchase-orders/items/${po.id}`} className="text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 dark:border-blue-900/30 px-3 py-1 rounded-lg">View Items</Link>
              </div>

              {menuOpenId === po.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                   <button onClick={() => { handleOpenDocuments(po); setMenuOpenId(null); }} className="flex-1 min-w-[70px] flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl"><FileText className="w-3.5 h-3.5 text-blue-600" /><span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Docs</span></button>
                   {hasPermission(PERMISSIONS.PURCHASE_ORDERS.UPDATE) && (
                     <Link href={`/dashboard/inventory/purchase-orders/edit/${po.id}`} className="flex-1 min-w-[70px] flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl"><Pencil className="w-3.5 h-3.5 text-amber-600" /><span className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">Edit</span></Link>
                   )}
                   {hasPermission(PERMISSIONS.PURCHASE_ORDERS.DELETE) && (
                     <button onClick={() => { setSelectedPO(po); setDeleteModalOpen(true); setMenuOpenId(null); }} className="flex-1 min-w-[70px] flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl"><Trash2 className="w-3.5 h-3.5 text-red-600" /><span className="text-[10px] font-black uppercase tracking-widest text-red-600">Delete</span></button>
                   )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredPOs.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredPOs.length}</span> entries
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


      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-6 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-zinc-800 shadow-lg">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Delete Order?</h2>
              <p className="text-gray-500 dark:text-zinc-500 font-medium leading-relaxed">
                Are you sure you want to delete <span className="font-black text-gray-900 dark:text-white italic">#{selectedPO?.po_id}</span>? This action cannot be undone.
              </p>
            </div>

            {deleteError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-left space-y-2">
                    <p className="text-sm font-bold text-red-900 dark:text-red-200">
                      {deleteError}
                    </p>
                    <Link
                      href={`/dashboard/inventory/purchase-orders/items/${selectedPO?.id}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View & Delete Items First
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteError(null);
                  setSelectedPO(null);
                }}
                className="flex-1 py-4 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              {!deleteError && (
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Documents Modal */}
      {documentsModalOpen && selectedPO && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-3xl w-full border border-gray-100 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black dark:text-white">Documents for {selectedPO.po_id}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage and view documents related to this purchase order.</p>
              </div>
              <button
                onClick={() => {
                  setDocumentsModalOpen(false);
                  setSelectedPO(null);
                  setDocuments([]);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {loadingDocuments ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-sm font-bold">Loading documents...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show all uploaded documents */}
                {documents.length > 0 ? (
                  documents.map((doc) => {
                    // Get friendly name for known document types
                    const docTypeNames = {
                      'customs_inv_packlist': 'Customs INV and PACKLIST',
                      'bill_of_entry': 'Bill of Entry (BOE)',
                      'bill_of_lading': 'Bill of Lading (BL)',
                      'supplier_packing_list': 'Supplier Packing List'
                    };
                    const displayName = docTypeNames[doc.document_name] || doc.document_name.replace(/_/g, ' ').toUpperCase();
                    
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                          <div 
                            className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-700 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                            onClick={() => handleViewDocument(doc.id)}
                            title="Click to view full size"
                          >
                            {doc.document_path && (doc.document_path.endsWith('.jpg') || doc.document_path.endsWith('.jpeg') || doc.document_path.endsWith('.png') || doc.document_path.endsWith('.webp')) ? (
                              <img 
                                src={`/api/purchase-orders/${selectedPO.id}/documents/${doc.id}/download`}
                                alt={displayName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full flex items-center justify-center" style={{ display: doc.document_path && (doc.document_path.endsWith('.jpg') || doc.document_path.endsWith('.jpeg') || doc.document_path.endsWith('.png') || doc.document_path.endsWith('.webp')) ? 'none' : 'flex' }}>
                              <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Uploaded {new Date(doc.created_at).toLocaleDateString()} • {doc.document_path.split('.').pop().toUpperCase()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDocument(doc.id)}
                            className="px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center gap-1"
                            title="View in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(doc.id)}
                            className="px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                          <button
                            onClick={() => {
                              setDocToDelete(doc);
                              setDeleteDocModalOpen(true);
                            }}
                            className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1"
                            title="Delete document"
                          >
                            <Trash className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No documents uploaded yet.</p>
                  </div>
                )}

                {/* Upload new document section */}
                <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                  <label className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload New Document
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Use filename without extension as document_name
                          const docName = file.name.split('.').slice(0, -1).join('.');
                          handleFileUpload(e, docName);
                        }
                      }}
                      disabled={uploadingDocument}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.webp"
                    />
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    Supported: PDF, JPG, PNG, WEBP, DOC, DOCX
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  setDocumentsModalOpen(false);
                  setSelectedPO(null);
                  setDocuments([]);
                }}
                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Confirmation Modal */}
      {deleteDocModalOpen && docToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-6 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-zinc-800 shadow-lg">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Delete Document?</h2>
              <p className="text-gray-500 dark:text-zinc-500 font-medium leading-relaxed">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setDeleteDocModalOpen(false);
                  setDocToDelete(null);
                }}
                className="flex-1 py-4 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteDocument(docToDelete.id)}
                className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </ProtectedRoute>
);
}

"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  MoreVertical, Search, Filter, Download, Plus, 
  ChevronLeft, ChevronRight, Pencil, Trash2, Check, X, 
  Eye, Package, Calendar, Building2, Ship, Hash, Truck, User as UserIcon,
  Anchor, Navigation, MapPin, Shield, FileText, Upload, Trash, ExternalLink, AlertCircle, Printer
} from "lucide-react";
import { useReactToPrint } from 'react-to-print';
import PrintableClearance from "@/app/components/PrintableClearance";
import { useContainers } from "@/app/lib/hooks/useContainers";
import { containerService } from "@/app/lib/services/containerService";
import { useToast } from "@/app/components/Toast";
import { useSuppliers } from "@/app/lib/hooks/useSuppliers";
import { useBranches } from "@/app/lib/hooks/useBranches";
import ExportButton from "@/app/components/ExportButton";
import { formatDateForExport, formatStatusForExport } from "@/app/lib/utils/exportUtils";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { usePermission } from "@/app/lib/hooks/usePermission";
import { PERMISSIONS } from "@/app/lib/constants/permissions";

export default function CustomClearancePage() {
  const { hasPermission } = usePermission();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  
  // Custom filter states matching visual specs
  const [containerCodeFilter, setContainerCodeFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Data Fetching
  const itemsPerPage = 8;
  const { containers, loading, refetch } = useContainers(0, 100);
  const { suppliers } = useSuppliers(0, 100, null, true);
  const { branches } = useBranches(0, 100, true);

  const supplierList = useMemo(() => Array.isArray(suppliers) ? suppliers : [], [suppliers]);
  const branchList = useMemo(() => Array.isArray(branches) ? branches : [], [branches]);

  const getBranchName = (containerOrBranchId) => {
    const isContainer = containerOrBranchId && typeof containerOrBranchId === "object";
    const branchId = isContainer ? containerOrBranchId.destination_branch_id : containerOrBranchId;
    const embeddedBranch = isContainer
      ? containerOrBranchId.destination_branch || containerOrBranchId.branch
      : null;

    if (embeddedBranch) {
      return embeddedBranch.branch_name || embeddedBranch.label || embeddedBranch.name || embeddedBranch.branch_code || "—";
    }

    const branch = branchList.find((b) => String(b.id) === String(branchId));
    return branch?.branch_name || branch?.label || branch?.name || branch?.branch_code || (branchId ? `Branch ${branchId}` : "—");
  };

  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [containers.length, searchQuery, statusFilter, containerCodeFilter, supplierFilter, branchFilter, dateRange]);

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

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deleteDocModalOpen, setDeleteDocModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  // Print state
  const [containerItems, setContainerItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({ 
    contentRef: printRef,
    documentTitle: selectedContainer?.invoice_number || selectedContainer?.container_code || 'custom-clearance'
  });

  // Filter and search logic
  const filteredContainers = useMemo(() => {
    if (!containers) return [];
    return containers.filter(container => {
      // 1. Search Query (General Search)
      const searchTarget = `${container.container_code || ''} ${container.container_number || ''} ${container.vessel_name || ''} ${container.shipping_agent || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      
      // 2. Container Code Filter
      const containerCode = (container.container_code || '').toLowerCase();
      const containerNumber = (container.container_number || '').toLowerCase();
      const matchesContainerCode = !containerCodeFilter || 
                                   containerCode.includes(containerCodeFilter.toLowerCase()) || 
                                   containerNumber.includes(containerCodeFilter.toLowerCase());
      
      // 3. Supplier Filter
      const matchesSupplier = supplierFilter === "All" || String(container.supplier_id) === String(supplierFilter);
      
      // 4. Branch Filter
      const matchesBranch = branchFilter === "All" || String(container.destination_branch_id) === String(branchFilter);
      
      // 5. Date Range Filter
      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        const containerDate = container.created_at ? new Date(container.created_at) : null;
        if (containerDate) {
          if (dateRange.start && new Date(dateRange.start) > containerDate) {
            matchesDate = false;
          }
          if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (containerDate > endDate) {
              matchesDate = false;
            }
          }
        } else {
          matchesDate = false;
        }
      }

      // 6. Status Filter
      const matchesStatus = statusFilter === "All" || container.invoice_status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesContainerCode && matchesSupplier && matchesBranch && matchesDate && matchesStatus;
    });
  }, [searchQuery, containerCodeFilter, supplierFilter, branchFilter, dateRange, statusFilter, containers]);

  // Pagination logic
  const totalPages = Math.ceil(filteredContainers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContainers = filteredContainers.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleViewDetails = async (container) => {
    setSelectedContainer(container);
    setViewModalOpen(true);
    setContainerItems([]);
    setItemsLoading(true);
    try {
      const itemsData = await containerService.getContainerItems(container.id);
      setContainerItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (err) {
      console.error('Failed to load container items:', err);
      setContainerItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContainer) return;
    setDeleteError(null);
    try {
      await containerService.delete(selectedContainer.id);
      showSuccess("Clearance record deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedContainer(null);
      refetch();
    } catch (err) {
      const errorMsg = err.message || "Unknown error";
      console.warn("📦 Container deletion failed:", errorMsg);
      if (errorMsg.includes("Cannot delete container with items")) {
        setDeleteError("This container has items. Please delete all items first before deleting the container.");
      } else {
        setDeleteError(errorMsg);
        showError("Failed to delete clearance: " + errorMsg);
      }
    }
  };

  // Handle documents modal
  const handleOpenDocuments = async (container) => {
    setSelectedContainer(container);
    setDocumentsModalOpen(true);
    await fetchDocuments(container.id);
  };

  const fetchDocuments = async (containerId) => {
    setLoadingDocuments(true);
    try {
      const docs = await containerService.getDocuments(containerId);
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
    if (!file || !selectedContainer) return;

    setUploadingDocument(true);
    try {
      await containerService.uploadDocument(selectedContainer.id, file, documentName);
      showSuccess("Document uploaded successfully!");
      await fetchDocuments(selectedContainer.id);
    } catch (err) {
      showError("Failed to upload document: " + err.message);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!selectedContainer) return;
    try {
      await containerService.deleteDocument(selectedContainer.id, documentId);
      showSuccess("Document deleted successfully!");
      await fetchDocuments(selectedContainer.id);
      setDeleteDocModalOpen(false);
      setDocToDelete(null);
    } catch (err) {
      showError("Failed to delete document: " + err.message);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    if (!selectedContainer) return;
    try {
      await containerService.downloadDocument(selectedContainer.id, documentId);
    } catch (err) {
      showError("Failed to download document: " + err.message);
    }
  };

  const handleViewDocument = async (documentId) => {
    if (!selectedContainer) return;
    try {
      const token = localStorage.getItem('access_token');
      const url = `/api/containers/${selectedContainer.id}/documents/${documentId}/download`;
      
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
      showError("Failed to view document: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'draft';
    const styles = {
      draft: 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400',
      published: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
      shipped: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      arrived: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      cleared: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current opacity-80 ${styles[s] || styles.draft}`}>
        {s}
      </span>
    );
  };

  // Export columns configuration
  const exportColumns = [
    { key: 'container_code', label: 'Container Code' },
    { key: 'container_number', label: 'Container Number' },
    { key: 'vessel_name', label: 'Vessel Name' },
    { key: 'voyage_number', label: 'Voyage Number' },
    { key: 'shipping_agent', label: 'Shipping Agent' },
    { key: 'port_of_loading', label: 'Port of Loading' },
    { key: 'port_of_discharging', label: 'Port of Discharging' },
    { 
      key: 'destination_branch_id', 
      label: 'Destination Branch',
      formatter: (branchId) => getBranchName(branchId)
    },
    { 
      key: 'supplier_id', 
      label: 'Supplier',
      formatter: (supplierId) => suppliers?.find(s => s.id === supplierId)?.name || `Supplier ${supplierId}`
    },
    { key: 'container_size', label: 'Container Size' },
    { key: 'total_packages', label: 'Total Packages' },
    { 
      key: 'status', 
      label: 'Status',
      formatter: (status) => status?.toUpperCase() || 'DRAFT'
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
    <ProtectedRoute permissions={[PERMISSIONS.CUSTOM_CLEARANCE.VIEW, PERMISSIONS.CONTAINERS.VIEW]}>
      <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500 px-4 sm:px-6">
        {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Custom Clearance</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">Manage vessel shipments and customs documentation</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by code, vessel, agent..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 btn-mobile-arrange">
            <ExportButton
              data={filteredContainers}
              columns={exportColumns}
              filename={`custom-clearance-${new Date().toISOString().split('T')[0]}`}
              onSuccess={(format) => showSuccess(`Custom clearance records exported successfully as ${format}!`)}
              onError={(err) => showError(`Export failed: ${err.message}`)}
            />

            {(hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.CREATE) || hasPermission(PERMISSIONS.CONTAINERS.CREATE)) && (
              <Link 
                href="/dashboard/inventory/custom-clearance/add"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all add-button"
              >
                <Plus className="w-4 h-4" />
                <span className="whitespace-nowrap font-black">Add Clearance</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the customs clearance list below.</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                      {s.label || s.name || s.supplier_code}
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
                  <option value="Draft">Draft</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Arrived">Arrived</option>
                  <option value="Cleared">Cleared</option>
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

            {/* Clear Filters Button Row */}
            <div className="flex items-center pt-2">
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setContainerCodeFilter('');
                  setSupplierFilter('All');
                  setBranchFilter('All');
                  setDateRange({ start: '', end: '' });
                  setStatusFilter('All');
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-950/20 border border-gray-200/65 dark:border-zinc-700/50 rounded-xl text-sm font-bold text-gray-600 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400 shadow-sm active:scale-95 transition-all animate-in fade-in duration-200"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full responsive-table-container">
        {/* Desktop Table View */}
        <div className="hidden xl:block overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Clearance Info</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Vessel Details</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Destination</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Agent</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr><td colSpan="6" className="py-24 text-center"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : paginatedContainers.length > 0 ? (
                paginatedContainers.map((container, index) => (
                  <tr key={container.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm"><Shield className="w-5 h-5 text-red-600" /></div>
                        <div><p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors uppercase leading-tight">{container.container_code}</p><p className="text-xs text-gray-400 mt-1 font-bold">{container.container_number}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-6"><div className="space-y-1"><div className="flex items-center gap-2"><Ship className="w-3.5 h-3.5 text-gray-400" /><span className="text-sm font-bold text-gray-700 dark:text-zinc-300">{container.vessel_name}</span></div><div className="flex items-center gap-2"><Navigation className="w-3.5 h-3.5 text-gray-400" /><span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Voy: {container.voyage_number}</span></div></div></td>
                    <td className="px-6 py-6"><div className="space-y-1"><div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-gray-400" /><span className="text-[11px] font-black uppercase">{getBranchName(container)}</span></div><div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className="text-[11px] font-bold text-gray-400">{container.port_of_discharging}</span></div></div></td>
                    <td className="px-6 py-6"><div className="flex items-center gap-2"><Anchor className="w-3.5 h-3.5 text-gray-400" /><span className="text-sm font-bold text-gray-600">{container.shipping_agent}</span></div></td>
                    <td className="px-6 py-6">{getStatusBadge(container.invoice_status)}</td>
                    <td className="px-6 py-6 text-right relative">
                        <button onClick={() => toggleMenu(container.id)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"><MoreVertical className="w-5 h-5" /></button>
                        {menuOpenId === container.id && (
                          <div className={`absolute right-0 w-52 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[200] p-1.5 ${index > paginatedContainers.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                             <Link href={`/dashboard/inventory/custom-clearance/items/${container.id}`} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-blue-50 rounded-xl"><Package className="w-4 h-4" />View Items</Link>
                             <button onClick={() => { handleOpenDocuments(container); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-blue-50 rounded-xl"><FileText className="w-4 h-4" />Documents</button>
                             <button onClick={() => { handleViewDetails(container); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl"><Eye className="w-4 h-4" />View Details</button>
                             <Link href={`/dashboard/inventory/custom-clearance/print/${container.id}`} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-amber-50 rounded-xl"><Printer className="w-4 h-4" />Print Clearance</Link>
                             {(hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.UPDATE) || hasPermission(PERMISSIONS.CONTAINERS.UPDATE)) && (
                               <Link href={`/dashboard/inventory/custom-clearance/edit/${container.id}`} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-red-50 rounded-xl"><Pencil className="w-4 h-4" />Edit Record</Link>
                             )}
                             {(hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.DELETE) || hasPermission(PERMISSIONS.CONTAINERS.DELETE)) && (
                               <>
                                 <div className="h-px bg-gray-100 my-1" />
                                 <button onClick={() => { setSelectedContainer(container); setDeleteModalOpen(true); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" />Delete</button>
                               </>
                             )}
                          </div>
                        )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="py-24 text-center text-gray-400 font-black uppercase italic animate-pulse tracking-widest">No clearance records found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="xl:hidden divide-y divide-gray-50 dark:divide-zinc-800/50">
          {paginatedContainers.map((container, index) => (
            <div key={container.id} className="p-5 active:bg-gray-50 dark:active:bg-zinc-900 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center text-red-600">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-black text-gray-900 dark:text-white leading-tight uppercase italic">{container.container_code}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{container.container_number}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   {getStatusBadge(container.invoice_status)}
                   <button onClick={() => toggleMenu(container.id)} className="p-2 -mr-2 text-gray-400 active:scale-90 transition-transform"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                 <div className="space-y-1"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Vessel / Voyage</p><p className="text-[13px] font-bold text-gray-700 dark:text-zinc-300">{container.vessel_name}</p><p className="text-[10px] font-black text-gray-400 italic">Voy: {container.voyage_number}</p></div>
                 <div className="space-y-1 text-right"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Destination</p><p className="text-[13px] font-black text-gray-900 dark:text-white uppercase leading-tight">{getBranchName(container)}</p><p className="text-[10px] font-bold text-gray-400 italic">{container.port_of_discharging}</p></div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-800/50">
                <div className="flex gap-2">
                  <button onClick={() => handleOpenDocuments(container)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600"><FileText className="w-3.5 h-3.5" />Docs</button>
                  <Link href={`/dashboard/inventory/custom-clearance/items/${container.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600"><Package className="w-3.5 h-3.5" />Items</Link>
                  <Link href={`/dashboard/inventory/custom-clearance/print/${container.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-600"><Printer className="w-3.5 h-3.5" />Print</Link>
                </div>
                <button onClick={() => { handleViewDetails(container); }} className="text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-100 dark:border-red-900/30 px-4 py-2 rounded-xl">View Details</button>
              </div>

              {menuOpenId === container.id && (hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.UPDATE) || hasPermission(PERMISSIONS.CONTAINERS.UPDATE) || hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.DELETE) || hasPermission(PERMISSIONS.CONTAINERS.DELETE)) && (
                <div className={`mt-4 pt-4 border-t border-gray-100 grid ${
                  ((hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.UPDATE) || hasPermission(PERMISSIONS.CONTAINERS.UPDATE)) && (hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.DELETE) || hasPermission(PERMISSIONS.CONTAINERS.DELETE))) 
                    ? 'grid-cols-2' : 'grid-cols-1'
                } gap-2 animate-in slide-in-from-top-2 duration-200`}>
                   {(hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.UPDATE) || hasPermission(PERMISSIONS.CONTAINERS.UPDATE)) && (
                     <Link href={`/dashboard/inventory/custom-clearance/edit/${container.id}`} className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600"><Pencil className="w-3.5 h-3.5" />Edit</Link>
                   )}
                   {(hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.DELETE) || hasPermission(PERMISSIONS.CONTAINERS.DELETE)) && (
                     <button onClick={() => { setSelectedContainer(container); setDeleteModalOpen(true); setMenuOpenId(null); }} className="flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600"><Trash2 className="w-3.5 h-3.5" />Delete</button>
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
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredContainers.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredContainers.length}</span> entries
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


      {/* View Details Modal */}
      {viewModalOpen && selectedContainer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 rounded-[15px] w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg shadow-black/10">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black dark:text-white tracking-tight uppercase italic">{selectedContainer.container_code}</h2>
                    <p className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Clearance Details</p>
                  </div>
                </div>
                <button onClick={() => setViewModalOpen(false)} className="w-10 h-10 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ViewField label="Container Number" value={selectedContainer.container_number} />
                <ViewField label="Vessel Name" value={selectedContainer.vessel_name} />
                <ViewField label="Voyage Number" value={selectedContainer.voyage_number} />
                <ViewField label="Shipping Agent" value={selectedContainer.shipping_agent} />
                <ViewField label="Port of Loading" value={selectedContainer.port_of_loading} />
                <ViewField label="Port of Discharging" value={selectedContainer.port_of_discharging} />
                <ViewField label="Destination Branch" value={getBranchName(selectedContainer)} />
                <ViewField label="Supplier" value={suppliers?.find(s => s.id === selectedContainer.supplier_id)?.company || selectedContainer.supplier_id} />
                <ViewField label="Container Size" value={selectedContainer.container_size} />
                <ViewField label="Total Packages" value={selectedContainer.total_packages} />
                <ViewField label="Status" value={selectedContainer.invoice_status?.toUpperCase()} color="red" />
              </div>

              {/* Container Items Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    Container Items
                    {!itemsLoading && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[10px] font-black rounded-full">
                        {containerItems.length}
                      </span>
                    )}
                  </h3>
                  {itemsLoading && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                      Loading...
                    </div>
                  )}
                </div>

                {!itemsLoading && containerItems.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-zinc-800">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700">
                          <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">#</th>
                          <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Item</th>
                          <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Unit Price</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                        {containerItems.map((item, idx) => {
                          const unitPrice = parseFloat(item.unit_price || 0);
                          const qty = parseInt(item.quantity || 1);
                          return (
                            <tr key={item.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                              <td className="px-4 py-3 text-xs text-gray-400 font-bold">{idx + 1}</td>
                              <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                {item.stock_item?.name || item.item?.name || item.item_name || '—'}
                              </td>
                              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.item_description || '—'}</td>
                              <td className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">{qty}</td>
                              <td className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">
                                {unitPrice > 0 ? `AED ${unitPrice.toFixed(2)}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-right font-black text-gray-900 dark:text-white">
                                {unitPrice > 0 ? `AED ${(unitPrice * qty).toFixed(2)}` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {containerItems.some(i => parseFloat(i.unit_price || 0) > 0) && (
                        <tfoot>
                          <tr className="bg-gray-900 dark:bg-white text-white dark:text-black">
                            <td colSpan={5} className="px-4 py-3 text-right text-xs font-black uppercase tracking-wider">Total Amount</td>
                            <td className="px-4 py-3 text-right font-black text-sm">
                              AED {containerItems.reduce((s, i) => s + parseFloat(i.unit_price || 0) * parseInt(i.quantity || 1), 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                ) : !itemsLoading ? (
                  <div className="text-center py-6 bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
                    <Package className="w-8 h-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No items in this container.</p>
                  </div>
                ) : null}
              </div>

              <div className="flex gap-3 pt-2">
                  <Link
                    href={`/dashboard/inventory/custom-clearance/print/${selectedContainer.id}`}
                    className="flex items-center justify-center gap-2 flex-1 py-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    Print Preview
                  </Link>
                  <Link 
                    href={`/dashboard/inventory/custom-clearance/edit/${selectedContainer.id}`}
                    className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all text-center flex items-center justify-center"
                  >
                    Edit Record
                  </Link>
                  <button 
                    onClick={() => setViewModalOpen(false)}
                    className="flex-1 py-4 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
                  >
                    Close
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Print Preview Overlay ── */}
      {printPreviewOpen && selectedContainer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="font-black tracking-tight">Print Preview — {selectedContainer.container_code}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePrint()}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-red-600/30"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => setPrintPreviewOpen(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-bold text-sm transition-all"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>

          {/* Scrollable preview area */}
          <div className="flex-1 overflow-y-auto bg-gray-200 dark:bg-zinc-800 py-8 px-4">
            <div className="shadow-2xl">
              <PrintableClearance
                ref={printRef}
                container={selectedContainer}
                items={containerItems}
                branches={branches}
                suppliers={suppliers}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-6 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-zinc-800 shadow-lg">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Delete Record?</h2>
              <p className="text-gray-500 dark:text-zinc-500 font-medium leading-relaxed">
                Are you sure you want to delete <span className="font-black text-gray-900 dark:text-white italic">{selectedContainer?.container_code}</span>? This action cannot be undone.
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
                      href={`/dashboard/inventory/custom-clearance/items/${selectedContainer?.id}`}
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
                  setSelectedContainer(null);
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
      {documentsModalOpen && selectedContainer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-3xl w-full border border-gray-100 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black dark:text-white">Documents for {selectedContainer.container_code}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage and view documents related to this container.</p>
              </div>
              <button
                onClick={() => {
                  setDocumentsModalOpen(false);
                  setSelectedContainer(null);
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
                      'supplier_packing_list': 'Supplier Packing List',
                      'commercial_invoice': 'Commercial Invoice',
                      'certificate_of_origin': 'Certificate of Origin'
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
                                src={`/api/containers/${selectedContainer.id}/documents/${doc.id}/download`}
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
                          {(hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.UPDATE) || hasPermission(PERMISSIONS.CONTAINERS.UPDATE)) && (
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
                          )}
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
                {(hasPermission(PERMISSIONS.CUSTOM_CLEARANCE.UPDATE) || hasPermission(PERMISSIONS.CONTAINERS.UPDATE)) && (
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
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  setDocumentsModalOpen(false);
                  setSelectedContainer(null);
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in zoom-in duration-200">
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

function ViewField({ label, value, color }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-bold ${color === 'red' ? 'text-red-600 dark:text-red-400 font-black italic' : 'text-gray-900 dark:text-white'}`}>
        {value || 'N/A'}
      </p>
    </div>
  );
}

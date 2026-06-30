"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  MoreVertical, Search, Filter, Download, Plus, 
  ChevronLeft, ChevronRight, Pencil, Trash2, 
  Eye, Calendar, DollarSign, FileText,
  AlertCircle, ArrowLeftRight, Truck, X, Hash, Building2, RotateCcw
} from "lucide-react";
import { useFundTransfers } from "@/app/lib/hooks/useFundTransfers";
import { fundTransferService } from "@/app/lib/services/fundTransferService";
import { useToast } from "@/app/components/Toast";
import { TableContainer, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/app/components/Table";
import ExportButton from "@/app/components/ExportButton";
import { formatDateForExport, formatCurrencyForExport } from "@/app/lib/utils/exportUtils";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { usePermission } from "@/app/lib/hooks/usePermission";
import { PERMISSIONS } from "@/app/lib/constants/permissions";

export default function FundTransfersPage() {
  const { hasPermission } = usePermission();
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { success, error } = useToast();

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== "" ||
      methodFilter !== "All" ||
      branchFilter !== "All" ||
      supplierFilter !== "All";
  }, [searchQuery, methodFilter, branchFilter, supplierFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setMethodFilter("All");
    setBranchFilter("All");
    setSupplierFilter("All");
    setCurrentPage(1);
  };
  
  // Data Fetching
  const itemsPerPage = 6;
  const { transfers, loading, refetch } = useFundTransfers();

  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [transfers.length, searchQuery, methodFilter, branchFilter, supplierFilter]);

  // Auto-expand filters if active filters exist on load
  useEffect(() => {
    const hasActive = searchQuery !== "" ||
                      methodFilter !== "All" ||
                      branchFilter !== "All" ||
                      supplierFilter !== "All";
    if (hasActive) {
      setIsFilterOpen(true);
    }
  }, []);

  // Menu state and delete modal
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Extract unique values for filters
  const uniqueMethods = useMemo(() => {
    const methods = new Set(transfers.map(t => t.method).filter(Boolean));
    return ['All', ...Array.from(methods)];
  }, [transfers]);

  const uniqueBranches = useMemo(() => {
    const branches = new Set(
      transfers
        .filter(t => t.branch)
        .map(t => JSON.stringify({ 
          code: t.branch.branch_code, 
          name: t.branch.branch_name 
        }))
    );
    return ['All', ...Array.from(branches).map(s => JSON.parse(s))];
  }, [transfers]);

  const uniqueSuppliers = useMemo(() => {
    const suppliers = new Set(
      transfers
        .filter(exp => exp.supplier)
        .map(exp => JSON.stringify({ 
          code: exp.supplier.supplier_code, 
          name: exp.supplier.name 
        }))
    );
    return ['All', ...Array.from(suppliers).map(s => JSON.parse(s))];
  }, [transfers]);

  // Filter and search logic
  const filteredTransfers = useMemo(() => {
    if (!transfers) return [];
    return transfers.filter(transfer => {
      const searchTarget = `${transfer.transfer_id || ''} ${transfer.reference || ''} ${transfer.notes || ''}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchesMethod = methodFilter === "All" || transfer.method === methodFilter;
      const matchesBranch = branchFilter === "All" || 
        (transfer.branch && (
          transfer.branch.branch_code === branchFilter ||
          transfer.branch.branch_name === branchFilter
        ));
      const matchesSupplier = supplierFilter === "All" || 
        (transfer.supplier && (
          transfer.supplier.supplier_code === supplierFilter ||
          transfer.supplier.name === supplierFilter
        ));
      return matchesSearch && matchesMethod && matchesBranch && matchesSupplier;
    });
  }, [searchQuery, methodFilter, branchFilter, supplierFilter, transfers]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransfers = filteredTransfers.slice(startIndex, startIndex + itemsPerPage);

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
    if (!selectedTransfer) return;
    setDeleteError(null);
    try {
      await fundTransferService.delete(selectedTransfer.id);
      success("Transfer deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedTransfer(null);
      refetch();
    } catch (err) {
      const errorMsg = err.message || "Unknown error";
      setDeleteError(errorMsg);
      error("Failed to delete transfer: " + errorMsg);
    }
  };

  const getMethodBadge = (method) => {
    const m = method?.toLowerCase().replace('_', ' ') || 'other';
    const styles = {
      'bank transfer': 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50',
      'cash': 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-900/50',
      'cheque': 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50',
      'hawala': 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50',
      'exchange': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50',
    };
    
    const resolvedStyle = styles[m] || 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 border border-gray-200 dark:border-zinc-700';
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${resolvedStyle}`}>
        {m}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `AED ${parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleViewTransfer = (transfer) => {
    setSelectedTransfer(transfer);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  // Export columns configuration
  const exportColumns = [
    { key: 'transfer_code', label: 'Transfer Code' },
    { 
      key: 'date', 
      label: 'Date',
      formatter: formatDateForExport
    },
    { 
      key: 'supplier.name', 
      label: 'Supplier',
      formatter: (value, row) => row.supplier ? `${row.supplier.name} (${row.supplier.supplier_code || ''})` : 'N/A'
    },
    { 
      key: 'amount', 
      label: 'Amount',
      formatter: formatCurrencyForExport
    },
    { key: 'method', label: 'Method' },
    { key: 'reference', label: 'Reference #' },
    { key: 'notes', label: 'Notes' },
    { 
      key: 'branch.branch_name', 
      label: 'Branch',
      formatter: (value, row) => row.branch ? `${row.branch.branch_name || row.branch.name} (${row.branch.branch_code || ''})` : 'N/A'
    },
    { 
      key: 'created_at', 
      label: 'Created Date',
      formatter: formatDateForExport
    }
  ];

  if (!isMounted) return null;

  return (
    <ProtectedRoute permission={PERMISSIONS.FUND_TRANSFERS.VIEW}>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Fund Transfers</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">Track and manage all company transfers</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Transfer ID, description..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 btn-mobile-arrange">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all filter-button ${
                isFilterOpen 
                  ? 'bg-red-600 text-white shadow-red-600/10' 
                  : 'bg-black dark:bg-white text-white dark:text-black shadow-black/10'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            
            <ExportButton
              data={filteredTransfers}
              columns={exportColumns}
              filename={`fund-transfers-${new Date().toISOString().split('T')[0]}`}
              onSuccess={(format) => success(`Fund transfers exported successfully as ${format}!`)}
              onError={(err) => error(`Export failed: ${err.message}`)}
            />

            {hasPermission(PERMISSIONS.FUND_TRANSFERS.CREATE) && (
              <Link 
                href="/dashboard/finance/fund-transfers/add"
                className="flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all add-button"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline whitespace-nowrap font-black">Add Transfer</span>
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
              <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the fund transfers list below.</p>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Method Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Method</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
              >
                {uniqueMethods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Branch</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
              >
                <option value="All">All Branches</option>
                {uniqueBranches.filter(b => b !== 'All').map(branch => (
                  <option key={branch.code} value={branch.code}>{branch.name} ({branch.code})</option>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Supplier</label>
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
              >
                <option value="All">All Suppliers</option>
                {uniqueSuppliers.filter(s => s !== 'All').map(supplier => (
                  <option key={supplier.code} value={supplier.code}>{supplier.name} ({supplier.code})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <TableContainer>
        <Table minWidth="1200px">
          <TableHeader>
            <TableHeaderCell>Transfer Code</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Supplier</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Method</TableHeaderCell>
            <TableHeaderCell>Reference #</TableHeaderCell>
            <TableHeaderCell>Note</TableHeaderCell>
            <TableHeaderCell>Branch</TableHeaderCell>
            <TableHeaderCell className="text-right"></TableHeaderCell>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="9" className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 font-black text-xs uppercase tracking-[0.2em] text-center w-full">Loading Fund Transfers...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedTransfers.length > 0 ? (
              paginatedTransfers.map((transfer, index) => {
                return (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                          <ArrowLeftRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                            {transfer.transfer_code || `TRF-${transfer.id}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-700 dark:text-zinc-300 whitespace-nowrap">
                          {transfer.date ? new Date(transfer.date).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          }) : '-'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                        {transfer.supplier ? (
                          <>
                            {transfer.supplier.name || 'Unnamed'}
                            {transfer.supplier.supplier_code && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                ({transfer.supplier.supplier_code})
                              </span>
                            )}
                          </>
                        ) : 'N/A'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-black dark:text-white whitespace-nowrap">
                          {formatCurrency(transfer.amount)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {getMethodBadge(transfer.method)}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                        {transfer.reference || '-'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-300 line-clamp-2 max-w-xs">
                        {transfer.notes || '-'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                        {transfer.branch ? (
                          <>
                            {transfer.branch.branch_name || transfer.branch.name || 'Unnamed'}
                            {transfer.branch.branch_code && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                ({transfer.branch.branch_code})
                              </span>
                            )}
                          </>
                        ) : 'N/A'}
                      </span>
                    </TableCell>

                    <TableCell className="text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative actions-menu-container">
                          <button 
                            onClick={() => toggleMenu(transfer.id)}
                            className={`p-2 rounded-xl transition-all ${
                              menuOpenId === transfer.id 
                                ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg menu-button-active'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {menuOpenId === transfer.id && (
                            <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                              index > paginatedTransfers.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}>
                              <button 
                                onClick={() => handleViewTransfer(transfer)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              {hasPermission(PERMISSIONS.FUND_TRANSFERS.UPDATE) && (
                                <Link 
                                  href={`/dashboard/finance/fund-transfers/edit/${transfer.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit Transfer
                                </Link>
                              )}
                              {hasPermission(PERMISSIONS.FUND_TRANSFERS.UPDATE) && hasPermission(PERMISSIONS.FUND_TRANSFERS.DELETE) && (
                                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                              )}
                              {hasPermission(PERMISSIONS.FUND_TRANSFERS.DELETE) && (
                                <button 
                                  onClick={() => {
                                    setSelectedTransfer(transfer);
                                    setDeleteModalOpen(true);
                                    setMenuOpenId(null);
                                  }} 
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Transfer
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
                  <p className="text-gray-400 font-black text-sm uppercase tracking-widest italic animate-pulse text-center w-full">No transfers found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredTransfers.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredTransfers.length}</span> entries
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-md w-full border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-6 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-zinc-800 shadow-lg">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Delete Transfer?</h2>
              <p className="text-gray-500 dark:text-zinc-500 font-medium leading-relaxed">
                Are you sure you want to delete <span className="font-black text-gray-900 dark:text-white italic">{selectedTransfer?.transfer_code || `TRF-${selectedTransfer?.id}`}</span>? This action cannot be undone.
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
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteError(null);
                  setSelectedTransfer(null);
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

      {/* View Transfer Modal */}
      {viewModalOpen && selectedTransfer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-3xl w-full border border-gray-100 dark:border-zinc-800 shadow-2xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black dark:text-white">Transfer Details</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedTransfer.transfer_code || `TRF-${selectedTransfer.id}`}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedTransfer(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Transfer Code */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Transfer Code
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                  {selectedTransfer.transfer_code || `TRF-${selectedTransfer.id}`}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Date
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {formatDate(selectedTransfer.date)}
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    Amount
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-black text-gray-900 dark:text-white">
                    {formatCurrency(selectedTransfer.amount)}
                  </div>
                </div>

                {/* Method */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Transfer Method
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {selectedTransfer.method ? selectedTransfer.method.replace('_', ' ').toUpperCase() : '-'}
                  </div>
                </div>

                {/* Reference */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5" />
                    Reference Number
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {selectedTransfer.reference || '-'}
                  </div>
                </div>

                {/* Supplier */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5" />
                    Supplier
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {selectedTransfer.supplier ? (
                      <>
                        {selectedTransfer.supplier.name || 'Unnamed'}
                        {selectedTransfer.supplier.supplier_code && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            ({selectedTransfer.supplier.supplier_code})
                          </span>
                        )}
                      </>
                    ) : 'N/A'}
                  </div>
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    Branch
                  </label>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold">
                    {selectedTransfer.branch ? (
                      <>
                        {selectedTransfer.branch.branch_name || selectedTransfer.branch.name || 'Unnamed'}
                        {selectedTransfer.branch.branch_code && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            ({selectedTransfer.branch.branch_code})
                          </span>
                        )}
                      </>
                    ) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Notes
                </label>
                <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-bold min-h-[80px] whitespace-pre-wrap">
                  {selectedTransfer.notes || '-'}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
              {hasPermission(PERMISSIONS.FUND_TRANSFERS.UPDATE) && (
                <Link
                  href={`/dashboard/finance/fund-transfers/edit/${selectedTransfer.id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:opacity-90 active:scale-95 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit Transfer</span>
                </Link>
              )}
              
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedTransfer(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, MoreVertical, Search, 
  Filter, Download, Plus, ChevronLeft, ChevronRight,
  Pencil, Trash2, X, Eye, Calendar,
  MapPin, DollarSign, TrendingUp, AlertCircle
} from "lucide-react";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { branchService } from "@/app/lib/services/branchService";
import { getAuthToken } from "@/app/lib/api";

export default function BranchManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Data Fetching
  const itemsPerPage = 8;
  const { branches: apiBranches, isLoading, isError, mutate } = useBranches(0, 100);

  // Menu state and modals
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Handle Data Selection (API only) - Fixed for hydration
  const branches = useMemo(() => {
    // During SSR, always return empty array to prevent hydration mismatch
    if (typeof window === 'undefined') return [];

    const token = getAuthToken();
    if (!token) { 
      // If no token, return empty array - user should be redirected to login
      return [];
    }
    
    // Log the data state for debugging
    console.log("BRANCH-DASHBOARD DATA DEBUG:", {
      hasApiData: !!apiBranches,
      apiCount: apiBranches?.length,
      hasToken: !!token,
      isLoading,
      isError
    });
    
    // If we have API data, use it
    if (apiBranches) {
        // Handle both array and object responses
        const data = Array.isArray(apiBranches) ? apiBranches : (apiBranches?.branches || []);
        return data;
    }

    // If no API data, return empty array
    return [];
  }, [apiBranches, isError, isLoading]);

  // Add client-side mounting state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset to first page when branches list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [branches.length]);

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleViewBranch = (branch) => {
    setSelectedBranch(branch);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteClick = (branch) => {
    setSelectedBranch(branch);
    setDeleteModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBranch) return;
    
    try {
      await branchService.delete(selectedBranch.id);
      mutate();
      setDeleteModalOpen(false);
      setSelectedBranch(null);
    } catch (error) {
      console.error("Failed to delete branch", error);
      alert("Failed to delete branch");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedBranch(null);
  };

  const handleViewClose = () => {
    setViewModalOpen(false);
    setSelectedBranch(null);
  };

  // Filter and search logic
  const filteredBranches = useMemo(() => {
    if (!branches) return [];
    return branches.filter(branch => {
      const matchesSearch = 
        (branch.branch_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (branch.branch_code?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || 
        (statusFilter === "Active" && branch.status === true) ||
        (statusFilter === "Inactive" && branch.status === false);
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, branches]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state only after component is mounted to prevent hydration mismatch
  if (!isMounted || (isLoading && (!branches || branches.length === 0))) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Branch Management</h1>
            <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your branches</p>
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="text-gray-500">Loading branches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Branch Management</h1>
          <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your branches</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, code..."
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
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {["All", "Active", "Inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        statusFilter === status 
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {status === "All" ? "All Status" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <Link href="/dashboard/administration/branches/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add Branch</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full responsive-table-container">
        <div className="overflow-x-auto lg:overflow-x-visible w-full scrollbar-hide">
          <table className="w-full lg:min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Branch</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Code</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Revenue</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Outstanding</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedBranches.length > 0 ? (
                paginatedBranches.map((branch, index) => {
                  return (
                    <tr key={branch.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30"
                    style= {{borderBottom :"0.9px solid #E2E8F0"}}
                    >
                      {/* Branch Name */}
                      <td className="px-6 py-6" data-label="Branch">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{branch.branch_name || 'N/A'}</p>
                            <p className="text-sm text-gray-400 mt-1 font-medium tracking-wide">ID: {branch.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Branch Code */}
                      <td className="px-6 py-6" data-label="Code">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                          <span className="text-sm font-black text-gray-700 dark:text-gray-300">{branch.branch_code || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="px-6 py-6" data-label="Revenue">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(branch.total_revenue)}
                          </span>
                        </div>
                      </td>

                      {/* Outstanding */}
                      <td className="px-6 py-6" data-label="Outstanding">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(branch.total_outstanding)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6" data-label="Status">
                        <div className={branch.status ? 'status-badge-active' : 'status-badge-inactive'}>
                          <div className={branch.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                          {branch.status ? "Active" : "Inactive"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6 text-right relative" data-label="Actions">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <button 
                              onClick={() => toggleMenu(branch.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all menu-button ${
                                menuOpenId === branch.id 
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg menu-button-active'
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 bg-gray-50 dark:bg-zinc-800/50 lg:bg-transparent lg:dark:bg-transparent'
                              }`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-widest lg:hidden">Actions</span>
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {menuOpenId === branch.id && (
                              <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                index > paginatedBranches.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                              }`}>
                                <button 
                                  onClick={() => handleViewBranch(branch)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <Link 
                                  href={`/dashboard/administration/branches/edit/${branch.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit Branch
                                </Link>
                                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                <button 
                                  onClick={() => handleDeleteClick(branch)} 
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Branch
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No branches found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredBranches.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredBranches.length}</span> entries
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
      </div>

      {/* View Branch Modal */}
      {viewModalOpen && selectedBranch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedBranch.branch_name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedBranch.id}</p>
                </div>
              </div>
              <button 
                onClick={handleViewClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch Name</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedBranch.branch_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch Code</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedBranch.branch_code || "Not assigned"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className={`inline-flex mt-1 ${selectedBranch.status ? 'status-badge-active' : 'status-badge-inactive'}`}>
                      <div className={selectedBranch.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                      {selectedBranch.status ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</label>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                      {formatCurrency(selectedBranch.total_revenue)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Outstanding</label>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1">
                      {formatCurrency(selectedBranch.total_outstanding)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {selectedBranch.created_at ? new Date(selectedBranch.created_at).toLocaleString() : "Not available"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {selectedBranch.updated_at ? new Date(selectedBranch.updated_at).toLocaleString() : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button 
                onClick={handleViewClose}
                className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Close
              </button>
              <Link 
                href={`/dashboard/administration/branches/edit/${selectedBranch.id}`}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all btn-primary"
                onClick={handleViewClose}
              >
                Edit Branch
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedBranch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Branch</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedBranch.branch_name}</span>? 
                This action cannot be undone.
              </p>
              
              {/* Branch Info */}
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedBranch.branch_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedBranch.branch_code || 'No code'}</p>
                    <p className="text-xs text-gray-400 dark:text-white">ID: {selectedBranch.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button 
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Branch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
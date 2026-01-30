"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, MoreVertical, Search, 
  Filter, Download, Plus, ChevronLeft, ChevronRight,
  Pencil, Trash2, Check, X, Eye, Calendar,
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

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);

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

  // Inline Editing Handlers
  const handleEdit = (branch) => {
    setEditingId(branch.id);
    setEditForm({ ...branch });
    setMenuOpenId(null);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
        // Construct a clean payload for branch update
        const payload = {
            branch_name: editForm.branch_name || undefined,
            branch_code: editForm.branch_code || undefined,
            status: editForm.status !== undefined ? editForm.status : undefined,
            total_revenue: editForm.total_revenue || undefined,
            total_outstanding: editForm.total_outstanding || undefined,
        };

        // Clean up undefined fields
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        console.log("Saving Branch Update:", { id: editingId, payload });

        await branchService.update(editingId, payload);
        
        // Success: Refresh and clean up
        mutate(); 
        setEditingId(null);
        setEditForm({});
        setMenuOpenId(null);
    } catch (error) {
        console.error("Update Error Details:", error);
        alert(`Update Failed: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
      if(confirm("Are you sure you want to delete this branch?")) {
          try {
              await branchService.delete(id);
              mutate();
          } catch (error) {
              console.error("Failed to delete branch", error);
              alert("Failed to delete branch");
          }
      }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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

  // Show loading state only after component is mounted to prevent hydration mismatch
  if (!isMounted || (isLoading && (!branches || branches.length === 0))) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Branch Management</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Manage your branches</p>
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
          <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Manage your branches</p>
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
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
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
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Branch</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Code</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Revenue</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Outstanding</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedBranches.length > 0 ? (
                paginatedBranches.map((branch, index) => {
                  const isEditing = editingId === branch.id;
                  
                  return (
                    <tr key={branch.id} className={`group transition-all ${isEditing ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'}`}
                    style= {{borderBottom :"0.9px solid #E2E8F0"}}
                    >
                      {/* Branch Name */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            {isEditing ? (
                              <input 
                                type="text"
                                name="branch_name"
                                value={editForm.branch_name || ''}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{branch.branch_name || 'N/A'}</p>
                            )}
                            <p className="text-sm text-gray-400 mt-1 font-medium tracking-wide">ID: {branch.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Branch Code */}
                      <td className="px-6 py-6">
                        {isEditing ? (
                          <input 
                            type="text"
                            name="branch_code"
                            value={editForm.branch_code || ''}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full">
                            <span className="text-sm font-black text-gray-700 dark:text-gray-300">{branch.branch_code || 'N/A'}</span>
                          </div>
                        )}
                      </td>

                      {/* Revenue */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          {isEditing ? (
                            <input 
                              type="number"
                              name="total_revenue"
                              value={editForm.total_revenue || ''}
                              onChange={handleChange}
                              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(branch.total_revenue)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Outstanding */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          {isEditing ? (
                            <input 
                              type="number"
                              name="total_outstanding"
                              value={editForm.total_outstanding || ''}
                              onChange={handleChange}
                              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                              {formatCurrency(branch.total_outstanding)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6">
                        {isEditing ? (
                           <label className="flex items-center gap-2">
                             <input
                               type="checkbox"
                               name="status"
                               checked={editForm.status || false}
                               onChange={handleChange}
                               className="checkbox-black"
                             />
                             <span className="text-sm font-medium">Active</span>
                           </label>
                        ) : (
                          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-black ${
                            branch.status
                              ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                              : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              branch.status ? 'bg-green-600' : 'bg-red-600'
                            }`}></div>
                            {branch.status ? "Active" : "Inactive"}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                           {isEditing ? (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={handleSave} 
                                  className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 active:scale-95 font-semibold text-sm" 
                                  title="Save Changes"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Save</span>
                                </button>
                                <button 
                                  onClick={handleCancel} 
                                  className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm active:scale-95 font-semibold text-sm" 
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                           ) : (
                              <div className="relative">
                                <button 
                                  onClick={() => toggleMenu(branch.id)}
                                  className={`p-2.5 rounded-xl transition-all duration-200 ${
                                    menuOpenId === branch.id 
                                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105'
                                      : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 hover:scale-105'
                                  }`}
                                  title="More Actions"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                                
                                {menuOpenId === branch.id && (
                                  <div className={`absolute right-0 w-52 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200 ${
                                    index > paginatedBranches.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                                  }`}>
                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-all duration-200 group">
                                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                        <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <span>View Details</span>
                                    </button>
                                    <button 
                                      onClick={() => handleEdit(branch)}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 rounded-xl transition-all duration-200 group"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                        <Pencil className="w-4 h-4 text-green-600 dark:text-green-400" />
                                      </div>
                                      <span>Edit Branch</span>
                                    </button>
                                    <div className="h-px bg-gray-100 dark:bg-zinc-800 my-2" />
                                    <button 
                                      onClick={() => handleDelete(branch.id)} 
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-all duration-200 group"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                      </div>
                                      <span>Delete Branch</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                           )}
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
    </div>
  );
}
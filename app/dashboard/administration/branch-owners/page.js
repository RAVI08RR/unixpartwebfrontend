"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Truck, Search, Download, Plus, ChevronLeft, ChevronRight,
  Pencil, Trash2, Eye, Building2, Percent
} from "lucide-react";
import { branchOwnerService } from "@/app/lib/services/branchOwnerService";
import { branchService } from "@/app/lib/services/branchService";
import { supplierService } from "@/app/lib/services/supplierService";
import { useToast } from "@/app/components/Toast";

export default function BranchOwnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { success, error } = useToast();
  
  const itemsPerPage = 10;
  const [branchOwners, setBranchOwners] = useState([]);
  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [ownersData, branchesData, suppliersData] = await Promise.all([
        branchOwnerService.getAll(0, 100),
        branchService.getAll(0, 100),
        supplierService.getAll(0, 100)
      ]);

      setBranchOwners(Array.isArray(ownersData) ? ownersData : []);
      setBranches(Array.isArray(branchesData) ? branchesData : (branchesData?.branches || []));
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : (suppliersData?.suppliers || []));
    } catch (err) {
      console.error('Failed to fetch data:', err);
      error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter branch owners
  const filteredOwners = useMemo(() => {
    return branchOwners.filter(owner => {
      const branch = branches.find(b => b.id === owner.branch_id);
      const supplier = suppliers.find(s => s.id === owner.supplier_id);
      
      const matchesSearch = 
        (branch?.branch_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (branch?.branch_code?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (supplier?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (supplier?.supplier_code?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [branchOwners, branches, suppliers, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOwners = filteredOwners.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleDelete = async (ownerId) => {
    if (!confirm('Are you sure you want to delete this branch owner record?')) {
      return;
    }

    try {
      await branchOwnerService.delete(ownerId);
      success('Branch owner deleted successfully');
      fetchData();
    } catch (err) {
      console.error('Failed to delete branch owner:', err);
      error('Failed to delete branch owner');
    }
  };

  const handleView = (owner) => {
    setSelectedOwner(owner);
    setViewModalOpen(true);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Branch Owners</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">Manage branch ownership and supplier shares</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by branch name or code..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/dashboard/administration/branch-owners/add"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Branch Owner</span>
            </Link>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Branch</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Supplier</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Share</th>
                <th className="px-6 py-6 text-center text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedOwners.length > 0 ? (
                paginatedOwners.map((owner) => {
                  const branch = branches.find(b => b.id === owner.branch_id);
                  const supplier = suppliers.find(s => s.id === owner.supplier_id);
                  
                  return (
                    <tr key={owner.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                              {branch?.branch_name || 'Unknown Branch'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 font-bold">
                              {branch?.branch_code || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                              {supplier?.name || 'Unknown Supplier'}
                            </p>
                            <p className="text-xs text-gray-400 font-bold">
                              {supplier?.supplier_code || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                              {owner.share_percent}%
                            </p>
                            <p className="text-xs text-gray-400 font-bold">
                              AED {parseFloat(owner.share_amount || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6 text-center relative">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(owner)}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group/view"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-400 group-hover/view:text-green-600" />
                          </button>
                          <Link
                            href={`/dashboard/administration/branch-owners/edit/${owner.id}`}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group/edit"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-gray-400 group-hover/edit:text-blue-600" />
                          </Link>
                          <button
                            onClick={() => handleDelete(owner.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group/delete"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest italic animate-pulse">
                      No branch owners found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredOwners.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredOwners.length}</span> records
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

      {/* View Modal */}
      {viewModalOpen && selectedOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Branch Owner Details</h2>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Branch Info */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {branches.find(b => b.id === selectedOwner.branch_id)?.branch_name || 'Unknown Branch'}
                    </p>
                    <p className="text-xs text-gray-400 font-bold">
                      {branches.find(b => b.id === selectedOwner.branch_id)?.branch_code || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supplier Info */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                  <Truck className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {suppliers.find(s => s.id === selectedOwner.supplier_id)?.name || 'Unknown Supplier'}
                    </p>
                    <p className="text-xs text-gray-400 font-bold">
                      {suppliers.find(s => s.id === selectedOwner.supplier_id)?.supplier_code || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ownership Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Share Percentage</label>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {selectedOwner.share_percent}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Share Amount</label>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-2xl font-black text-green-600 dark:text-green-400">
                      AED {parseFloat(selectedOwner.share_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Record Info */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-bold">Record ID</p>
                    <p className="text-gray-900 dark:text-white font-black mt-1">#{selectedOwner.id}</p>
                  </div>
                  {selectedOwner.created_at && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-bold">Created At</p>
                      <p className="text-gray-900 dark:text-white font-black mt-1">
                        {new Date(selectedOwner.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
              <Link
                href={`/dashboard/administration/branch-owners/edit/${selectedOwner.id}`}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all"
                onClick={() => setViewModalOpen(false)}
              >
                Edit
              </Link>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

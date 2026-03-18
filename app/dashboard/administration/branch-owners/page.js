"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Truck, Search, Filter, Download, Plus, ChevronLeft, ChevronRight,
  MoreVertical, Pencil, Trash2, Eye, Building2, Percent, ArrowLeft
} from "lucide-react";
import { branchOwnerService } from "@/app/lib/services/branchOwnerService";
import { branchService } from "@/app/lib/services/branchService";
import { supplierService } from "@/app/lib/services/supplierService";
import { useToast } from "@/app/components/Toast";
import BranchOwnershipModal from "@/app/components/BranchOwnershipModal";

export default function BranchOwnersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { success, error } = useToast();
  
  const itemsPerPage = 10;
  const [branchOwners, setBranchOwners] = useState([]);
  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // Modal states
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [ownershipModalOpen, setOwnershipModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [ownersData, branchesData, suppliersData] = await Promise.all([
        branchOwnerService.getAll(0, 1000),
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

  // Group owners by branch
  const groupedOwners = useMemo(() => {
    const grouped = {};
    branchOwners.forEach(owner => {
      if (!grouped[owner.branch_id]) {
        grouped[owner.branch_id] = [];
      }
      grouped[owner.branch_id].push(owner);
    });
    return grouped;
  }, [branchOwners]);

  // Filter branches
  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const hasOwners = groupedOwners[branch.id] && groupedOwners[branch.id].length > 0;
      const matchesSearch = 
        (branch.branch_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (branch.branch_code?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      return hasOwners && matchesSearch;
    });
  }, [branches, groupedOwners, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleManageOwnership = (branch) => {
    setSelectedBranch(branch);
    setOwnershipModalOpen(true);
    setMenuOpenId(null);
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? `${supplier.name} (${supplier.supplier_code || 'N/A'})` : 'Unknown Supplier';
  };

  const getTotalPercentage = (branchId) => {
    const owners = groupedOwners[branchId] || [];
    return owners.reduce((sum, owner) => sum + (parseFloat(owner.share_percent) || 0), 0);
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
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Owners</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Total Share</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
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
              ) : paginatedBranches.length > 0 ? (
                paginatedBranches.map((branch) => {
                  const owners = groupedOwners[branch.id] || [];
                  const totalPercentage = getTotalPercentage(branch.id);
                  
                  return (
                    <tr key={branch.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                              {branch.branch_name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 font-bold">
                              {branch.branch_code}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="space-y-1">
                          {owners.slice(0, 2).map((owner, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Truck className="w-3 h-3 text-gray-400" />
                              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                                {getSupplierName(owner.supplier_id)}
                              </span>
                              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                                {owner.share_percent}%
                              </span>
                            </div>
                          ))}
                          {owners.length > 2 && (
                            <p className="text-xs text-gray-400 font-bold">
                              +{owners.length - 2} more
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-black ${
                            totalPercentage === 100 
                              ? 'text-green-600 dark:text-green-400' 
                              : totalPercentage > 100
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-orange-600 dark:text-orange-400'
                          }`}>
                            {totalPercentage.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleManageOwnership(branch)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                          >
                            Manage Ownership
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
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredBranches.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredBranches.length}</span> branches
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

      {/* Branch Ownership Modal */}
      <BranchOwnershipModal
        branch={selectedBranch}
        isOpen={ownershipModalOpen}
        onClose={() => {
          setOwnershipModalOpen(false);
          setSelectedBranch(null);
        }}
        onSuccess={fetchData}
      />
    </div>
  );
}

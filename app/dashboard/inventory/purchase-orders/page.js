"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  MoreVertical, Search, Filter, Download, Plus, 
  ChevronLeft, ChevronRight, Pencil, Trash2, Check, X, 
  Eye, Package, Calendar, Building2, DollarSign, Hash,
  AlertCircle
} from "lucide-react";
import { usePurchaseOrders } from "@/app/lib/hooks/usePurchaseOrders";
import { purchaseOrderService } from "@/app/lib/services/purchaseOrderService";
import { useToast } from "@/app/components/Toast";
import { useContainers } from "@/app/lib/hooks/useContainers";

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { success, error } = useToast();
  
  // Data Fetching
  const itemsPerPage = 6;
  const { purchaseOrders, loading, refetch } = usePurchaseOrders(0, 100);
  const { containers } = useContainers();

  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [purchaseOrders.length, searchQuery, statusFilter]);

  // Menu state and delete modal
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Filter and search logic
  const filteredPOs = useMemo(() => {
    if (!purchaseOrders) return [];
    return purchaseOrders.filter(po => {
      const searchTarget = `${po.po_id} ${po.notes}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || po.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, purchaseOrders]);

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
      refetch();
    } catch (err) {
      const errorMsg = err.message || "Unknown error";
      if (errorMsg.includes("Cannot delete purchase order with items")) {
        setDeleteError("This purchase order has items. Please delete all items first.");
      } else {
        setDeleteError(errorMsg);
        error("Failed to delete purchase order: " + errorMsg);
      }
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

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Purchase Orders</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-normal">Manage inventory procurement and stock arrivals</p>
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
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all filter-button"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {['All', 'Pending', 'In_Stock', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        statusFilter === status 
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {status === "All" ? "All Orders" : status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <Link 
              href="/dashboard/inventory/purchase-orders/add"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all add-button"
            >
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full responsive-table-container">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Order ID</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Container</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Revenue</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Stock Qty</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">Loading Orders...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedPOs.length > 0 ? (
                paginatedPOs.map((po, index) => {
                  const container = containers?.find(c => c.id === po.container_id);
                  return (
                    <tr key={po.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-6" data-label="Order ID">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Hash className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">
                              {po.po_id}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 font-bold truncate max-w-[150px]">
                              {po.notes || 'No notes'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6" data-label="Container">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                            {container ? container.container_code : `ID: ${po.container_id}`}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6" data-label="Revenue">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-black dark:text-white">
                            AED {parseFloat(po.total_container_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6" data-label="Stock Qty">
                        <span className="text-sm font-bold text-gray-600 dark:text-zinc-400">
                          {po.items_in_stock} units
                        </span>
                      </td>

                      <td className="px-6 py-6" data-label="Status">
                        {getStatusBadge(po.status)}
                      </td>

                      <td className="px-6 py-6 text-right relative" data-label="Actions">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <button 
                              onClick={() => toggleMenu(po.id)}
                              className={`p-2 rounded-xl transition-all ${
                                menuOpenId === po.id 
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg menu-button-active'
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {menuOpenId === po.id && (
                              <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                index > paginatedPOs.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                              }`}>
                                <Link 
                                  href={`/dashboard/inventory/purchase-orders/items/${po.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Items
                                </Link>
                                <Link 
                                  href={`/dashboard/inventory/purchase-orders/edit/${po.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit Order
                                </Link>
                                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                <button 
                                  onClick={() => {
                                    setSelectedPO(po);
                                    setDeleteModalOpen(true);
                                    setMenuOpenId(null);
                                  }} 
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Order
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
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest italic animate-pulse">No purchase orders found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in zoom-in duration-200">
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
    </div>
  );
}

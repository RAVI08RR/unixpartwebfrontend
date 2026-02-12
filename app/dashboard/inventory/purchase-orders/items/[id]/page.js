"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Package, Hash, Building2, FileText, 
  Search, ChevronLeft, ChevronRight, Box
} from "lucide-react";
import { containerItemService } from "../../../../../lib/services/containerItemService";
import { containerService } from "../../../../../lib/services/containerService";
import { useToast } from "@/app/components/Toast";

export default function ContainerItemsPage() {
  const params = useParams();
  const containerId = params.id;
  const { error } = useToast();
  
  const [items, setItems] = useState([]);
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch container details and items in parallel
        const [containerData, itemsData] = await Promise.all([
          containerService.getById(containerId).catch(() => null),
          containerItemService.getAll(0, 100, containerId) // Backend limit is 100
        ]);
        
        setContainer(containerData);
        setItems(itemsData || []);
      } catch (err) {
        console.error("Failed to fetch container items:", err);
        error("Failed to load container items");
      } finally {
        setLoading(false);
      }
    };
    
    if (containerId) {
      fetchData();
    }
  }, [containerId]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item => {
      const matchesSearch = 
        (item.stock_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.po_description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.stock_notes?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [searchQuery, items]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      in_stock: { class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'In Stock' },
      sold: { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', label: 'Sold' },
      reserved: { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Reserved' },
      damaged: { class: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Damaged' },
    };
    
    const statusInfo = statusMap[status] || statusMap.in_stock;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading container items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/inventory/purchase-orders" 
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Container Items</h1>
            <p className="text-gray-400 dark:text-white text-sm font-normal">
              {container ? `${container.po_id} - ${container.container_code}` : 'Loading...'}
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by stock number, description..."
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Container Info Card */}
      {container && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO ID</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{container.po_id}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Container Code</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{container.container_code}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Items</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{items.length}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Quantity</label>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                {items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Stock Number</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Description</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Branch</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Quantity</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30"
                  style={{borderBottom:"0.9px solid #E2E8F0"}}>
                    {/* Stock Number */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          {item.stock_number}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.po_description}
                        </p>
                        {item.is_dismantled && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                            <Box className="w-3 h-3" />
                            Dismantled
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Branch {item.current_branch_id}
                        </span>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-6">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-6">
                      <div className="flex items-start gap-2 max-w-xs">
                        {item.stock_notes && (
                          <>
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {item.stock_notes}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No items found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredItems.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredItems.length}</span> items
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

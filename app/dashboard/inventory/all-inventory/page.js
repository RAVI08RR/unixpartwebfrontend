"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, Search, Filter, Download, 
  Eye, FileText, Calendar, User, 
  ChevronLeft, ChevronRight, X, 
  Building2, ShoppingCart, RefreshCcw, MoreVertical,
  Package, Hash, DollarSign, Truck, MapPin, Layers, Box, Check
} from "lucide-react";
import { poItemService } from "@/app/lib/services/poItemService";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { useToast } from "@/app/components/Toast";
import Link from "next/link";

export default function AllInventoryPage() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filters state
  const [filters, setFilters] = useState({
    status: "All",
    branch: "All",
    stockNumber: "",
    itemName: "",
    supplierCode: ""
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { branches: apiBranches } = useBranches(0, 100, true);
  const { stockItems: apiStockItems } = useStockItems(0, 100, null, true);
  const { success, error: showError } = useToast();

  const branches = useMemo(() => Array.isArray(apiBranches) ? apiBranches : [], [apiBranches]);
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

  // Filter logic
  const filteredData = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesStatus = filters.status === "All" || item.status === filters.status;
      const matchesBranch = filters.branch === "All" || item.current_branch?.branch_code === filters.branch;
      const matchesStock = !filters.stockNumber || (item.stock_number || "").toLowerCase().includes(filters.stockNumber.toLowerCase());
      const matchesItemName = !filters.itemName || (item.stock_item?.name || "").toLowerCase().includes(filters.itemName.toLowerCase());
      
      return matchesStatus && matchesBranch && matchesStock && matchesItemName;
    });
  }, [inventoryItems, filters]);

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

  const clearFilters = () => {
    setFilters({
      status: "All",
      branch: "All",
      stockNumber: "",
      itemName: "",
      supplierCode: ""
    });
    setCurrentPage(1);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setViewModalOpen(true);
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
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">All Inventory Items</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Browse and manage all items across all branches.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-4xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by stock number, item name..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
              value={filters.stockNumber}
              onChange={(e) => setFilters({...filters, stockNumber: e.target.value})}
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Card - Collapsible */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-[20px] border border-gray-100 dark:border-zinc-800 shadow-sm p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight text-[12px] opacity-40">Advanced Filters</h3>
            <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Item Name</label>
              <input 
                type="text" 
                placeholder="Search item..."
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
                value={filters.itemName}
                onChange={(e) => setFilters({...filters, itemName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Branch</label>
              <select 
                value={filters.branch}
                onChange={(e) => setFilters({...filters, branch: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
              >
                <option value="All">All Branches</option>
                <option value="DXB">Dubai Main (DXB)</option>
                <option value="AUH">Abu Dhabi (AUH)</option>
                <option value="SHJ">Sharjah (SHJ)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all"
              >
                <option value="All">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="sold">Sold</option>
                <option value="dismantled">Dismantled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Clear Filters
            </button>
            
            <div className="flex items-center gap-6 bg-gray-50 dark:bg-zinc-800/50 px-6 py-3 rounded-xl border border-gray-100 dark:border-zinc-800">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Items</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{filteredData.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-800/20">
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Stock Number</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Supplier Code</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Container Code</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Item</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">PO Description</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Branch</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Sale Amount</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Invoice #</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Sale Date</th>
                <th className="px-6 py-5 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">View Invoice</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                   <td colSpan="12" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <RefreshCcw className="w-8 h-8 text-gray-300 animate-spin" />
                         <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Inventory Data...</p>
                      </div>
                   </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const saleItem = item.invoice_items?.[0] || null;
                  const supplierCode = item.purchase_order?.container?.supplier?.supplier_code || item.stock_number?.split('-')[1] || "-";
                  const containerCode = item.purchase_order?.container?.container_number || "-";
                  
                  return (
                    <tr key={idx} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-5">
                         <span className="text-xs font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">{item.stock_number || "-"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-black text-gray-500 dark:text-gray-400 tracking-wider">
                          {supplierCode}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                           {containerCode}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-gray-900 dark:text-white leading-tight">{item.stock_item?.name || "-"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-gray-600 dark:text-gray-400 italic max-w-[200px] block truncate">{item.po_description || "-"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.current_branch?.branch_code || "-"}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          item.status === 'in_stock' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : item.status === 'sold'
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {item.status?.replace('_', ' ') || "unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          {saleItem ? formatCurrency(saleItem.sale_amount) : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {saleItem?.invoice?.invoice_number || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {saleItem ? formatDate(saleItem.sale_date) : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                         {saleItem ? (
                           <Link 
                            href={`/dashboard/sales/invoices/view/${saleItem.invoice_id}`}
                            className="p-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-400 hover:text-black dark:hover:text-white rounded-xl transition-all inline-flex items-center justify-center border border-gray-100 dark:border-zinc-700"
                           >
                              <FileText className="w-4 h-4" />
                           </Link>
                         ) : "-"}
                      </td>
                      <td className="px-6 py-5 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <button 
                              onClick={() => toggleMenu(item.id)}
                              className={`p-2 rounded-xl transition-all ${
                                menuOpenId === item.id
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {menuOpenId === item.id && (
                              <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                idx % itemsPerPage > 7 ? 'bottom-full mb-2' : 'top-full mt-2'
                              }`}>
                                <button 
                                  onClick={() => handleViewDetails(item)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button 
                                  onClick={() => handleEditItem(item)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                  Edit Item
                                </button>
                                {item.status === 'in_stock' && (
                                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                    <Layers className="w-4 h-4" />
                                    Dismantle Item
                                  </button>
                                )}
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
                  <td colSpan="12" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Package className="w-12 h-12 text-gray-200" />
                      <div>
                        <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">No Items Found</p>
                        <p className="text-sm text-gray-400 font-medium">Try adjusting your filters to find what you're looking for.</p>
                      </div>
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

      {/* View Details Modal */}
      {viewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 rounded-[32px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-10 flex items-center justify-between p-8 border-b border-gray-50 dark:border-zinc-900">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Inventory Item Details</h2>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Stock #: <span className="text-red-600">{selectedItem.stock_number}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-2xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Main Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Quantity</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {selectedItem.quantity}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Status</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {selectedItem.status?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Branch</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {selectedItem.current_branch?.branch_name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column: Product & Sale */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      Product Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                        <span className="text-sm font-bold text-gray-400">Item Name</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{selectedItem.stock_item?.name || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                        <span className="text-sm font-bold text-gray-400">Stock Number</span>
                        <span className="text-xs font-black text-red-600 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-xl">
                          {selectedItem.stock_number || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 py-3">
                        <span className="text-sm font-bold text-gray-400">PO Description</span>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl">
                          {selectedItem.po_description || "No description provided."}
                        </p>
                      </div>
                    </div>
                  </section>

                  {selectedItem.invoice_items?.length > 0 && (
                     <section>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                           <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-green-600" />
                           </div>
                           Sale Information
                        </h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                              <span className="text-sm font-bold text-gray-400">Invoice Number</span>
                              <span className="text-sm font-black text-blue-600">{selectedItem.invoice_items[0].invoice?.invoice_number}</span>
                           </div>
                           <div className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-zinc-900">
                              <span className="text-sm font-bold text-gray-400">Sale Amount</span>
                              <span className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(selectedItem.invoice_items[0].sale_amount)}</span>
                           </div>
                           <div className="flex justify-between items-center py-3">
                              <span className="text-sm font-bold text-gray-400">Sale Date</span>
                              <span className="text-sm font-black text-gray-900 dark:text-white">{formatDate(selectedItem.invoice_items[0].sale_date)}</span>
                           </div>
                        </div>
                     </section>
                  )}
                </div>

                {/* Right Column: Branch & PO */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-purple-600" />
                      </div>
                      Branch Information
                    </h3>
                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-[24px] p-6 border border-gray-100 dark:border-zinc-800">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center font-black text-gray-400 border border-gray-100 dark:border-zinc-700 shadow-sm">
                          {selectedItem.current_branch?.branch_code}
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                            {selectedItem.current_branch?.branch_name}
                          </p>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Branch ID: {selectedItem.current_branch_id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                        <Hash className="w-4 h-4 text-gray-600" />
                      </div>
                      Traceability
                    </h3>
                    <div className="space-y-4 bg-gray-50 dark:bg-zinc-900 p-6 rounded-[24px] border border-gray-100 dark:border-zinc-800">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">PO ID</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">#{selectedItem.po_id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Created At</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          {formatDate(selectedItem.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Updated</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          {formatDate(selectedItem.updated_at)}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-50 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-zinc-900 rounded-full border border-gray-100 dark:border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Inventory Record</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setViewModalOpen(false)}
                  className="flex-1 sm:flex-none px-8 py-3.5 text-sm font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

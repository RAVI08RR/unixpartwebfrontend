"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Package, Hash, Building2, FileText, 
  Search, ChevronLeft, ChevronRight, Box, Plus, X, MoreVertical, Pencil, Trash2, Eye, Filter, DollarSign, Calendar
} from "lucide-react";
import { containerItemService } from "../../../../../lib/services/containerItemService";
import { containerService } from "../../../../../lib/services/containerService";
import { useBranches } from "../../../../../lib/hooks/useBranches";
import { useStockItems } from "../../../../../lib/hooks/useStockItems";
import { useToast } from "@/app/components/Toast";
import ConfirmModal from "@/app/components/ConfirmModal";

export default function ContainerItemsPage() {
  const params = useParams();
  const containerId = params.id;
  const { success, error } = useToast();
  
  const [items, setItems] = useState([]);
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 10;
  
  // Fetch branches for dropdown
  const { branches: apiBranches } = useBranches();
  const branches = useMemo(() => Array.isArray(apiBranches) ? apiBranches : [], [apiBranches]);
  
  // Fetch stock items for dropdown
  const { stockItems: apiStockItems, isLoading: stockItemsLoading, isError: stockItemsError } = useStockItems(0, 100);
  const stockItems = useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);
  
  // Form state
  const [formData, setFormData] = useState({
    stock_number: "",
    container_id: containerId,
    item_id: "",
    parent_item_id: 0,
    po_description: "",
    stock_notes: "",
    current_branch_id: "",
    status: "in_stock",
    is_dismantled: false,
    quantity: 1
  });

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpenId !== null && !event.target.closest('.action-menu-container')) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const containerData = await containerService.getById(containerId).catch(() => null);
      setContainer(containerData);
      
      const itemsData = await containerItemService.getAll(0, 100, containerId);
      setItems(itemsData || []);
    } catch (err) {
      console.error("Failed to fetch container items:", err);
      error("Failed to load container items: " + (err.message || "Server connection issue"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (containerId) fetchData();
  }, [containerId]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    return items.filter(item => {
      const matchesSearch = 
        (item.stock_number?.toString().toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.po_description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (item.stock_notes?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesBranch = branchFilter === "all" || 
                           item.current_branch_id?.toString() === branchFilter.toString();
      
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [searchQuery, items, statusFilter, branchFilter]);

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
  
  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setFormData({
      stock_number: "",
      container_id: parseInt(containerId),
      item_id: "",
      parent_item_id: 0,
      po_description: "",
      stock_notes: "",
      current_branch_id: container?.arrival_branch_id || container?.current_branch_id || "",
      status: "in_stock",
      is_dismantled: false,
      quantity: 1
    });
    setAddModalOpen(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      stock_number: item.stock_number || "",
      container_id: parseInt(containerId),
      item_id: item.item_id || "",
      parent_item_id: item.parent_item_id || 0,
      po_description: item.po_description || "",
      stock_notes: item.stock_notes || "",
      current_branch_id: item.current_branch_id || "",
      status: item.status || "in_stock",
      is_dismantled: item.is_dismantled || false,
      quantity: item.quantity || 1
    });
    setEditModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDismantle = async (item) => {
    if (item.is_dismantled) {
      error("Item is already dismantled");
      return;
    }
    
    try {
      await containerItemService.dismantle({ container_item_id: item.id });
      success("Item dismantled successfully");
      fetchData();
    } catch (err) {
      error(err.message || "Failed to dismantle item");
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
    setMenuOpenId(null);
  };
  
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (selectedItem) {
        const updateData = {
          stock_number: formData.stock_number,
          container_id: parseInt(containerId),
          item_id: parseInt(formData.item_id),
          po_description: formData.po_description,
          stock_notes: formData.stock_notes,
          current_branch_id: parseInt(formData.current_branch_id),
          status: formData.status,
          is_dismantled: formData.is_dismantled,
          quantity: parseInt(formData.quantity) || 1,
        };
        await containerItemService.update(selectedItem.id, updateData);
        success("Container item updated successfully");
        setEditModalOpen(false);
      } else {
        const createData = {
          stock_number: formData.stock_number,
          container_id: parseInt(containerId),
          item_id: parseInt(formData.item_id),
          parent_item_id: parseInt(formData.parent_item_id) || 0,
          po_description: formData.po_description,
          stock_notes: formData.stock_notes,
          current_branch_id: parseInt(formData.current_branch_id),
          status: formData.status,
          is_dismantled: formData.is_dismantled,
          quantity: parseInt(formData.quantity) || 1,
        };
        await containerItemService.create(createData);
        success("Container item added successfully");
        setAddModalOpen(false);
      }
      fetchData();
    } catch (err) {
      error(err.message || "Failed to save container item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    try {
      await containerItemService.delete(selectedItem.id);
      success("Container item deleted successfully");
      setDeleteModalOpen(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      error("Failed to delete container item");
    }
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
      <div className="flex items-center justify-center py-24">
        <div className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Loading container items...</div>
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
            <h1 className="text-2xl font-black dark:text-white tracking-tight"> Purchase Orders Container Items</h1>
            <p className="text-black dark:text-white text-sm font-normal">
              {container ? `${container.po_id} - ${container.container_code}` : 'Loading...'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Filters */}
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 hover:shadow-black/20 active:scale-95 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            
            {isFilterOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                    <div className="space-y-1">
                      {["all", "in_stock", "sold", "reserved", "damaged"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                            statusFilter === status 
                              ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {status === "all" ? "All Status" : status.replace('_', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Branch</label>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      <button
                        onClick={() => {
                          setBranchFilter("all");
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                          branchFilter === "all" 
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        ALL BRANCHES
                      </button>
                      {branches.map(b => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setBranchFilter(b.id);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                            branchFilter.toString() === b.id.toString()
                              ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {b.branch_name.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-95 btn-add-po"
            style={{ cursor: "pointer", width: "19rem", textAlign: "center", display: "flex", justifyContent: "center" }}
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10">Stock Number</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10">Item</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10">PO Description</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10">Stock Notes</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10">Supplier</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10">Qty</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10">Branch</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10">Status</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10">Dismantled</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-widest bg-gray-50/10 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item, idx) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all border-b border-gray-100 dark:border-zinc-800 last:border-0">
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-black text-gray-900 dark:text-white">{item.stock_number}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-bold text-gray-600 dark:text-gray-400">{stockItems.find(si => si.id.toString() === item.item_id?.toString())?.name || "Item " + item.item_id}</span></td>
                    <td className="px-6 py-4 max-w-xs truncate"><span className="text-sm text-gray-500">{item.po_description}</span></td>
                    <td className="px-6 py-4 max-w-xs truncate"><span className="text-sm text-gray-500">{item.stock_notes || '-'}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500">{container?.supplier_name || '-'}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-black text-gray-900 dark:text-white">{item.quantity}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500">{branches.find(b => b.id.toString() === item.current_branch_id?.toString())?.branch_name || "B-" + item.current_branch_id}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${item.is_dismantled ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>{item.is_dismantled ? "Yes" : "No"}</span></td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="relative flex justify-end action-menu-container">
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
                          <div className={`absolute right-0 w-56 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                            idx > paginatedItems.length - 3 ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'
                          }`}>
                            <button 
                              onClick={() => handleViewItem(item)}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                              <Eye className="w-4 h-4" /> 
                              View Details
                            </button>
                            
                            <button 
                              onClick={() => handleEditItem(item)}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                              <Pencil className="w-4 h-4" /> 
                              Edit Item
                            </button>

                            {!item.is_dismantled && (
                              <button 
                                onClick={() => {
                                  handleDismantle(item);
                                  setMenuOpenId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                              >
                                <Box className="w-4 h-4" /> 
                                Dismantle Item
                              </button>
                            )}
                            
                            <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                            
                            <button 
                              onClick={() => handleDeleteClick(item)}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> 
                              Delete Item
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="py-24 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">No items found for this container</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredItems.length)}</span> of <span className="text-gray-900 dark:text-white">{filteredItems.length}</span>
          </p>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="uppercase tracking-widest text-[10px]">Prev</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
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
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <span className="uppercase tracking-widest text-[10px]">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Keep existing modals logic but clean them up for the new fields if needed */}
      {/* (Skipping detailed modal JSX for brevity but it's there in the full file) */}
      
      {/* Confirm Delete Modal */}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        message={`Are you sure you want to delete ${selectedItem?.stock_number}? This action cannot be undone.`}
      />

      {/* Modals for Add/Edit as previously defined... */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Add Item</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">To {container?.container_code}</p>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Number</label>
                   <input type="text" name="stock_number" value={formData.stock_number} onChange={handleFormChange} required className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Item</label>
                   <select name="item_id" value={formData.item_id} onChange={handleFormChange} required className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20">
                     <option value="">Select Item</option>
                     {stockItems.map(si => <option key={si.id} value={si.id}>{si.name || si.item_name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
                   <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} required min="1" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Branch</label>
                   <select name="current_branch_id" value={formData.current_branch_id} onChange={handleFormChange} required className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20">
                     <option value="">Select Branch</option>
                     {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                   </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PO Description</label>
                <textarea name="po_description" value={formData.po_description} onChange={handleFormChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20" rows="3" />
              </div>
              <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex gap-4">
                <button type="button" onClick={() => setAddModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-zinc-800 text-gray-600 font-black uppercase text-xs tracking-widest rounded-2xl">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">{submitting ? 'Adding...' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Edit Item</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{selectedItem?.stock_number}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Number</label>
                   <input type="text" name="stock_number" value={formData.stock_number} onChange={handleFormChange} required className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Item</label>
                   <select name="item_id" value={formData.item_id} onChange={handleFormChange} required className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20">
                     <option value="">Select Item</option>
                     {stockItems.map(si => <option key={si.id} value={si.id}>{si.name || si.item_name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
                   <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} required min="1" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Branch</label>
                   <select name="current_branch_id" value={formData.current_branch_id} onChange={handleFormChange} required className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20">
                     <option value="">Select Branch</option>
                     {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                   <select name="status" value={formData.status} onChange={handleFormChange} required className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20">
                     <option value="in_stock">In Stock</option>
                     <option value="sold">Sold</option>
                     <option value="reserved">Reserved</option>
                     <option value="damaged">Damaged</option>
                   </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="is_dismantled" checked={formData.is_dismantled} onChange={handleFormChange} className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dismantled</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PO Description</label>
                <textarea name="po_description" value={formData.po_description} onChange={handleFormChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20" rows="3" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Notes</label>
                <textarea name="stock_notes" value={formData.stock_notes} onChange={handleFormChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20" rows="2" />
              </div>
              <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex gap-4">
                <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-zinc-800 text-gray-600 font-black uppercase text-xs tracking-widest rounded-2xl">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">{submitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Details Modal */}
      {viewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 dark:border-zinc-800">
            <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <Box className="w-7 h-7 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedItem.stock_number}</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Item Details Overview</p>
                </div>
              </div>
              <button 
                onClick={() => setViewModalOpen(false)} 
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all shadow-sm border border-gray-100 dark:border-zinc-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {/* Main Info Section */}
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Item</p>
                    <p className="text-base font-black text-gray-900 dark:text-white">{stockItems.find(si => si.id.toString() === selectedItem.item_id?.toString())?.name || "Item " + selectedItem.item_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</p>
                    <p className="text-base font-black text-gray-900 dark:text-white">{selectedItem.quantity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Branch</p>
                    <p className="text-base font-black text-gray-900 dark:text-white">{branches.find(b => b.id.toString() === selectedItem.current_branch_id?.toString())?.branch_name || "B-" + selectedItem.current_branch_id}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Dismantled</p>
                    <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full ${selectedItem.is_dismantled ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                      {selectedItem.is_dismantled ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Supplier</p>
                    <p className="text-base font-black text-gray-900 dark:text-white">{container?.supplier_name || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-zinc-800" />

              {/* Financial Section (Moved from table) */}
              <div className="grid grid-cols-3 gap-8">
                <div className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-3xl border border-green-100/50 dark:border-green-900/20">
                  <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Sale Amount
                  </p>
                  <p className="text-xl font-black text-green-700 dark:text-green-300">
                    {selectedItem.sale_amount ? `AED ${selectedItem.sale_amount}` : 'N/A'}
                  </p>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100/50 dark:border-blue-900/20">
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Invoice #
                  </p>
                  <p className="text-xl font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    {selectedItem.invoice_number || 'N/A'}
                  </p>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100/50 dark:border-purple-900/20">
                  <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Sale Date
                  </p>
                  <p className="text-xl font-black text-purple-700 dark:text-purple-300">
                    {selectedItem.sale_date ? new Date(selectedItem.sale_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-zinc-800" />

              {/* Notes Section */}
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">PO Description</p>
                  <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic">"{selectedItem.po_description || 'No description provided'}"</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Stock Notes</p>
                  <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic">"{selectedItem.stock_notes || 'No notes available'}"</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <button 
                onClick={() => {
                  handleEditItem(selectedItem);
                  setViewModalOpen(false);
                }} 
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-sm tracking-widest rounded-[24px] shadow-2xl hover:shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Pencil className="w-5 h-5" /> Edit This Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Package, Hash, Building2, FileText, 
  Search, ChevronLeft, ChevronRight, Box, Plus, X, MoreVertical, Pencil, Trash2, Eye
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
  const itemsPerPage = 10;
  
  // Fetch branches for dropdown
  const { branches } = useBranches();
  
  // Fetch stock items for dropdown
  const { stockItems: apiStockItems, isLoading: stockItemsLoading, isError: stockItemsError } = useStockItems(0, 100);
  const stockItems = useMemo(() => {
    if (!apiStockItems) {
      console.log('📦 No stock items data yet');
      return [];
    }
    const items = Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
    console.log('📦 Stock items loaded for dropdown:', {
      count: items.length,
      firstItem: items[0],
      allItems: items
    });
    return items;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch container details
        const containerData = await containerService.getById(containerId).catch(() => null);
        setContainer(containerData);
        
        // Fetch items with only container_id (no branch_id, supplier_id, or status filters)
        console.log('🔍 Fetching container items with params:', {
          container_id: containerId,
          limit: 100
        });
        
        const itemsData = await containerItemService.getAll(
          0, 
          100, 
          containerId
        );
        
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
      current_branch_id: container?.branch_id || "",
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
        // Update existing item - match backend PUT schema (no parent_item_id)
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
        
        console.log('📦 Updating container item:', updateData);
        
        await containerItemService.update(selectedItem.id, updateData);
        success("Container item updated successfully");
        setEditModalOpen(false);
      } else {
        // Create new item - includes parent_item_id
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
        
        console.log('📦 Creating container item:', createData);
        
        await containerItemService.create(createData);
        success("Container item added successfully");
        setAddModalOpen(false);
      }
      
      // Refresh items list (only with container_id)
      const itemsData = await containerItemService.getAll(0, 100, containerId);
      setItems(itemsData || []);
      
    } catch (err) {
      console.error("Failed to save container item:", err);
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
      
      // Refresh items list
      const itemsData = await containerItemService.getAll(0, 100, containerId);
      setItems(itemsData || []);
    } catch (err) {
      console.error("Failed to delete container item:", err);
      error("Failed to delete container item");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleViewClose = () => {
    setViewModalOpen(false);
    setSelectedItem(null);
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
        
        <div className="flex items-center gap-4">
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
          
          {/* Add Item Button */}
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
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
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item, index) => (
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

                    {/* Actions */}
                    <td className="px-6 py-6 text-right relative">
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
                            <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                              index > paginatedItems.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
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
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit Item
                              </button>
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
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
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
      
      {/* Add Item Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Add Container Item</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Add a new item to {container?.container_code}
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock Number */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Stock Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="stock_number"
                    value={formData.stock_number}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    placeholder="Enter stock number"
                  />
                </div>

                {/* Stock Item (Required) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Stock Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="item_id"
                    value={formData.item_id}
                    onChange={handleFormChange}
                    required
                    disabled={stockItemsLoading}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 disabled:opacity-50"
                  >
                    <option value="">
                      {stockItemsLoading ? 'Loading stock items...' : 'Select Stock Item'}
                    </option>
                    {!stockItemsLoading && stockItems.length > 0 && stockItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name || item.item_name || 'Unnamed Item'}
                        {item.part_number && ` - ${item.part_number}`}
                        {item.description && ` (${item.description})`}
                      </option>
                    ))}
                  </select>
                  {!stockItemsLoading && stockItems.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No stock items available. Please add stock items first.
                    </p>
                  )}
                  {stockItemsError && (
                    <p className="text-xs text-red-500 mt-1">
                      Failed to load stock items. Please try again.
                    </p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="current_branch_id"
                    value={formData.current_branch_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="po_description"
                  value={formData.po_description}
                  onChange={handleFormChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 resize-none"
                  placeholder="Enter item description"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="stock_notes"
                  value={formData.stock_notes}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 resize-none"
                  placeholder="Additional notes (optional)"
                />
              </div>

              {/* Is Dismantled Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_dismantled"
                  id="is_dismantled"
                  checked={formData.is_dismantled}
                  onChange={handleFormChange}
                  className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                />
                <label htmlFor="is_dismantled" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Item is dismantled
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Edit Container Item</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Update item {selectedItem.stock_number}
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body - Same form as Add */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock Number */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Stock Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="stock_number"
                    value={formData.stock_number}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50"
                    placeholder="Enter stock number"
                  />
                </div>

                {/* Stock Item */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Stock Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="item_id"
                    value={formData.item_id}
                    onChange={handleFormChange}
                    required
                    disabled={stockItemsLoading}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 disabled:opacity-50"
                  >
                    <option value="">
                      {stockItemsLoading ? 'Loading stock items...' : 'Select Stock Item'}
                    </option>
                    {!stockItemsLoading && stockItems.length > 0 && stockItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name || item.item_name || 'Unnamed Item'}
                        {item.part_number && ` - ${item.part_number}`}
                        {item.description && ` (${item.description})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="current_branch_id"
                    value={formData.current_branch_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="po_description"
                  value={formData.po_description}
                  onChange={handleFormChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 resize-none"
                  placeholder="Enter item description"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="stock_notes"
                  value={formData.stock_notes}
                  onChange={handleFormChange}
                  rows="2"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 resize-none"
                  placeholder="Additional notes (optional)"
                />
              </div>

              {/* Is Dismantled Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_dismantled"
                  id="is_dismantled_edit"
                  checked={formData.is_dismantled}
                  onChange={handleFormChange}
                  className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                />
                <label htmlFor="is_dismantled_edit" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Item is dismantled
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Updating..." : "Update Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {viewModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Item Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedItem.stock_number}
                </p>
              </div>
              <button
                onClick={handleViewClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Number</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{selectedItem.stock_number}</p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
                  <div className="mt-2">{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch ID</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{selectedItem.current_branch_id}</p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{selectedItem.quantity}</p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-2">{selectedItem.po_description}</p>
                </div>
                {selectedItem.stock_notes && (
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-2">{selectedItem.stock_notes}</p>
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dismantled</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{selectedItem.is_dismantled ? 'Yes' : 'No'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-2">
                    {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-4 p-8 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={handleViewClose}
                className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleViewClose();
                  handleEditItem(selectedItem);
                }}
                className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Container Item</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedItem.stock_number}</span>? 
                This action cannot be undone.
              </p>
              
              {/* Item Info */}
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="text-left space-y-2">
                  <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Stock:</span> {selectedItem.stock_number}</p>
                  <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Description:</span> {selectedItem.po_description}</p>
                  <p className="text-sm"><span className="font-semibold text-gray-700 dark:text-gray-300">Quantity:</span> {selectedItem.quantity}</p>
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
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Plus, Search, Filter, MoreVertical, 
  Pencil, Trash2, Package, Box, Building2, Hash, DollarSign, Calendar
} from "lucide-react";
import { containerItemService } from "@/app/lib/services/containerItemService";
import { containerService } from "@/app/lib/services/containerService";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { useToast } from "@/app/components/Toast";
import ConfirmModal from "@/app/components/ConfirmModal";

export default function ContainerItemsPage() {
  const router = useRouter();
  const params = useParams();
  const containerId = params?.id;
  
  const [items, setItems] = useState([]);
  const [container, setContainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  const { success, error: showError } = useToast();
  const { stockItems: apiStockItems } = useStockItems(0, 100);

  const stockItems = useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);

  // Fetch container and items
  useEffect(() => {
    const fetchData = async () => {
      if (!containerId) return;
      
      try {
        setLoading(true);
        const [containerData, itemsData] = await Promise.all([
          containerService.getById(containerId),
          containerItemService.getAll(0, 100, containerId)
        ]);
        
        setContainer(containerData);
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (err) {
        showError("Failed to load data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [containerId]);

  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    return items.filter(item => {
      const stockItem = stockItems.find(si => si.id === item.item_id);
      const searchTarget = `${stockItem?.name || ''} ${item.item_description || ''}`.toLowerCase();
      return searchTarget.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, items, stockItems]);

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await containerItemService.delete(selectedItem.id);
      success("Item removed successfully");
      setDeleteModalOpen(false);
      // Refresh items
      const itemsData = await containerItemService.getAll(0, 100, containerId);
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (err) {
      showError("Failed to delete item: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/inventory/custom-clearance')}
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Container Items</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">
            {container?.container_code} - {container?.container_number}
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={items.length} icon={<Package className="w-5 h-5 text-red-600" />} />
        <StatCard label="Total Quantity" value={items.reduce((sum, item) => sum + (item.quantity || 0), 0)} icon={<Box className="w-5 h-5 text-emerald-600" />} />
        <StatCard label="Total Value" value={`AED ${items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0).toLocaleString()}`} icon={<DollarSign className="w-5 h-5 text-blue-600" />} />
        <StatCard label="Container" value={container?.container_code || 'N/A'} icon={<Package className="w-5 h-5 text-amber-600" />} />
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search items..."
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Items Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Subtotal</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const stockItem = stockItems.find(si => si.id === item.item_id);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4" data-label="Item">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <Package className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {stockItem?.name || `Item #${item.item_id}`}
                            </p>
                            <p className="text-xs text-gray-400">ID: {item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4" data-label="Description">
                        <span className="text-sm text-gray-700 dark:text-zinc-300">
                          {item.item_description || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4" data-label="Quantity">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4" data-label="Unit Price">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          AED {parseFloat(item.unit_price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4" data-label="Subtotal">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          AED {parseFloat(item.subtotal || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative" data-label="Actions">
                        <div className="relative">
                          <button 
                            onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                            className={`p-2 rounded-lg transition-all ${
                              menuOpenId === item.id 
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-black' 
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {menuOpenId === item.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-xl z-50 p-1.5">
                              <button 
                                onClick={() => {
                                  setSelectedItem(item);
                                  setDeleteModalOpen(true);
                                  setMenuOpenId(null);
                                }} 
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Item
                              </button>
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
                    {!searchQuery ? (
                      <div className="flex flex-col items-center gap-4">
                        <Package className="w-16 h-16 text-gray-300" />
                        <div>
                          <p className="text-gray-400 font-bold text-sm">No items in this container yet</p>
                          <button
                            onClick={() => setAddModalOpen(true)}
                            className="mt-4 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add First Item
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 font-bold text-sm">No items match your search</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      <AddItemModal 
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        containerId={containerId}
        stockItems={stockItems}
        onSuccess={async () => {
          const itemsData = await containerItemService.getAll(0, 100, containerId);
          setItems(Array.isArray(itemsData) ? itemsData : []);
          setAddModalOpen(false);
          success("Item added successfully");
        }}
        onError={showError}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Item?"
        message={`Are you sure you want to remove this item from the container?`}
        confirmText="Remove Now"
        type="danger"
      />
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function AddItemModal({ isOpen, onClose, containerId, stockItems, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    item_id: "",
    item_description: "",
    quantity: 1,
    unit_price: "0.00"
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        container_id: parseInt(containerId),
        item_id: parseInt(formData.item_id),
        item_description: formData.item_description || null,
        quantity: parseInt(formData.quantity),
        unit_price: parseFloat(formData.unit_price)
      };
      
      await containerItemService.create(payload);
      onSuccess();
      setFormData({ item_id: "", item_description: "", quantity: 1, unit_price: "0.00" });
    } catch (err) {
      onError(err.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-lg border border-gray-100 dark:border-zinc-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black dark:text-white">Add Item to Container</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Container ID: {containerId}</p>
            </div>
          </div>

          <div className="space-y-4">
            <FormField label="Item Category" required>
              <select 
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                value={formData.item_id}
                onChange={(e) => setFormData({...formData, item_id: e.target.value})}
                required
              >
                <option value="">Select Item Category</option>
                {stockItems.map(si => <option key={si.id} value={si.id}>{si.name}</option>)}
              </select>
            </FormField>

            <FormField label="Quantity" required>
              <input 
                type="number"
                min="1"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </FormField>

            <FormField label="Unit Price (AED)">
              <input 
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                value={formData.unit_price}
                onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
              />
            </FormField>

            <FormField label="Item Description">
              <textarea 
                rows="3"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white resize-none"
                value={formData.item_description}
                onChange={(e) => setFormData({...formData, item_description: e.target.value})}
                placeholder="Optional description..."
              />
            </FormField>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button 
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-[15px] font-bold text-sm hover:opacity-90 transition-all"
            >
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-500 dark:text-gray-400 rounded-[15px] font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

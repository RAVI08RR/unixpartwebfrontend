"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Plus, Package, Hash, DollarSign, FileText, Layout, Check, X, Building2, Box
} from "lucide-react";
import { purchaseOrderService } from "@/app/lib/services/purchaseOrderService";
import { poItemService } from "@/app/lib/services/poItemService";
import { useContainers } from "@/app/lib/hooks/useContainers";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { useToast } from "@/app/components/Toast";

export default function AddPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [submittingItem, setSubmittingItem] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const { containers } = useContainers();
  const { branches: apiBranches } = useBranches();
  const { stockItems: apiStockItems } = useStockItems(0, 100);

  const branches = useMemo(() => Array.isArray(apiBranches) ? apiBranches : [], [apiBranches]);
  const stockItems = useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);
  
  const [formData, setFormData] = useState({
    po_id: "",
    container_id: "",
    total_container_revenue: "0.00",
    items_in_stock: 0,
    status: "pending",
    notes: ""
  });

  const [createdPo, setCreatedPo] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    item_id: "",
    po_description: "",
    stock_notes: "",
    current_branch_id: "",
    quantity: 1
  });

  const handleCreateOrder = async (e, shouldAddItems = false) => {
    if (e) e.preventDefault();
    
    if(!formData.po_id || !formData.container_id) {
        showError("Please fill in PO ID and select a Container");
        return;
    }

    setLoading(true);
    try {
        const payload = {
            ...formData,
            container_id: parseInt(formData.container_id),
            items_in_stock: parseInt(formData.items_in_stock),
            total_container_revenue: formData.total_container_revenue.toString()
        };

        const result = await purchaseOrderService.create(payload);
        setCreatedPo(result);
        showSuccess("Purchase order created successfully!");
        
        if (shouldAddItems) {
            setItemModalOpen(true);
        } else {
            router.push("/dashboard/inventory/purchase-orders");
        }
    } catch (err) {
        showError(`Failed to create PO: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    if (e) e.preventDefault();
    if (!createdPo) return;

    setSubmittingItem(true);
    try {
        const payload = {
            stock_number: `STOCK-${Date.now()}`, // Auto-generate stock number
            po_id: createdPo.id,
            item_id: parseInt(itemFormData.item_id),
            current_branch_id: parseInt(itemFormData.current_branch_id),
            quantity: parseInt(itemFormData.quantity),
            po_description: itemFormData.po_description,
            stock_notes: itemFormData.stock_notes,
            status: "in_stock",
            is_dismantled: false
        };

        await poItemService.create(payload);
        showSuccess("Item added successfully!");
        router.push(`/dashboard/inventory/purchase-orders/items/${createdPo.id}`);
    } catch (err) {
        showError(`Failed to add item: ${err.message}`);
    } finally {
        setSubmittingItem(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/inventory/purchase-orders" 
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Add Purchase Order</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Create a new container shipment</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <form onSubmit={(e) => handleCreateOrder(e, true)} className="p-8 space-y-8">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="PO ID" required>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Enter PO ID"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                  value={formData.po_id}
                  onChange={(e) => setFormData({...formData, po_id: e.target.value})}
                  required
                />
              </div>
            </FormField>

            <FormField label="Container Code" required>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                  value={formData.container_id}
                  onChange={(e) => setFormData({...formData, container_id: e.target.value})}
                  required
                >
                  <option value="">Select Container Code</option>
                  {containers?.map(c => (
                    <option key={c.id} value={c.id}>{c.container_code}</option>
                  ))}
                </select>
              </div>
            </FormField>

            <FormField label="Total Container Revenue (AED)">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="1110"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                  value={formData.total_container_revenue}
                  onChange={(e) => setFormData({...formData, total_container_revenue: e.target.value})}
                />
              </div>
            </FormField>

            <FormField label="Items in Stock">
              <div className="relative">
                <Layout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number" 
                  placeholder="15"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                  value={formData.items_in_stock}
                  onChange={(e) => setFormData({...formData, items_in_stock: e.target.value})}
                />
              </div>
            </FormField>

            <FormField label="Status" required>
              <select 
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="in_stock">In Stock</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </FormField>
          </div>

          <FormField label="Notes (Optional)">
            <div className="relative">
              <FileText className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
              <textarea 
                rows="4"
                placeholder="Notes"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </FormField>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save and Add Items'}</span>
            </button>

            <Link 
              href="/dashboard/inventory/purchase-orders"
              className="px-6 py-3 text-gray-500 dark:text-gray-400 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Add Item Modal - Simplified */}
      {itemModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-zinc-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Item to Order</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PO: {createdPo?.po_id}</p>
              </div>
              <button 
                onClick={() => {
                  setItemModalOpen(false);
                  router.push(`/dashboard/inventory/purchase-orders/items/${createdPo.id}`);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCreateItem} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Category" required>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                    value={itemFormData.item_id}
                    onChange={e => setItemFormData({...itemFormData, item_id: e.target.value})}
                  >
                    <option value="">Select Item Category</option>
                    {stockItems.map(si => <option key={si.id} value={si.id}>{si.name}</option>)}
                  </select>
                </FormField>

                <FormField label="Current Branch" required>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                    value={itemFormData.current_branch_id}
                    onChange={e => setItemFormData({...itemFormData, current_branch_id: e.target.value})}
                  >
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                  </select>
                </FormField>

                <FormField label="Quantity" required>
                  <input 
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                    value={itemFormData.quantity}
                    onChange={e => setItemFormData({...itemFormData, quantity: e.target.value})}
                  />
                </FormField>
              </div>

              <FormField label="PO Description" required>
                <input 
                  required
                  placeholder="e.g. Engine Block - High quality part"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                  value={itemFormData.po_description}
                  onChange={e => setItemFormData({...itemFormData, po_description: e.target.value})}
                />
              </FormField>

              <FormField label="Stock Notes">
                <textarea 
                  rows="3"
                  placeholder="Enter any internal notes..."
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white resize-none"
                  value={itemFormData.stock_notes}
                  onChange={e => setItemFormData({...itemFormData, stock_notes: e.target.value})}
                />
              </FormField>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setItemModalOpen(false);
                    router.push(`/dashboard/inventory/purchase-orders/items/${createdPo.id}`);
                  }}
                  className="px-6 py-3 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-lg font-medium text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submittingItem}
                  className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  {submittingItem ? 'Adding Item...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

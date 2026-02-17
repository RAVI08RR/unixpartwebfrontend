"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Package, Hash, FileText, Building2, Box } from "lucide-react";
import { poItemService } from "@/app/lib/services/poItemService";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { useToast } from "@/app/components/Toast";

export default function EditPOItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params?.id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToast();
  
  const { branches: apiBranches } = useBranches();
  const { stockItems: apiStockItems } = useStockItems(0, 100);

  const branches = useMemo(() => Array.isArray(apiBranches) ? apiBranches : [], [apiBranches]);
  const stockItems = useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);

  const [formData, setFormData] = useState({
    stock_number: "",
    item_id: "",
    po_description: "",
    stock_notes: "",
    current_branch_id: "",
    status: "in_stock",
    quantity: 1,
    po_id: ""
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const item = await poItemService.getById(itemId);
        console.log("📦 Loaded PO Item:", item);
        setFormData({
          stock_number: item.stock_number || "",
          item_id: item.item_id ? String(item.item_id) : "",
          po_description: item.po_description || "",
          stock_notes: item.stock_notes || "",
          current_branch_id: item.current_branch_id ? String(item.current_branch_id) : "",
          status: item.status || "in_stock",
          quantity: item.quantity || 1,
          po_id: item.po_id || ""
        });
      } catch (err) {
        console.error("Failed to load item:", err);
        showError("Failed to load item details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        item_id: parseInt(formData.item_id),
        current_branch_id: parseInt(formData.current_branch_id),
        quantity: parseInt(formData.quantity),
        po_id: parseInt(formData.po_id)
      };
      
      await poItemService.update(itemId, payload);
      success("Item updated successfully");
      router.push(`/dashboard/inventory/purchase-orders/items/${formData.po_id}`);
    } catch (err) {
      showError(err.message || "Failed to update item");
    } finally {
      setSubmitting(false);
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
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Edit PO Item</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Update item details</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Stock Number" required>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. DXB-001-000001"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white uppercase"
                  value={formData.stock_number}
                  onChange={(e) => setFormData({...formData, stock_number: e.target.value})}
                  required
                />
              </div>
            </FormField>

            <FormField label="Target Stock Item" required>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                  value={formData.item_id}
                  onChange={(e) => setFormData({...formData, item_id: e.target.value})}
                  required
                >
                  <option value="">Select Item Category</option>
                  {stockItems.map(si => <option key={si.id} value={si.id}>{si.name}</option>)}
                </select>
              </div>
            </FormField>

            <FormField label="Current Branch / Warehouse" required>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                  value={formData.current_branch_id}
                  onChange={(e) => setFormData({...formData, current_branch_id: e.target.value})}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                </select>
              </div>
            </FormField>

            <FormField label="Quantity" required>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number"
                  min="1"
                  placeholder="1"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
            </FormField>

            <FormField label="Status" required>
              <select 
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="in_stock">In Stock</option>
                <option value="sold">Sold</option>
                <option value="reserved">Reserved</option>
                <option value="damaged">Damaged</option>
              </select>
            </FormField>
          </div>

          <FormField label="Order Description" required>
            <div className="relative">
              <FileText className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="e.g. Engine Block - High quality part"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                value={formData.po_description}
                onChange={(e) => setFormData({...formData, po_description: e.target.value})}
                required
              />
            </div>
          </FormField>

          <FormField label="Internal Item Notes">
            <div className="relative">
              <FileText className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
              <textarea 
                rows="4"
                placeholder="Enter any internal notes about this specific part..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white resize-none"
                value={formData.stock_notes}
                onChange={(e) => setFormData({...formData, stock_notes: e.target.value})}
              />
            </div>
          </FormField>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button 
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-[15px] font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Updating...' : 'Update Item'}</span>
            </button>

            <button 
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-gray-500 dark:text-gray-400 rounded-[15px] font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
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

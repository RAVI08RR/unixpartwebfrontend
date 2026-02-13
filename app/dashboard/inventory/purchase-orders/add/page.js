"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Check, Hash, Package, Calendar, Building2, 
  DollarSign, FileText, ChevronDown, Plus, X, Box
} from "lucide-react";
import { containerService } from "../../../../lib/services/containerService";
import { supplierService } from "../../../../lib/services/supplierService";
import { branchService } from "../../../../lib/services/branchService";
import { containerItemService } from "../../../../lib/services/containerItemService";
import { useStockItems } from "../../../../lib/hooks/useStockItems";
import { useToast } from "@/app/components/Toast";

export default function AddPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [newContainerId, setNewContainerId] = useState(null);
  const [submittingItem, setSubmittingItem] = useState(false);
  
  // Stock items for the item modal
  const { stockItems: apiStockItems, isLoading: stockItemsLoading } = useStockItems(0, 100);
  const stockItems = React.useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);

  const [formData, setFormData] = useState({
    po_id: "",
    container_code: "",
    container_number: "",
    supplier_id: "",
    arrival_date: "",
    arrival_branch_id: "",
    total_container_revenue: 0,
    items_in_stock: 0,
    status: "pending",
    notes: ""
  });

  const [itemFormData, setItemFormData] = useState({
    stock_number: "",
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
        const [suppliersData, branchesData] = await Promise.all([
          supplierService.getAll().catch(() => []),
          branchService.getAll().catch(() => [])
        ]);
        
        setSuppliers(suppliersData || []);
        setBranches(branchesData || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setItemFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (shouldAddItems = false) => {
    // Basic validation
    if(!formData.po_id || !formData.container_code || !formData.container_number || 
       !formData.supplier_id || !formData.arrival_date || !formData.arrival_branch_id) {
      error("Please fill in all required fields");
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      error("Your session has expired. Please log in again.");
      router.push("/");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        po_id: formData.po_id.trim(),
        container_code: formData.container_code.trim(),
        container_number: formData.container_number.trim(),
        supplier_id: parseInt(formData.supplier_id),
        arrival_date: formData.arrival_date,
        arrival_branch_id: parseInt(formData.arrival_branch_id),
        total_container_revenue: parseFloat(formData.total_container_revenue) || 0,
        items_in_stock: parseInt(formData.items_in_stock) || 0,
        status: formData.status,
        notes: formData.notes.trim() || null
      };

      console.log("🚀 CREATING PURCHASE ORDER:", payload);

      const result = await containerService.create(payload);
      console.log("✅ Purchase order creation successful:", result);
      success("Purchase order created successfully!");
      
      if (shouldAddItems) {
        setNewContainerId(result.id);
        setItemFormData(prev => ({
          ...prev,
          current_branch_id: formData.arrival_branch_id,
          po_description: `Items for ${formData.po_id}`
        }));
        setShowItemModal(true);
      } else {
        router.push("/dashboard/inventory/purchase-orders");
      }
    } catch (err) {
      console.error("❌ CREATE PURCHASE ORDER FAILED:", err);
      error(`Failed to create purchase order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!newContainerId) return;
    
    setSubmittingItem(true);
    try {
      const createData = {
        stock_number: itemFormData.stock_number,
        container_id: parseInt(newContainerId),
        item_id: parseInt(itemFormData.item_id),
        parent_item_id: parseInt(itemFormData.parent_item_id) || 0,
        po_description: itemFormData.po_description,
        stock_notes: itemFormData.stock_notes,
        current_branch_id: parseInt(itemFormData.current_branch_id),
        status: itemFormData.status,
        is_dismantled: itemFormData.is_dismantled,
        quantity: parseInt(itemFormData.quantity) || 1,
      };
      
      await containerItemService.create(createData);
      success("Container item added successfully");
      setShowItemModal(false);
      // Redirect to container items list page
      router.push(`/dashboard/inventory/purchase-orders/items/${newContainerId}`);
    } catch (err) {
      console.error("Failed to save container item:", err);
      error(err.message || "Failed to save container item");
    } finally {
      setSubmittingItem(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/inventory/purchase-orders" 
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add Purchase Order</h1>
            <p className="text-gray-500 text-sm">Create a new container shipment</p>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* PO ID */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            PO ID <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g., PO-2024-001"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.po_id}
              onChange={(e) => setFormData({...formData, po_id: e.target.value})}
            />
          </div>
        </div>

        {/* Container Code */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Container Code <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g., CONT-001"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.container_code}
              onChange={(e) => setFormData({...formData, container_code: e.target.value})}
            />
          </div>
        </div>

        {/* Container Number */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Container Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g., ABCD1234567"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.container_number}
              onChange={(e) => setFormData({...formData, container_number: e.target.value})}
            />
          </div>
        </div>

        {/* Supplier */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Supplier <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.supplier_id}
              onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Arrival Date */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Arrival Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="date"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              value={formData.arrival_date}
              onChange={(e) => setFormData({...formData, arrival_date: e.target.value})}
            />
          </div>
        </div>

        {/* Arrival Branch */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Arrival Branch <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.arrival_branch_id}
              onChange={(e) => setFormData({...formData, arrival_branch_id: e.target.value})}
            >
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Total Container Revenue */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Container Revenue (AED)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.total_container_revenue}
              onChange={(e) => setFormData({...formData, total_container_revenue: e.target.value})}
            />
          </div>
        </div>

        {/* Items in Stock */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Items in Stock
          </label>
          <div className="relative">
            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="number"
              placeholder="0"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.items_in_stock}
              onChange={(e) => setFormData({...formData, items_in_stock: e.target.value})}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select 
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="arrived">Arrived</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <textarea 
              placeholder="Additional notes about this purchase order"
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-8">
        <button 
          onClick={() => handleSubmit(false)} 
          disabled={loading}
          className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4 text-green-500" />
          <span>{loading ? "Creating..." : "Create Purchase Order"}</span>
        </button>
        <button 
          onClick={() => handleSubmit(true)} 
          disabled={loading}
          className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? "Processing..." : "Save and Add Items"}</span>
        </button>
        <Link href="/dashboard/inventory/purchase-orders" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>

      {/* Add Container Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Add Container Item</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Add a new item to {formData.po_id}
                </p>
              </div>
              <button
                onClick={() => setShowItemModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleItemSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stock Number */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Stock Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="stock_number"
                    value={itemFormData.stock_number}
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
                    value={itemFormData.item_id}
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
                    value={itemFormData.current_branch_id}
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
                    value={itemFormData.quantity}
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
                    value={itemFormData.status}
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
                  value={itemFormData.po_description}
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
                  value={itemFormData.stock_notes}
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
                  checked={itemFormData.is_dismantled}
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
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 px-6 py-3.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="flex-1 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingItem ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

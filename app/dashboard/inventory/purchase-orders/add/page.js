"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Check, Hash, Package, Calendar, Building2, 
  DollarSign, FileText, ChevronDown
} from "lucide-react";
import { containerService } from "../../../../lib/services/containerService";
import { supplierService } from "../../../../lib/services/supplierService";
import { branchService } from "../../../../lib/services/branchService";
import { useToast } from "@/app/components/Toast";

export default function AddPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  
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

  const handleSubmit = async () => {
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
      router.push("/dashboard/inventory/purchase-orders");
    } catch (err) {
      console.error("❌ CREATE PURCHASE ORDER FAILED:", err);
      error(`Failed to create purchase order: ${err.message}`);
    } finally {
      setLoading(false);
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
          onClick={handleSubmit} 
          disabled={loading}
          className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "Creating..." : "Create Purchase Order"}</span>
        </button>
        <Link href="/dashboard/inventory/purchase-orders" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  Package, Hash, FileText, DollarSign, Calendar, Building2, 
  ChevronDown, Check, ArrowLeft, Tag, Layers, Loader2
} from "lucide-react";
import { assetService } from "@/app/lib/services/assetService";
import { branchService } from "@/app/lib/services/branchService";
import { useToast } from "@/app/components/Toast";
import OwnershipSection from "@/app/components/assets/OwnershipSection";
import { supplierService } from "@/app/lib/services/supplierService";

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  
  const [formData, setFormData] = useState({
    asset_id: "",
    asset_name: "",
    description: "",
    category: "",
    purchase_price: "",
    current_value: "",
    purchase_date: "",
    purchase_branch_id: "",
    current_operating_branch_id: "",
    status: "active",
    notes: ""
  });

  const [loading, setLoading] = useState(false);

  // Fetch asset data and branches on component mount
  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      try {
        // Fetch branches
        setBranchesLoading(true);
        const branchesData = await branchService.getDropdown();
        console.log('Branches data loaded:', branchesData);
        setBranches(Array.isArray(branchesData) ? branchesData : []);
        setBranchesLoading(false);

        // Fetch suppliers
        setSuppliersLoading(true);
        const suppliersData = await supplierService.getAll(0, 100);
        console.log('Suppliers data loaded:', suppliersData);
        const suppliersList = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.suppliers || []);
        setSuppliers(suppliersList);
        setSuppliersLoading(false);

        // Fetch asset data
        const assetData = await assetService.getById(params.id);
        console.log('Asset data loaded:', assetData);
        
        setFormData({
          asset_id: assetData.asset_id || "",
          asset_name: assetData.asset_name || "",
          description: assetData.description || "",
          category: assetData.category || "",
          purchase_price: assetData.purchase_price || "",
          current_value: assetData.current_value || "",
          purchase_date: assetData.purchase_date || "",
          purchase_branch_id: assetData.purchase_branch_id || "",
          current_operating_branch_id: assetData.current_operating_branch_id || "",
          status: assetData.status || "active",
          notes: assetData.notes || ""
        });

        // Load existing ownership if available
        if (assetData.ownership && Array.isArray(assetData.ownership)) {
          setOwners(assetData.ownership.map(o => ({
            supplier_id: o.supplier_id?.toString() || "",
            ownership_percentage: o.ownership_percentage?.toString() || ""
          })));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        error('Failed to load asset data');
      } finally {
        setPageLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleSubmit = async () => {
    if (!formData.asset_id || !formData.asset_name || !formData.category || !formData.purchase_price || !formData.purchase_branch_id || !formData.current_operating_branch_id) {
      error("Please fill in all required fields");
      return;
    }

    // Validate ownership if owners are added
    if (owners.length > 0) {
      const totalPercentage = owners.reduce((sum, owner) => sum + (parseFloat(owner.ownership_percentage) || 0), 0);
      if (totalPercentage !== 100) {
        error("Total ownership percentage must equal 100%");
        return;
      }

      // Check for duplicate suppliers
      const supplierIds = owners.map(o => o.supplier_id).filter(Boolean);
      const hasDuplicates = supplierIds.length !== new Set(supplierIds).size;
      if (hasDuplicates) {
        error("Duplicate suppliers detected. Each supplier can only be added once.");
        return;
      }

      // Check all owners have supplier selected
      const hasEmptySupplier = owners.some(o => !o.supplier_id);
      if (hasEmptySupplier) {
        error("Please select a supplier for all owners");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        asset_id: formData.asset_id,
        asset_name: formData.asset_name,
        description: formData.description || null,
        category: formData.category,
        purchase_price: parseFloat(formData.purchase_price),
        current_value: parseFloat(formData.current_value) || parseFloat(formData.purchase_price),
        purchase_date: formData.purchase_date || null,
        purchase_branch_id: parseInt(formData.purchase_branch_id),
        current_operating_branch_id: parseInt(formData.current_operating_branch_id),
        status: formData.status,
        notes: formData.notes || null,
      };

      // Add ownership data if provided
      if (owners.length > 0) {
        payload.ownership = owners.map(owner => ({
          supplier_id: parseInt(owner.supplier_id),
          ownership_percentage: parseFloat(owner.ownership_percentage)
        }));
      }

      await assetService.update(params.id, payload);
      success("Asset updated successfully!");
      router.push("/dashboard/inventory/assets");
    } catch (err) {
      error("Failed to update asset: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading asset data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/inventory/assets" 
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Asset</h1>
            <p className="text-gray-500 text-sm">Update asset information</p>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Asset ID */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Asset ID <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g. AST-001"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.asset_id}
              onChange={(e) => setFormData({...formData, asset_id: e.target.value})}
            />
          </div>
        </div>

        {/* Asset Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Asset Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g. Toyota Forklift"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.asset_name}
              onChange={(e) => setFormData({...formData, asset_name: e.target.value})}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select Category</option>
              <option value="Hard Assets">Hard Assets</option>
              <option value="Vehicle Assets">Vehicle Assets</option>
              <option value="Office Equipment">Office Equipment</option>
              <option value="Warehouse Equipment">Warehouse Equipment</option>
              <option value="Others">Others</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <textarea 
              placeholder="Enter detailed asset description"
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {/* Purchase Price */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Purchase Price (AED) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.purchase_price}
              onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
            />
          </div>
        </div>

        {/* Current Value */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Value (AED) <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.current_value}
              onChange={(e) => setFormData({...formData, current_value: e.target.value})}
            />
          </div>
        </div>

        {/* Purchase Date */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Purchase Date <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="date"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              value={formData.purchase_date}
              onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
            />
          </div>
        </div>

        {/* Purchase Branch */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Purchase Branch <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.purchase_branch_id}
              onChange={(e) => setFormData({...formData, purchase_branch_id: e.target.value})}
              disabled={branchesLoading}
            >
              <option value="">{branchesLoading ? 'Loading branches...' : 'Select Purchase Branch'}</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.label || branch.branch_name || branch.name || 'Unnamed Branch'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Current Operating Branch */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Operating Branch <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.current_operating_branch_id}
              onChange={(e) => setFormData({...formData, current_operating_branch_id: e.target.value})}
              disabled={branchesLoading}
            >
              <option value="">{branchesLoading ? 'Loading branches...' : 'Select Current Branch'}</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.label || branch.branch_name || branch.name || 'Unnamed Branch'}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="disposed">Disposed</option>
              <option value="maintenance">Maintenance</option>
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
              placeholder="Additional notes about the asset"
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        {/* Ownership Section */}
        <div className="lg:col-span-2">
          <OwnershipSection
            owners={owners}
            setOwners={setOwners}
            suppliers={suppliers}
            suppliersLoading={suppliersLoading}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-8">
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all disabled:opacity-50 btn-primary"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "Updating..." : "Update Asset"}</span>
        </button>
        <Link 
          href="/dashboard/inventory/assets" 
          className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}

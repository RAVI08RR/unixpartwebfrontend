"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Package, Hash, FileText, DollarSign, Calendar, Building2, 
  ChevronDown, Check, ArrowLeft, Tag, Layers, Truck
} from "lucide-react";
import { assetService } from "@/app/lib/services/assetService";
import { branchService } from "@/app/lib/services/branchService";
import { supplierService } from "@/app/lib/services/supplierService";
import { useToast } from "@/app/components/Toast";
import OwnershipSection from "@/app/components/assets/OwnershipSection";

export default function AddAssetPage() {
  const router = useRouter();
  const { success, error } = useToast();
  
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
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
    supplier_id: "",
    status: "active",
    notes: ""
  });

  const [loading, setLoading] = useState(false);

  // Fetch branches and suppliers on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch branches
      setBranchesLoading(true);
      try {
        const branchesData = await branchService.getDropdown();
        console.log('Branches data loaded:', branchesData);
        setBranches(Array.isArray(branchesData) ? branchesData : []);
      } catch (err) {
        console.error('Failed to fetch branches:', err);
        error('Failed to load branches');
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }

      // Fetch suppliers
      setSuppliersLoading(true);
      try {
        const suppliersData = await supplierService.getAll(0, 100);
        console.log('Suppliers data loaded:', suppliersData);
        const suppliersList = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.suppliers || []);
        setSuppliers(suppliersList);
      } catch (err) {
        console.error('Failed to fetch suppliers:', err);
        setSuppliers([]);
      } finally {
        setSuppliersLoading(false);
      }
    };

    fetchData();
  }, []);

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

      await assetService.create(payload);
      success("Asset created successfully!");
      router.push("/dashboard/inventory/assets");
    } catch (err) {
      error("Failed to create asset: " + err.message);
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
            href="/dashboard/inventory/assets" 
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add Asset</h1>
            <p className="text-gray-500 text-sm">Create a new asset record</p>
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

        {/* Supplier */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Supplier <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.supplier_id}
              onChange={(e) => {
                setFormData({...formData, supplier_id: e.target.value});
                const supplier = suppliers.find(s => s.id === parseInt(e.target.value));
                setSelectedSupplier(supplier || null);
              }}
              disabled={suppliersLoading}
            >
              <option value="">{suppliersLoading ? 'Loading suppliers...' : 'Select a supplier...'}</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} ({supplier.supplier_code || 'N/A'})
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

        {/* Supplier Funds Summary - Only show when supplier is selected */}
        {selectedSupplier && (
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              Supplier Funds Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sales</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  AED 150,000.00
                </p>
              </div>
              
              <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Transferred</p>
                <p className="text-lg font-black text-green-600 dark:text-green-400">
                  AED 130,000.00
                </p>
              </div>
              
              <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expenses</p>
                <p className="text-lg font-black text-red-600 dark:text-red-400">
                  - AED 8,000.00
                </p>
              </div>
              
              <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Outstanding Balance</p>
                <p className="text-lg font-black text-orange-600 dark:text-orange-400">
                  AED 12,000.00
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                💡 Static data for {selectedSupplier.name}. API integration coming soon.
              </p>
            </div>
          </div>
        )}

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
          <span>{loading ? "Creating..." : "Create Asset"}</span>
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

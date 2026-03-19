"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  Package, Hash, FileText, DollarSign, Calendar, Building2, 
  ChevronDown, Check, ArrowLeft, Tag, Layers, Loader2, ArrowRightLeft, History, ChevronUp
} from "lucide-react";
import { assetService } from "@/app/lib/services/assetService";
import { branchService } from "@/app/lib/services/branchService";
import { useToast } from "@/app/components/Toast";
import OwnershipSection from "@/app/components/assets/OwnershipSection";
import { supplierService } from "@/app/lib/services/supplierService";
import TransferModal from "@/app/components/assets/TransferModal";

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
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [assetData, setAssetData] = useState(null);
  const [transferHistory, setTransferHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  
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
        const fetchedAssetData = await assetService.getById(params.id);
        console.log('Asset data loaded:', fetchedAssetData);
        setAssetData(fetchedAssetData);
        
        setFormData({
          asset_id: fetchedAssetData.asset_id || "",
          asset_name: fetchedAssetData.asset_name || "",
          description: fetchedAssetData.description || "",
          category: fetchedAssetData.category || "",
          purchase_price: fetchedAssetData.purchase_price || "",
          current_value: fetchedAssetData.current_value || "",
          purchase_date: fetchedAssetData.purchase_date || "",
          purchase_branch_id: fetchedAssetData.purchase_branch_id || "",
          current_operating_branch_id: fetchedAssetData.current_operating_branch_id || "",
          status: fetchedAssetData.status || "active",
          notes: fetchedAssetData.notes || ""
        });

        // Fetch ownership history separately
        try {
          const ownershipHistory = await assetService.getOwnershipHistory(params.id);
          console.log('Ownership history loaded:', ownershipHistory);
          
          // Filter for active ownership (where to_date is null)
          if (ownershipHistory && Array.isArray(ownershipHistory)) {
            const activeOwnership = ownershipHistory.filter(o => !o.to_date);
            if (activeOwnership.length > 0) {
              setOwners(activeOwnership.map(o => ({
                supplier_id: o.supplier_id?.toString() || "",
                ownership_percentage: o.ownership_percentage?.toString() || ""
              })));
            }
          }
        } catch (ownershipErr) {
          console.error('Failed to fetch ownership history:', ownershipErr);
          // Don't fail the whole page if ownership fetch fails
        }

        // Fetch transfer history
        await fetchTransferHistory();
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

  const fetchTransferHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await assetService.getTransferHistory(params.id);
      setTransferHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error("Failed to fetch transfer history:", err);
      setTransferHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTransfer = async (transferData) => {
    setTransferring(true);
    try {
      await assetService.transfer(params.id, transferData);
      success("Asset transferred successfully!");
      setTransferModalOpen(false);
      
      // Refresh asset data
      const updatedAsset = await assetService.getById(params.id);
      setAssetData(updatedAsset);
      setFormData({
        ...formData,
        current_operating_branch_id: updatedAsset.current_operating_branch_id || ""
      });
      
      // Refresh transfer history
      await fetchTransferHistory();
    } catch (err) {
      error("Failed to transfer asset: " + err.message);
      throw err;
    } finally {
      setTransferring(false);
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? (branch.branch_name || branch.label || branch.name) : 'Unknown';
  };

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
        // Use updateOwnershipWithHistory to track changes
        const ownershipPayload = owners.map(owner => ({
          supplier_id: parseInt(owner.supplier_id),
          ownership_percentage: parseFloat(owner.ownership_percentage)
        }));
        
        // First update the asset
        await assetService.update(params.id, payload);
        
        // Then update ownership with history tracking
        await assetService.updateOwnershipWithHistory(params.id, {
          ownership: ownershipPayload
        });
      } else {
        // Just update the asset without ownership
        await assetService.update(params.id, payload);
      }

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
        
        {/* Transfer Button */}
        <button
          onClick={() => setTransferModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Transfer Asset
        </button>
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

      {/* Transfer History Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transfer History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {transferHistory.length} transfer{transferHistory.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showHistory && (
          <div className="border-t border-gray-200 dark:border-zinc-800">
            {loadingHistory ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                <p className="text-sm text-gray-500">Loading transfer history...</p>
              </div>
            ) : transferHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        From Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        To Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Responsible Person
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {transferHistory.map((transfer, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {transfer.transfer_date ? new Date(transfer.transfer_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getBranchName(transfer.from_branch_id)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getBranchName(transfer.to_branch_id)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {transfer.reason || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {transfer.responsible_person || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No transfer history available</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Transfer records will appear here once the asset is moved between branches
                </p>
              </div>
            )}
          </div>
        )}
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

      {/* Transfer Modal */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        asset={assetData}
        branches={branches}
        onTransfer={handleTransfer}
        isLoading={transferring}
      />
    </div>
  );
}

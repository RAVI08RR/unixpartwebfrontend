"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, ArrowLeft, Save, X, TrendingUp, AlertCircle, Plus, Trash2, Percent, Truck
} from "lucide-react";
import { branchService } from "@/app/lib/services/branchService";
import { supplierService } from "@/app/lib/services/supplierService";
import { branchOwnerService } from "@/app/lib/services/branchOwnerService";
import { useToast } from "@/app/components/Toast";

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params.id;
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    branch_name: "",
    branch_code: "",
    status: true,
    total_revenue: 0,
    total_outstanding: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [existingOwners, setExistingOwners] = useState([]);

  // Fetch branch data, suppliers, and existing owners
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch branch, suppliers, and owners in parallel
        const [branchData, suppliersData, ownersData] = await Promise.all([
          branchService.getById(branchId),
          supplierService.getAll(0, 100),
          branchOwnerService.getAll(0, 100)
        ]);
        
        // Set branch data
        setFormData({
          branch_name: branchData.branch_name || "",
          branch_code: branchData.branch_code || "",
          status: branchData.status !== undefined ? branchData.status : true,
          total_revenue: branchData.total_revenue || 0,
          total_outstanding: branchData.total_outstanding || 0,
        });
        
        // Set suppliers
        const suppliersList = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.suppliers || []);
        setSuppliers(suppliersList);
        
        // Set existing owners for this branch
        const allOwners = Array.isArray(ownersData) ? ownersData : [];
        const branchOwners = allOwners.filter(owner => owner.branch_id === parseInt(branchId));
        setExistingOwners(branchOwners);
        
        // Initialize owners state with existing owners
        setOwners(branchOwners.map(owner => ({
          id: owner.id, // Keep ID for updates/deletes
          supplier_id: owner.supplier_id.toString(),
          share_percent: owner.share_percent.toString(),
          share_amount: owner.share_amount.toString()
        })));
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load branch data");
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId) {
      fetchData();
    }
  }, [branchId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAddOwner = () => {
    setOwners(prev => [...prev, { supplier_id: "", share_percent: "", share_amount: "0" }]);
  };

  const handleRemoveOwner = (index) => {
    setOwners(prev => prev.filter((_, i) => i !== index));
  };

  const handleOwnerChange = (index, field, value) => {
    setOwners(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const getTotalSharePercent = () => {
    return owners.reduce((sum, owner) => sum + (parseFloat(owner.share_percent) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Validate total percentage
      const totalPercent = getTotalSharePercent();
      if (totalPercent > 100) {
        showError("Total ownership percentage cannot exceed 100%");
        setError("Total ownership percentage cannot exceed 100%");
        setIsSaving(false);
        return;
      }

      const payload = {
        branch_name: formData.branch_name,
        branch_code: formData.branch_code,
        status: formData.status,
        total_revenue: parseFloat(formData.total_revenue) || 0,
        total_outstanding: parseFloat(formData.total_outstanding) || 0,
      };

      // Update branch
      await branchService.update(branchId, payload);

      // Handle owners - delete all existing and create new ones
      if (existingOwners.length > 0) {
        console.log("Deleting existing owners...");
        for (const owner of existingOwners) {
          try {
            await branchOwnerService.delete(owner.id);
          } catch (deleteError) {
            console.error("Failed to delete owner:", deleteError);
          }
        }
      }

      // Create new owners if any
      const validOwners = owners
        .filter(owner => owner.supplier_id && owner.share_percent)
        .map(owner => ({
          branch_id: parseInt(branchId),
          supplier_id: parseInt(owner.supplier_id),
          share_percent: parseFloat(owner.share_percent),
          share_amount: parseFloat(owner.share_amount) || 0,
        }));

      if (validOwners.length > 0) {
        console.log("Creating new owners:", validOwners);
        try {
          await branchOwnerService.bulkCreate(validOwners);
          success(`Branch and ${validOwners.length} owner(s) updated successfully!`);
        } catch (ownerError) {
          console.error("Failed to update owners:", ownerError);
          showError("Branch updated but owners failed to save");
        }
      } else {
        success("Branch updated successfully!");
      }

      router.push("/dashboard/administration/branches");
    } catch (err) {
      console.error("Failed to update branch:", err);
      setError(err.message || "Failed to update branch");
      showError(err.message || "Failed to update branch");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/administration/branches"
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Edit Branch</h1>
            <p className="text-gray-400 dark:text-white text-sm font-normal">Loading branch data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/administration/branches"
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Edit Branch</h1>
          <p className="text-gray-400 dark:text-white text-sm font-normal">Update branch information</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Branch Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Branch Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleChange}
                required
                placeholder="Enter branch name"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Branch Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Branch Code
              </label>
              <input
                type="text"
                name="branch_code"
                value={formData.branch_code}
                onChange={handleChange}
                placeholder="Enter branch code"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Total Revenue */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Total Revenue (AED)
                </div>
              </label>
              <input
                type="number"
                name="total_revenue"
                value={formData.total_revenue}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Total Outstanding */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Total Outstanding (AED)
                </div>
              </label>
              <input
                type="number"
                name="total_outstanding"
                value={formData.total_outstanding}
                onChange={handleChange}
                placeholder="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 checkbox-black"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Active Branch
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Ownership Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ownership</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add suppliers and their ownership share (Optional)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddOwner}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Owner</span>
            </button>
          </div>

          {owners.length > 0 && (
            <div className="space-y-4">
              {owners.map((owner, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Supplier */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Supplier
                      </label>
                      <select
                        value={owner.supplier_id}
                        onChange={(e) => handleOwnerChange(index, 'supplier_id', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        disabled={suppliersLoading}
                      >
                        <option value="">{suppliersLoading ? 'Loading...' : 'Select supplier'}</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.supplier_code || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Share Percent */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Share %
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={owner.share_percent}
                          onChange={(e) => handleOwnerChange(index, 'share_percent', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          max="100"
                          step="0.01"
                          className="w-full pl-3 pr-8 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                        <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Share Amount */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Share Amount (AED)
                      </label>
                      <input
                        type="number"
                        value={owner.share_amount}
                        onChange={(e) => handleOwnerChange(index, 'share_amount', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveOwner(index)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group/delete mt-7"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600" />
                  </button>
                </div>
              ))}

              {/* Total Percentage Display */}
              {owners.length > 0 && (
                <div className="flex items-center justify-end gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Total Share:</span>
                  <span className={`text-lg font-black ${
                    getTotalSharePercent() === 100 
                      ? 'text-green-600 dark:text-green-400' 
                      : getTotalSharePercent() > 100
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {getTotalSharePercent().toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {owners.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No owners added yet. Click "Add Owner" to add suppliers.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/administration/branches"
            className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

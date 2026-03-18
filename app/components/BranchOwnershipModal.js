"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Percent, Truck, Save } from "lucide-react";
import { supplierService } from "@/app/lib/services/supplierService";
import { branchOwnerService } from "@/app/lib/services/branchOwnerService";
import { useToast } from "@/app/components/Toast";

export default function BranchOwnershipModal({ branch, isOpen, onClose, onSuccess }) {
  const { success, error: showError } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingOwners, setExistingOwners] = useState([]);
  
  const [branchOwners, setBranchOwners] = useState([
    { supplier_id: "", share_percent: "" }
  ]);

  // Fetch suppliers and existing owners
  useEffect(() => {
    if (isOpen && branch) {
      fetchData();
    }
  }, [isOpen, branch]);

  const fetchData = async () => {
    // Fetch suppliers
    setSuppliersLoading(true);
    try {
      const suppliersData = await supplierService.getAll(0, 100);
      const suppliersList = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.suppliers || []);
      setSuppliers(suppliersList);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      setSuppliers([]);
    } finally {
      setSuppliersLoading(false);
    }

    // Fetch existing branch owners
    try {
      const summary = await branchOwnerService.getBranchSummary(branch.id);
      if (summary && summary.owners && summary.owners.length > 0) {
        setExistingOwners(summary.owners);
        setBranchOwners(summary.owners.map(owner => ({
          id: owner.id,
          supplier_id: owner.supplier_id,
          share_percent: owner.share_percent
        })));
      }
    } catch (err) {
      console.error('Failed to fetch branch owners:', err);
    }
  };

  // Add new branch owner row
  const addBranchOwner = () => {
    setBranchOwners([...branchOwners, { supplier_id: "", share_percent: "" }]);
  };

  // Remove branch owner row
  const removeBranchOwner = (index) => {
    if (branchOwners.length > 1) {
      setBranchOwners(branchOwners.filter((_, i) => i !== index));
    }
  };

  // Update branch owner
  const updateBranchOwner = (index, field, value) => {
    const updated = [...branchOwners];
    updated[index][field] = value;
    setBranchOwners(updated);
  };

  // Calculate total percentage
  const getTotalPercentage = () => {
    return branchOwners.reduce((sum, owner) => {
      const percentage = parseFloat(owner.share_percent) || 0;
      return sum + percentage;
    }, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validate branch owners
      const filledOwners = branchOwners.filter(owner => owner.supplier_id || owner.share_percent);
      
      if (filledOwners.length === 0) {
        showError("Please add at least one branch owner");
        return;
      }

      // Check if all filled owners have both supplier and percentage
      const invalidOwners = filledOwners.filter(owner => !owner.supplier_id || !owner.share_percent);
      if (invalidOwners.length > 0) {
        showError("Please complete all branch owner entries or remove empty ones");
        return;
      }

      // Check total percentage
      const totalPercentage = getTotalPercentage();
      if (totalPercentage > 100) {
        showError(`Total ownership percentage cannot exceed 100% (currently ${totalPercentage}%)`);
        return;
      }

      // Delete existing owners first
      for (const existingOwner of existingOwners) {
        try {
          await branchOwnerService.delete(existingOwner.id);
        } catch (err) {
          console.error('Failed to delete existing owner:', err);
        }
      }

      // Create new branch owners
      for (const owner of filledOwners) {
        await branchOwnerService.create({
          branch_id: branch.id,
          supplier_id: parseInt(owner.supplier_id),
          share_percent: parseFloat(owner.share_percent),
          share_amount: 0,
        });
      }

      success("Branch ownership updated successfully!");
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (err) {
      console.error("Failed to update branch ownership:", err);
      showError(err.message || "Failed to update branch ownership");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Branch Ownership
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {branch.branch_name} ({branch.branch_code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add suppliers and their ownership percentage
            </p>
            <button
              type="button"
              onClick={addBranchOwner}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Owner
            </button>
          </div>

          {/* Branch Owners List */}
          <div className="space-y-3">
            {branchOwners.map((owner, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Supplier Dropdown */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Supplier
                    </label>
                    <select
                      value={owner.supplier_id}
                      onChange={(e) => updateBranchOwner(index, 'supplier_id', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      disabled={suppliersLoading}
                    >
                      <option value="">{suppliersLoading ? 'Loading...' : 'Select supplier...'}</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.supplier_code || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ownership Percentage */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Ownership Share (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={owner.share_percent}
                        onChange={(e) => updateBranchOwner(index, 'share_percent', e.target.value)}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full pl-3 pr-10 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                {branchOwners.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBranchOwner(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove owner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Total Percentage Display */}
          {branchOwners.some(owner => owner.share_percent) && (
            <div className={`p-4 rounded-xl border-2 ${
              getTotalPercentage() > 100 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800' 
                : getTotalPercentage() === 100
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Total Ownership:
                </span>
                <span className={`text-lg font-black ${
                  getTotalPercentage() > 100 
                    ? 'text-red-600 dark:text-red-400' 
                    : getTotalPercentage() === 100
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {getTotalPercentage().toFixed(2)}%
                </span>
              </div>
              {getTotalPercentage() > 100 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  ⚠️ Total percentage cannot exceed 100%
                </p>
              )}
              {getTotalPercentage() === 100 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ✓ Perfect! Total ownership is 100%
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Ownership"}
          </button>
        </div>
      </div>
    </div>
  );
}

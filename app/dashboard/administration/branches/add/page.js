"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Save, X, Plus, Trash2, Percent } from "lucide-react";
import Link from "next/link";
import { branchService } from "@/app/lib/services/branchService";
import { supplierService } from "@/app/lib/services/supplierService";
import { branchOwnerService } from "@/app/lib/services/branchOwnerService";
import { useToast } from "@/app/components/Toast";

export default function AddBranchPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    branch_name: "",
    branch_code: "",
    status: true,
    total_revenue: "",
    total_outstanding: "",
  });

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [owners, setOwners] = useState([]);

  // Fetch suppliers on component mount
  useEffect(() => {
    const fetchSuppliers = async () => {
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
    };

    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    setIsLoading(true);
    setError("");

    try {
      // Prepare the data for submission
      const submitData = {
        branch_name: formData.branch_name.trim(),
        branch_code: formData.branch_code.trim().toUpperCase(),
        status: formData.status,
        total_revenue: formData.total_revenue ? parseFloat(formData.total_revenue) : 0,
        total_outstanding: formData.total_outstanding ? parseFloat(formData.total_outstanding) : 0,
      };

      // Validate required fields
      if (!submitData.branch_name || !submitData.branch_code) {
        setError("Branch name and code are required");
        return;
      }

      console.log("Creating branch with data:", submitData);
      
      // Create the branch
      const createdBranch = await branchService.create(submitData);
      const branchId = createdBranch.id;

      // Create branch owners if any
      if (owners.length > 0 && branchId) {
        console.log("Creating branch owners for branch ID:", branchId);
        
        // Validate total percentage
        const totalPercent = getTotalSharePercent();
        if (totalPercent > 100) {
          showError("Total ownership percentage cannot exceed 100%");
          setError("Total ownership percentage cannot exceed 100%");
          return;
        }

        // Create all owners in parallel
        const ownerPromises = owners
          .filter(owner => owner.supplier_id && owner.share_percent)
          .map(owner => 
            branchOwnerService.create({
              branch_id: branchId,
              supplier_id: parseInt(owner.supplier_id),
              share_percent: parseFloat(owner.share_percent),
              share_amount: parseFloat(owner.share_amount) || 0,
            })
          );

        try {
          await Promise.all(ownerPromises);
          console.log("All branch owners created successfully");
        } catch (ownerError) {
          console.error("Failed to create some branch owners:", ownerError);
          showError("Branch created but some owners failed to save");
        }
      }
      
      // Success - redirect to branches list
      success("Branch created successfully!");
      router.push("/dashboard/administration/branches");
      
    } catch (err) {
      console.error("Failed to create branch:", err);
      setError(err.message || "Failed to create branch. Please try again.");
      showError(err.message || "Failed to create branch");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/administration/branches"
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Add New Branch</h1>
          <p className="text-gray-400 dark:text-white text-sm font-normal">Create a new branch in the system</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-black dark:bg-black-900/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Branch Information</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Fill in the branch details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleChange}
                  placeholder="Enter branch name"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  required
                />
              </div>

              {/* Branch Code */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Branch Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="branch_code"
                  value={formData.branch_code}
                  onChange={handleChange}
                  placeholder="Enter branch code (e.g., DXB)"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm uppercase"
                  required
                />
              </div>

              {/* Total Revenue */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Total Revenue (AED)
                </label>
                <input
                  type="number"
                  name="total_revenue"
                  value={formData.total_revenue}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              {/* Total Outstanding */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Total Outstanding (AED)
                </label>
                <input
                  type="number"
                  name="total_outstanding"
                  value={formData.total_outstanding}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Status</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                </label>
              </div>
            </div>

            {/* Ownership Section */}
            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ownership</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add suppliers and their ownership share (Optional)</p>
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

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-black text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? "Creating..." : "Create Branch"}</span>
              </button>
              
              <Link
                href="/dashboard/administration/branches"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
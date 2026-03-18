"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Truck, Save, X, Percent } from "lucide-react";
import Link from "next/link";
import { branchOwnerService } from "@/app/lib/services/branchOwnerService";
import { branchService } from "@/app/lib/services/branchService";
import { supplierService } from "@/app/lib/services/supplierService";
import { useToast } from "@/app/components/Toast";

export default function AddBranchOwnerPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    branch_id: "",
    supplier_id: "",
    share_percent: "",
    share_amount: "0",
  });

  // Fetch branches and suppliers on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch branches
      setBranchesLoading(true);
      try {
        const branchesData = await branchService.getAll(0, 100);
        const branchList = Array.isArray(branchesData) ? branchesData : (branchesData?.branches || []);
        setBranches(branchList);
      } catch (err) {
        console.error('Failed to fetch branches:', err);
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }

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
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.branch_id || !formData.supplier_id || !formData.share_percent) {
        setError("Branch, Supplier, and Share Percent are required");
        return;
      }

      // Validate percentage
      const percentage = parseFloat(formData.share_percent);
      if (percentage <= 0 || percentage > 100) {
        setError("Share percent must be between 0 and 100");
        return;
      }

      // Prepare the data for submission
      const submitData = {
        branch_id: parseInt(formData.branch_id),
        supplier_id: parseInt(formData.supplier_id),
        share_percent: percentage,
        share_amount: parseFloat(formData.share_amount) || 0,
      };

      console.log("Creating branch owner with data:", submitData);
      
      await branchOwnerService.create(submitData);
      
      // Success - redirect to branch owners list
      success("Branch owner created successfully!");
      router.push("/dashboard/administration/branch-owners");
      
    } catch (err) {
      console.error("Failed to create branch owner:", err);
      setError(err.message || "Failed to create branch owner. Please try again.");
      showError(err.message || "Failed to create branch owner");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/administration/branch-owners"
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Add Branch Owner</h1>
          <p className="text-gray-400 dark:text-white text-sm font-normal">Create a new branch ownership record</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ownership Information</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Fill in the ownership details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  required
                  disabled={branchesLoading}
                >
                  <option value="">{branchesLoading ? 'Loading branches...' : 'Select Branch'}</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name} ({branch.branch_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  required
                  disabled={suppliersLoading}
                >
                  <option value="">{suppliersLoading ? 'Loading suppliers...' : 'Select Supplier'}</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.supplier_code || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Share Percent */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Share Percent (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="share_percent"
                    value={formData.share_percent}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full pl-4 pr-10 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    required
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Share Amount */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Share Amount (AED)
                </label>
                <input
                  type="number"
                  name="share_amount"
                  value={formData.share_amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
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
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? "Creating..." : "Create Branch Owner"}</span>
              </button>
              
              <Link
                href="/dashboard/administration/branch-owners"
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

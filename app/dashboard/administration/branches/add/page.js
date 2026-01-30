"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Save, X } from "lucide-react";
import Link from "next/link";
import { branchService } from "@/app/lib/services/branchService";

export default function AddBranchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    branch_name: "",
    branch_code: "",
    status: true,
    total_revenue: "",
    total_outstanding: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      
      await branchService.create(submitData);
      
      // Success - redirect to branches list
      router.push("/dashboard/administration/branches");
      
    } catch (err) {
      console.error("Failed to create branch:", err);
      setError(err.message || "Failed to create branch. Please try again.");
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
          <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Create a new branch in the system</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
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
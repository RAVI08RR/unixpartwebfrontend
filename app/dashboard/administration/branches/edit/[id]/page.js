"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, ArrowLeft, Save, X, TrendingUp, AlertCircle
} from "lucide-react";
import { branchService } from "@/app/lib/services/branchService";

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params.id;

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

  // Fetch branch data
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        setIsLoading(true);
        const data = await branchService.getById(branchId);
        setFormData({
          branch_name: data.branch_name || "",
          branch_code: data.branch_code || "",
          status: data.status !== undefined ? data.status : true,
          total_revenue: data.total_revenue || 0,
          total_outstanding: data.total_outstanding || 0,
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch branch:", err);
        setError("Failed to load branch data");
      } finally {
        setIsLoading(false);
      }
    };

    if (branchId) {
      fetchBranch();
    }
  }, [branchId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        branch_name: formData.branch_name,
        branch_code: formData.branch_code,
        status: formData.status,
        total_revenue: parseFloat(formData.total_revenue) || 0,
        total_outstanding: parseFloat(formData.total_outstanding) || 0,
      };

      await branchService.update(branchId, payload);
      router.push("/dashboard/administration/branches");
    } catch (err) {
      console.error("Failed to update branch:", err);
      setError(err.message || "Failed to update branch");
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

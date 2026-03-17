"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Package } from "lucide-react";
import { assetService } from "@/app/lib/services/assetService";
import { useToast } from "@/app/components/Toast";
import { useBranches } from "@/app/lib/hooks/useBranches";

export default function AddAssetPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const { branches } = useBranches(0, 100, true);
  
  const [formData, setFormData] = useState({
    asset_id: "",
    description: "",
    category: "",
    purchase_value: "",
    current_value: "",
    purchase_date: "",
    branch_id: "",
    status: "active",
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
    setLoading(true);

    try {
      const payload = {
        ...formData,
        purchase_value: parseFloat(formData.purchase_value) || 0,
        current_value: parseFloat(formData.current_value) || 0,
        branch_id: parseInt(formData.branch_id),
      };

      await assetService.create(payload);
      success("Asset created successfully!");
      router.push("/dashboard/inventory/assets");
    } catch (err) {
      error("Failed to create asset: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Add New Asset</h1>
          <p className="text-gray-400 dark:text-zinc-500 text-sm">Create a new asset record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Asset ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="asset_id"
              value={formData.asset_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 text-sm"
              placeholder="Enter asset ID"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 text-sm"
              placeholder="e.g., Vehicle, Equipment, Furniture"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 text-sm"
              placeholder="Enter asset description"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Purchase Value <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="purchase_value"
              value={formData.purchase_value}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 text-sm"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Current Value <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="current_value"
              value={formData.current_value}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 text-sm"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Purchase Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Branch <span className="text-red-600">*</span>
            </label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 text-sm"
            >
              <option value="">Select Branch</option>
              {branches && branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Status <span className="text-red-600">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 text-sm"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="disposed">Disposed</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/50 text-sm"
              placeholder="Additional notes (optional)"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-4 bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Asset
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

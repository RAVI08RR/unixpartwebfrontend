"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Save, X } from "lucide-react";
import Link from "next/link";
import { stockItemService } from "@/app/lib/services/stockItemService";

export default function AddStockItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_category_id: "",
    status: true,
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await stockItemService.getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Continue without categories if fetch fails
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'parent_category_id' ? parseInt(value) || '' : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Prepare the data for submission
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parent_category_id: formData.parent_category_id ? parseInt(formData.parent_category_id) : 0,
        status: formData.status,
      };

      // Validate required fields
      if (!submitData.name) {
        setError("Stock item name is required");
        return;
      }

      console.log("Creating stock item with data:", submitData);
      
      await stockItemService.create(submitData);
      
      // Success - redirect to stock items list
      router.push("/dashboard/inventory/stock-items");
      
    } catch (err) {
      console.error("Failed to create stock item:", err);
      setError(err.message || "Failed to create stock item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/inventory/stock-items"
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Add New Stock Item</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Create a new stock item in the system</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stock Item Information</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Fill in the stock item details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock Item Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Stock Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter stock item name"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                  required
                />
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Parent Category
                </label>
                <select
                  name="parent_category_id"
                  value={formData.parent_category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  {/* Fallback options if categories API fails */}
                  {categories.length === 0 && (
                    <>
                      <option value="1">Engine Parts</option>
                      <option value="2">Transmission Parts</option>
                      <option value="3">Brake Parts</option>
                      <option value="4">Electrical Parts</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter stock item description"
                rows="4"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm resize-none"
              />
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
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
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
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? "Creating..." : "Create Stock Item"}</span>
              </button>
              
              <Link
                href="/dashboard/inventory/stock-items"
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
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  Package, FileText, Tag, Check, X, ArrowLeft
} from "lucide-react";
import { stockItemService } from "@/app/lib/services/stockItemService";

export default function EditStockItemPage() {
  const router = useRouter();
  const params = useParams();
  const stockItemId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [stockItemLoading, setStockItemLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_category_id: "",
    status: true
  });

  // Fetch stock item data
  useEffect(() => {
    const fetchStockItem = async () => {
      if (!stockItemId) return;
      
      // Check authentication first
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("You need to log in to access this page.");
        router.push("/");
        return;
      }
      
      setStockItemLoading(true);
      try {
        const stockItemData = await stockItemService.getById(stockItemId);
        console.log('Fetched stock item data:', stockItemData);
        
        setFormData({
          name: stockItemData.name || "",
          description: stockItemData.description || "",
          parent_category_id: stockItemData.parent_category_id || "",
          status: stockItemData.status !== undefined ? stockItemData.status : true
        });
      } catch (error) {
        console.error("Failed to fetch stock item:", error);
        
        // Check if it's an authentication error
        if (error.message.includes("session has expired") || error.message.includes("401")) {
          alert("Your session has expired. Please log in again.");
          router.push("/");
          return;
        }
        
        alert("Failed to load stock item data");
        router.push("/dashboard/inventory/stock-items");
      } finally {
        setStockItemLoading(false);
      }
    };

    fetchStockItem();
  }, [stockItemId, router]);

  const handleSubmit = async () => {
    // Basic validation
    if(!formData.name) {
      alert("Please fill in the stock item name");
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("Your session has expired or you are not logged in. Please log in again.");
      router.push("/");
      return;
    }

    setLoading(true);
    try {
      // Prepare payload
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parent_category_id: formData.parent_category_id ? parseInt(formData.parent_category_id) : null,
        status: formData.status
      };

      console.log("🚀 UPDATING STOCK ITEM:", {
        stockItemId,
        token: !!token,
        payload
      });

      const result = await stockItemService.update(stockItemId, payload);
      console.log("✅ Stock item update successful:", result);
      alert("✅ Stock item updated successfully!");
      router.push("/dashboard/inventory/stock-items");
    } catch (error) {
      console.error("❌ UPDATE STOCK ITEM FAILED:", error);
      
      // Try to show the most helpful error message
      let detailedMsg = error.message;
      if (detailedMsg.includes("422")) {
        detailedMsg = "Validation Error: Please check if required fields are missing or invalid.";
      } else if (detailedMsg.includes("400")) {
        detailedMsg = "Bad Request: The server couldn't process the request. Please check all field values.";
      } else if (detailedMsg.includes("401")) {
        detailedMsg = "Authentication Error: Please log in again.";
      } else if (detailedMsg.includes("500")) {
        detailedMsg = "Server Error: Please try again later or contact support.";
      }
      
      alert(`Failed to update stock item: ${detailedMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (stockItemLoading) {
    return (
      <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Stock Item</h1>
            <p className="text-gray-500 text-sm">Update stock item information</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading stock item data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Stock Item</h1>
          <p className="text-gray-500 text-sm">Update stock item information</p>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Item Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Item Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Enter item name"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        {/* Category ID */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Category ID
          </label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="number"
              placeholder="Enter category ID"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.parent_category_id}
              onChange={(e) => setFormData({...formData, parent_category_id: e.target.value})}
            />
          </div>
        </div>

        {/* Description - Full Width */}
        <div className="lg:col-span-2 space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <textarea 
              placeholder="Enter item description"
              rows="4"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select 
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value === 'true'})}
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-8">
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "Updating..." : "Update Stock Item"}</span>
        </button>
        <Link href="/dashboard/inventory/stock-items" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}
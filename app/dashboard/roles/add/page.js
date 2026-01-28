"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Shield, Filter, Download, Plus, Check, Search, Loader2
} from "lucide-react";
import { useRoles } from "@/app/lib/hooks/useRoles";

export default function AddRolePage() {
  const router = useRouter();
  const { createRole } = useRoles();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Role name is required');
      return;
    }

    try {
      setLoading(true);
      await createRole({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      // Success - redirect to roles list
      router.push('/dashboard/roles');
    } catch (error) {
      console.error('Error creating role:', error);
      alert(`Failed to create role: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add Role</h1>
          <p className="text-gray-500 text-sm">Create a new user account and assign permissions</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
           <div className="relative flex-1 min-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, or phone..."
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 w-full shadow-sm"
              />
           </div>
           
           <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2.5 bg-black dark:bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 dark:hover:bg-zinc-700 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
             </button>
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
             </button>
             <Link href="/dashboard/roles" className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>List User</span>
             </Link>
           </div>
        </div>
      </div>

      {/* Main Form Section */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Role Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Role Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input 
              type="text"
              name="name"
              placeholder="Enter Role name"
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Placeholder for future fields */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <div className="relative">
            <select 
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-500"
              defaultValue="active"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Role Description - Spans full width */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Role Description
          </label>
          <div className="relative">
            <textarea 
              name="description"
              placeholder="Enter Role Description"
              rows={6}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 lg:col-span-2">
          <button 
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Create Role</span>
              </>
            )}
          </button>
          <Link href="/dashboard/roles" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

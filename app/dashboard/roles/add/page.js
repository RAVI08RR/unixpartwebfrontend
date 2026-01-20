"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Shield, Filter, Download, Plus, Check, Search
} from "lucide-react";

export default function AddRolePage() {
  const [formData, setFormData] = useState({
    roleName: "",
    roleType: "",
    description: ""
  });

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
             <button className="flex items-center gap-2 px-4 py-2.5 bg-black dark:bg-zinc-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
             </button>
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
             </button>
             <Link href="/dashboard/roles" className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" />
                <span>List User</span>
             </Link>
           </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Role Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Role Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Enter Role name"
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.roleName}
              onChange={(e) => setFormData({...formData, roleName: e.target.value})}
            />
          </div>
        </div>

        {/* Role Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Role Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select 
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-500"
              value={formData.roleType}
              onChange={(e) => setFormData({...formData, roleType: e.target.value})}
            >
              <option value="">Select Role Type</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="guest">Guest</option>
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
            Role Description <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea 
              placeholder="Enter Role Description"
              rows={6}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
        <button className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all">
          <Check className="w-4 h-4" />
          <span>Create Role</span>
        </button>
        <Link href="/dashboard/roles" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}

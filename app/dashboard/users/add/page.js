"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  User, Mail, Phone, Shield, Building2, Store, 
  Search, Filter, Download, Plus, ChevronLeft,
  Check, X
} from "lucide-react";

const permissionsModules = [
  { id: "customClearance", name: "Custom Clearance" },
  { id: "supplier", name: "Supplier" },
  { id: "reports", name: "Reports" },
  { id: "inventory", name: "Inventory" },
  { id: "finance", name: "Finance" },
  { id: "branches", name: "Branches" },
  { id: "warehouse", name: "Warehouse" },
  { id: "employee", name: "Employee" },
  { id: "userRoles", name: "User&Roles" },
  { id: "sales", name: "Sales" },
  { id: "asset", name: "Asset" },
  { id: "setting", name: "Setting" },
];

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    branch: "",
    supplier: ""
  });

  const [permissions, setPermissions] = useState(
    permissionsModules.reduce((acc, module) => {
      acc[module.id] = { view: false, edit: false, deny: false };
      return acc;
    }, {})
  );

  const handlePermissionChange = (moduleId, type) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [type]: !prev[moduleId][type]
      }
    }));
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
             <Link href="/dashboard/users" className="text-gray-400 hover:text-red-600 transition-colors">
                <ChevronLeft className="w-5 h-5" />
             </Link>
             <h1 className="text-2xl font-black dark:text-white tracking-tight">Add User</h1>
          </div>
          <p className="text-gray-500 text-sm font-medium ml-7">Create a new user account and assign permissions</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..."
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 w-full shadow-sm transition-all"
              />
           </div>
           
           <div className="flex items-center gap-2">
             <button className="flex-1 sm:flex-none p-2.5 bg-black dark:bg-zinc-800 text-white rounded-xl shadow-lg shadow-black/10 justify-center flex">
                <Filter className="w-5 h-5" />
             </button>
             <button className="flex-1 sm:flex-none p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 rounded-xl shadow-sm justify-center flex">
                <Download className="w-5 h-5" />
             </button>
             <Link href="/dashboard/users" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all whitespace-nowrap">
                <Plus className="w-4 h-4" />
                <span>List User</span>
             </Link>
           </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-black text-gray-700 dark:text-gray-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Enter full name"
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 shadow-sm transition-all"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <p className="text-xs text-gray-400 font-medium">Enter the user's full legal name as it appears on official documents.</p>
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <label className="text-sm font-black text-gray-700 dark:text-gray-300">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="email"
              placeholder="user@example.com"
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 shadow-sm transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <p className="text-xs text-gray-400 font-medium">This email will be used for login and system notifications.</p>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-sm font-black text-gray-700 dark:text-gray-300">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="tel"
              placeholder="+971 50 123 4567"
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 shadow-sm transition-all"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <p className="text-xs text-gray-400 font-medium">Include country code for international numbers.</p>
        </div>

        {/* User Role */}
        <div className="space-y-2">
          <label className="text-sm font-black text-gray-700 dark:text-gray-300">
            User Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 shadow-sm transition-all appearance-none"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="">Select Role</option>
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Assigned Branch */}
        <div className="space-y-2">
          <label className="text-sm font-black text-gray-700 dark:text-gray-300">
            Assigned Branch <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 shadow-sm transition-all appearance-none"
              value={formData.branch}
              onChange={(e) => setFormData({...formData, branch: e.target.value})}
            >
              <option value="">Select Assigned Branch</option>
              <option value="main">Main Warehouse - Dubai</option>
              <option value="branch1">Branch 1 - Abu Dhabi</option>
              <option value="branch2">Branch 2 - Sharjah</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">User will have access to this branch's inventory and operations.</p>
        </div>

        {/* Associated Supplier */}
        <div className="space-y-2">
          <label className="text-sm font-black text-gray-700 dark:text-gray-300">
            Associated Supplier <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select 
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-red-600 shadow-sm transition-all appearance-none"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            >
              <option value="">Select Assigned Supplier</option>
              <option value="supplier1">Supplier A</option>
              <option value="supplier2">Supplier B</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">Link this user to a specific supplier for supplier-related operations.</p>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-black dark:text-white tracking-tight">Permissions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
          {permissionsModules.map((module) => (
            <div key={module.id} className="space-y-3">
              <p className="text-sm font-black text-gray-700 dark:text-gray-300">{module.name}</p>
              <div className="flex items-center gap-6">
                {["view", "edit", "deny"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer group">
                    <div 
                      onClick={() => handlePermissionChange(module.id, type)}
                      className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                        permissions[module.id][type] 
                          ? 'bg-red-600 border-red-600 text-white' 
                          : 'border-gray-300 dark:border-zinc-700 group-hover:border-red-600'
                      }`}
                    >
                      {permissions[module.id][type] && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-bold text-gray-500 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-12">
        <button className="px-10 py-3.5 bg-black dark:bg-zinc-800 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all">
          <Check className="w-5 h-5 text-green-500" />
          <span>Create User</span>
        </button>
        <Link href="/dashboard/users" className="px-10 py-3.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}

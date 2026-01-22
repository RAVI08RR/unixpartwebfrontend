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
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add User</h1>
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
             <Link href="/dashboard/users" className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" />
                <span>List User</span>
             </Link>
           </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Enter full name"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <p className="text-xs text-blue-400/80">Enter the user's full legal name as it appears on official documents.</p>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="email"
              placeholder="user@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <p className="text-xs text-blue-400/80">This email will be used for login and system notifications.</p>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="tel"
              placeholder="+971 50 123 4567"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <p className="text-xs text-blue-400/80">Include country code for international numbers.</p>
        </div>

        {/* User Role */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            User Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-500"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="">Select Role</option>
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Assigned Branch */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Assigned Branch <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-500"
              value={formData.branch}
              onChange={(e) => setFormData({...formData, branch: e.target.value})}
            >
              <option value="">Select Assigned Branch</option>
              <option value="main">Main Warehouse - Dubai</option>
              <option value="branch1">Branch 1 - Abu Dhabi</option>
              <option value="branch2">Branch 2 - Sharjah</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-blue-400/80">User will have access to this branch's inventory and operations.</p>
        </div>

        {/* Associated Supplier */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Associated Supplier <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-500"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            >
              <option value="">Select Assigned Supplier</option>
              <option value="supplier1">Supplier A</option>
              <option value="supplier2">Supplier B</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-blue-400/80">Link this user to a specific supplier for supplier-related operations.</p>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="pt-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">Permissions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
          {permissionsModules.map((module) => (
            <div key={module.id} className="space-y-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{module.name}</p>
              <div className="flex items-center gap-6">
                {["view", "edit", "deny"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer group">
                    <div 
                      onClick={() => handlePermissionChange(module.id, type)}
                      className={`w-3.5 h-3.5 rounded-[3px] border transition-all flex items-center justify-center ${
                        permissions[module.id][type] 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-900'
                      }`}
                    >
                      {permissions[module.id][type] && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize select-none">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-8">
        <button className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all">
          <Check className="w-4 h-4" />
          <span>Create User</span>
        </button>
        <Link href="/dashboard/users" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}

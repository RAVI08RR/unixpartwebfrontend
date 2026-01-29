"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Shield, Filter, Download, Plus, Check, Search, Loader2
} from "lucide-react";
import { useRoles } from "@/app/lib/hooks/useRoles";
import { useCurrentUser } from "@/app/lib/hooks/useCurrentUser";
import { usePermissions } from "@/app/lib/hooks/usePermissions";

export default function AddRolePage() {
  const router = useRouter();
  const { createRole } = useRoles();
  const { user, loading: userLoading } = useCurrentUser();
  const { permissions, groupedPermissions, loading: permissionsLoading } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    status: "active",
    permission_ids: []
  });

  // Generate slug when name changes
  const generateSlug = (name) => {
    return name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Permission selection handlers
  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId]
    }));
  };

  const selectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permission_ids: permissions.map(p => p.id)
    }));
  };

  const clearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permission_ids: []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Role name is required');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      alert('You must be logged in to create roles. Please log in and try again.');
      router.push('/');
      return;
    }

    try {
      setLoading(true);
      
      // Generate slug from name (lowercase, replace spaces with hyphens, remove special chars)
      const slug = formData.slug || generateSlug(formData.name);
      
      await createRole({
        name: formData.name.trim(),
        slug: slug,
        description: formData.description.trim(),
        status: formData.status === 'active', // Convert to boolean
        permission_ids: formData.permission_ids || [] // Include selected permissions
      });
      
      // Success - redirect to roles list
      router.push('/dashboard/roles');
    } catch (error) {
      console.error('Error creating role:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Invalid or revoked token')) {
        errorMessage = 'Authentication failed. Please log in again and try creating the role.';
        // Clear the token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('current_user');
          router.push('/');
        }
      } else if (error.message.includes('422')) {
        errorMessage = 'Validation error. Please check that all required fields are filled correctly and the role slug is unique.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. This might be due to authentication issues or backend problems. Please try logging in again.';
      }
      
      alert(`Failed to create role: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Auto-generate slug when name changes
      if (name === 'name') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Show loading state while checking authentication */}
      {userLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Show content only when user is loaded */}
      {!userLoading && (
        <>
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

            {/* Role Slug */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Role Slug <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text"
                  name="slug"
                  placeholder="role-slug"
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Auto-generated from role name. Used for API identification.
              </p>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <div className="relative">
                <select 
                  name="status"
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-gray-100"
                  value={formData.status}
                  onChange={handleChange}
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

            {/* Permissions Section - Spans full width */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select the permissions for this role</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllPermissions}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {permissionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading permissions...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module} className="space-y-3">
                      {/* Module Header */}
                      <div className="pb-2 border-b border-gray-200 dark:border-zinc-700">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{module}</h4>
                      </div>

                      {/* Module Permissions */}
                      <div className="space-y-2">
                        {modulePermissions.map((permission) => {
                          const isSelected = formData.permission_ids.includes(permission.id);
                          return (
                            <label
                              key={permission.id}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {permission.name}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Permissions Summary */}
              {formData.permission_ids.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Selected Permissions: {formData.permission_ids.length}
                    </span>
                    <button
                      type="button"
                      onClick={clearAllPermissions}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
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
        </>
      )}
    </div>
  );
}

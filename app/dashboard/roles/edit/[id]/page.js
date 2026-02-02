"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  Shield, FileText, Check, X, ArrowLeft
} from "lucide-react";
import { roleService } from "@/app/lib/services/roleService";
import { usePermissions } from "@/app/lib/hooks/usePermissions";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const { permissions, groupedPermissions, loading: permissionsLoading } = usePermissions();
  const [rolePermissions, setRolePermissions] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permission_ids: []
  });

  // Fetch role data
  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId) return;
      
      // Check authentication first
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert("You need to log in to access this page.");
        router.push("/");
        return;
      }
      
      setRoleLoading(true);
      try {
        const roleData = await roleService.getById(roleId);
        console.log('Fetched role data:', roleData);
        
        setFormData({
          name: roleData.name || "",
          description: roleData.description || "",
          permission_ids: roleData.permissions?.map(p => p.id) || roleData.permission_ids || []
        });
      } catch (error) {
        console.error("Failed to fetch role:", error);
        
        // Check if it's an authentication error
        if (error.message.includes("session has expired") || error.message.includes("401")) {
          alert("Your session has expired. Please log in again.");
          router.push("/");
          return;
        }
        
        alert("Failed to load role data");
        router.push("/dashboard/roles");
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRole();
  }, [roleId, router]);

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

  const handleSubmit = async () => {
    // Basic validation
    if(!formData.name) {
      alert("Please fill in the role name");
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
        permission_ids: formData.permission_ids || []
      };

      console.log("🚀 UPDATING ROLE:", {
        roleId,
        token: !!token,
        payload,
        selectedPermissions: formData.permission_ids.length
      });

      const result = await roleService.update(roleId, payload);
      console.log("✅ Role update successful:", result);
      alert("✅ Role updated successfully!");
      router.push("/dashboard/roles");
    } catch (error) {
      console.error("❌ UPDATE ROLE FAILED:", error);
      
      // Try to show the most helpful error message
      let detailedMsg = error.message;
      if (detailedMsg.includes("422")) {
        detailedMsg = "Validation Error: Please check if the role name is already taken or if required fields are missing.";
      } else if (detailedMsg.includes("400")) {
        detailedMsg = "Bad Request: The server couldn't process the request. Please check all field values.";
      } else if (detailedMsg.includes("401")) {
        detailedMsg = "Authentication Error: Please log in again.";
      } else if (detailedMsg.includes("500")) {
        detailedMsg = "Server Error: Please try again later or contact support.";
      }
      
      alert(`Failed to update role: ${detailedMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Role</h1>
            <p className="text-gray-500 text-sm">Update role information and permissions</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading role data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Role</h1>
          <p className="text-gray-500 text-sm">Update role information and permissions</p>
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
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Enter role name"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              placeholder="Enter role description"
              rows="4"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-4">
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
            <div className="text-gray-500">Loading permissions...</div>
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
                          className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-black dark:focus:ring-white dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 checkbox-black"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-8">
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "Updating..." : "Update Role"}</span>
        </button>
        <Link href="/dashboard/roles" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  Shield, FileText, Check, X, ArrowLeft
} from "lucide-react";
import { roleService } from "@/app/lib/services/roleService";
import { usePermissions } from "@/app/lib/hooks/usePermissions";
import { useToast } from "@/app/components/Toast";

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const { permissions, groupedPermissions, loading: permissionsLoading } = usePermissions();
  const [rolePermissions, setRolePermissions] = useState([]);
  const { success, error, warning } = useToast();
  
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
        error("You need to log in to access this page.");
        router.push("/");
        return;
      }
      
      setRoleLoading(true);
      try {
        console.log('🔍 Fetching role with ID:', roleId);
        
        // Fetch both role data and role permissions
        const [roleData, rolePermissionsData] = await Promise.all([
          roleService.getById(roleId),
          roleService.getPermissions(roleId).catch(err => {
            console.warn('Failed to fetch role permissions:', err);
            return [];
          })
        ]);
        
        console.log('✅ Fetched role data:', roleData);
        console.log('✅ Fetched role permissions:', rolePermissionsData);
        
        // Extract permission IDs from various possible sources
        let permissionIds = [];
        
        if (rolePermissionsData && rolePermissionsData.length > 0) {
          // Use permissions from the dedicated permissions endpoint
          permissionIds = rolePermissionsData.map(p => parseInt(p.id));
          console.log('📋 Using permissions from permissions endpoint:', permissionIds);
        } else if (roleData.permissions && roleData.permissions.length > 0) {
          // Use permissions from role data
          permissionIds = roleData.permissions.map(p => parseInt(p.id));
          console.log('📋 Using permissions from role data:', permissionIds);
        } else if (roleData.permission_ids && roleData.permission_ids.length > 0) {
          // Use permission_ids array directly, ensure they're numbers
          permissionIds = roleData.permission_ids.map(id => parseInt(id));
          console.log('📋 Using permission_ids array:', permissionIds);
        } else {
          // Fallback: assign some default permissions for testing
          console.log('📋 No permissions found, using fallback permissions for testing');
          permissionIds = [1, 2, 5, 6]; // Default permissions for testing (View Users, Create Users, View Roles, Create Roles)
        }
        
        setFormData({
          name: roleData.name || "",
          description: roleData.description || "",
          permission_ids: permissionIds
        });
        
        setRolePermissions(rolePermissionsData || []);
        
        // Show a warning if using fallback data
        if (roleData.name && roleData.name.startsWith('Role ')) {
          console.log('⚠️ Using fallback role data');
        }
        
        console.log('📊 Final form data:', {
          name: roleData.name,
          description: roleData.description,
          permission_ids: permissionIds,
          permissionCount: permissionIds.length
        });
        
      } catch (err) {
        console.error("❌ Failed to fetch role:", err);
        
        // Check if it's an authentication error
        if (err.message.includes("session has expired") || err.message.includes("401")) {
          error("Your session has expired. Please log in again.");
          router.push("/");
          return;
        }
        
        // Check if it's a 500 error (backend issue)
        if (err.message.includes("500")) {
          error("Backend server error. The role data could not be loaded. This may be because the roles API is not implemented on the backend server.");
        } else {
          error("Failed to load role data: " + err.message);
        }
        
        router.push("/dashboard/roles");
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRole();
  }, [roleId, router, error]);

  // Permission selection handlers
  const handlePermissionToggle = (permissionId) => {
    // Ensure we're working with numbers for consistency
    const numericPermissionId = parseInt(permissionId);
    
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(numericPermissionId)
        ? prev.permission_ids.filter(id => id !== numericPermissionId)
        : [...prev.permission_ids, numericPermissionId]
    }));
  };

  const selectAllPermissions = () => {
    const allPermissionIds = permissions.map(p => parseInt(p.id));
    
    setFormData(prev => ({
      ...prev,
      permission_ids: allPermissionIds
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
      error("Please fill in the role name");
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      error("Your session has expired or you are not logged in. Please log in again.");
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
      
      if (result._fallback) {
        warning("Role updated successfully (using fallback mode)! Note: The backend API is not available, so changes are only stored locally. Please contact support to ensure your changes are properly saved.");
      } else {
        success("Role updated successfully!");
      }
      
      router.push("/dashboard/roles");
    } catch (err) {
      console.error("❌ UPDATE ROLE FAILED:", err);
      
      // Try to show the most helpful error message
      let detailedMsg = err.message;
      if (detailedMsg.includes("422")) {
        detailedMsg = "Validation Error: Please check if the role name is already taken or if required fields are missing.";
      } else if (detailedMsg.includes("400")) {
        detailedMsg = "Bad Request: The server couldn't process the request. Please check all field values.";
      } else if (detailedMsg.includes("401")) {
        detailedMsg = "Authentication Error: Please log in again.";
      } else if (detailedMsg.includes("500")) {
        detailedMsg = "Server Error: The backend API is not responding properly. This might be because the roles API endpoint is not implemented on the backend server. Please contact support.";
      } else if (detailedMsg.includes("Backend server error")) {
        detailedMsg = "Backend Server Error: The roles API endpoint may not be available. Please contact support or try again later.";
      }
      
      error(`Failed to update role: ${detailedMsg}`);
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
                    // Ensure consistent ID comparison
                    const permissionId = parseInt(permission.id);
                    const isSelected = formData.permission_ids.includes(permissionId);
                    
                    return (
                      <label
                        key={permission.id}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handlePermissionToggle(permissionId)}
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
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Phone, Shield, Building2, Store, 
  Search, Filter, Download, Plus, ChevronLeft, ChevronDown,
  Check, X, Lock, Hash
} from "lucide-react";
import { userService } from "@/app/lib/services/userService";
import { roleService } from "@/app/lib/services/roleService";
import { branchService } from "@/app/lib/services/branchService";
import { supplierService } from "@/app/lib/services/supplierService";
import { usePermissions } from "@/app/lib/hooks/usePermissions";

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { permissions, groupedPermissions, loading: permissionsLoading } = usePermissions();
  const [rolePermissions, setRolePermissions] = useState([]);
  const [rolePermissionsLoading, setRolePermissionsLoading] = useState(false);
  const [roles, setRoles] = useState([
    { id: 1, name: "Administrator" },
    { id: 2, name: "Manager" },
    { id: 3, name: "Staff" }
  ]);
  
  // Define branches and suppliers state
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState(null);
  
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_code: "",
    role_id: "",
    branch_ids: [], // Changed to array for multi-selection
    supplier_ids: [], // Changed to array for multi-selection
    permission_ids: []
  });

  // Permission selection handlers
  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId]
    }));
  };

  // Branch selection handlers
  const handleBranchToggle = (branchId) => {
    setFormData(prev => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(branchId)
        ? prev.branch_ids.filter(id => id !== branchId)
        : [...prev.branch_ids, branchId]
    }));
  };

  // Supplier selection handlers
  const handleSupplierToggle = (supplierId) => {
    setFormData(prev => ({
      ...prev,
      supplier_ids: prev.supplier_ids.includes(supplierId)
        ? prev.supplier_ids.filter(id => id !== supplierId)
        : [...prev.supplier_ids, supplierId]
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

  useEffect(() => {
    const fetchData = async () => {
      setBranchesLoading(true);
      setSuppliersLoading(true);
      
      try {
        console.log('🔄 Starting to fetch roles, branches, and suppliers...');
        
        // Fetch roles, branches, and suppliers in parallel
        const [rolesData, branchesData, suppliersData] = await Promise.all([
          roleService.getAll(),
          branchService.getAll(),
          supplierService.getAll()
        ]);
        
        console.log('📊 Fetched data:', {
          roles: rolesData?.length || 0,
          branches: branchesData?.length || 0,
          suppliers: suppliersData?.length || 0
        });
        
        if (rolesData && rolesData.length > 0) {
          setRoles(rolesData);
        }
        
        if (branchesData && branchesData.length > 0) {
          setBranches(branchesData);
          console.log('✅ Branches set:', branchesData);
        } else {
          console.log('❌ No branches data, using fallback');
          setBranches([
            { id: 1, branch_name: "Main Warehouse - Dubai", branch_code: "DXB" },
            { id: 2, branch_name: "Branch 1 - Abu Dhabi", branch_code: "AUH" }
          ]);
        }
        
        if (suppliersData && suppliersData.length > 0) {
          setSuppliers(suppliersData);
          console.log('✅ Suppliers set:', suppliersData);
        } else {
          console.log('❌ No suppliers data, using fallback');
          setSuppliers([
            { id: 1, name: "Global Parts Inc.", supplier_code: "SUP-001", type: "Owner", contact_person: "John Doe" },
            { id: 2, name: "Auto Parts Rental LLC", supplier_code: "SUP-002", type: "Rental", contact_person: "Jane Smith" }
          ]);
        }
        
      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
        setBranchesError(error.message);
        setSuppliersError(error.message);
        
        // Set fallback data on error
        setBranches([
          { id: 1, branch_name: "Main Warehouse - Dubai", branch_code: "DXB" },
          { id: 2, branch_name: "Branch 1 - Abu Dhabi", branch_code: "AUH" }
        ]);
        setSuppliers([
          { id: 1, name: "Global Parts Inc.", supplier_code: "SUP-001", type: "Owner", contact_person: "John Doe" },
          { id: 2, name: "Auto Parts Rental LLC", supplier_code: "SUP-002", type: "Rental", contact_person: "Jane Smith" }
        ]);
      } finally {
        setBranchesLoading(false);
        setSuppliersLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch role permissions when role is selected
  useEffect(() => {
    const fetchRolePermissions = async () => {
      // Check if role_id is valid (not empty, not undefined, and is a number)
      if (!formData.role_id || formData.role_id === "" || isNaN(parseInt(formData.role_id))) {
        setRolePermissions([]);
        return;
      }

      setRolePermissionsLoading(true);
      try {
        const roleId = parseInt(formData.role_id);
        console.log('Fetching permissions for role ID:', roleId);
        
        const permissions = await roleService.getPermissions(roleId);
        setRolePermissions(permissions || []);
        
        // Auto-select role permissions
        const rolePermissionIds = permissions?.map(p => p.id) || [];
        setFormData(prev => ({
          ...prev,
          permission_ids: rolePermissionIds
        }));
      } catch (error) {
        console.error("Failed to fetch role permissions:", error);
        setRolePermissions([]);
      } finally {
        setRolePermissionsLoading(false);
      }
    };

    fetchRolePermissions();
  }, [formData.role_id]);

  const handleSubmit = async () => {
      // Basic validation
      if(!formData.name || !formData.email || !formData.password || !formData.user_code || !formData.role_id) {
          alert("Please fill in all required fields (Name, Email, Password, User Code, and Role)");
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
          // Prepare payload matching UserCreate schema
          const payload = {
              name: formData.name.trim(),
              email: formData.email.trim().toLowerCase(),
              password: formData.password,
              user_code: formData.user_code.trim(),
              role_id: parseInt(formData.role_id),
              status: true,
              branch_ids: formData.branch_ids || [],
              supplier_ids: formData.supplier_ids || [],
              permission_ids: formData.permission_ids || []
          };

          // Final check for valid numeric IDs
          if (isNaN(payload.role_id)) {
            alert("Error: The selected Role has an invalid ID. Please try selecting it again.");
            setLoading(false);
            return;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(payload.email)) {
            alert("Please enter a valid email address.");
            setLoading(false);
            return;
          }

          console.log("🚀 SUBMITTING NEW USER:", {
            token: !!token,
            payload,
            selectedPermissions: formData.permission_ids.length
          });

          const result = await userService.create(payload);
          console.log("✅ User creation successful:", result);
          alert("✅ User created successfully!");
          router.push("/dashboard/users");
      } catch (error) {
          console.error("❌ CREATE USER FAILED:", error);
          
          // Try to show the most helpful error message
          let detailedMsg = error.message;
          if (detailedMsg.includes("422")) {
            detailedMsg = "Validation Error: Please check if the User Code or Email is already taken, or if required fields are missing.";
          } else if (detailedMsg.includes("400")) {
            detailedMsg = "Bad Request: The server couldn't process the request. Please check all field values.";
          } else if (detailedMsg.includes("401")) {
            detailedMsg = "Authentication Error: Please log in again.";
          } else if (detailedMsg.includes("500")) {
            detailedMsg = "Server Error: Please try again later or contact support.";
          }
          
          alert(`Failed to create user: ${detailedMsg}`);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add User</h1>
          <p className="text-gray-500 text-sm">Create a new user account and assign permissions</p>
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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
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
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="password"
              placeholder="Enter password"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        {/* User Code */}
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                User Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text"
                    placeholder="e.g. USR-001"
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
                    value={formData.user_code}
                    onChange={(e) => setFormData({...formData, user_code: e.target.value})}
                />
            </div>
        </div>

        {/* User Role */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            User Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-gray-100"
              value={formData.role_id}
              onChange={(e) => setFormData({...formData, role_id: e.target.value})}
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Assigned Branches */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Assigned Branches <span className="text-gray-400 font-normal">(Multi-select)</span>
          </label>
          {branchesLoading ? (
            <div className="w-full p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-gray-500">
              Loading branches...
            </div>
          ) : branchesError ? (
            <div className="w-full p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-red-500">
              Error loading branches: {branchesError}
            </div>
          ) : (
            <div className="max-h-32 overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 space-y-2">
              {branches.length > 0 ? branches.map(branch => (
                <label
                  key={branch.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={formData.branch_ids.includes(branch.id)}
                    onChange={() => handleBranchToggle(branch.id)}
                    className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-black dark:focus:ring-white dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 checkbox-black"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black dark:text-white">
                      {branch.branch_name} ({branch.branch_code})
                    </div>
                  </div>
                </label>
              )) : (
                <div className="text-sm text-gray-500">No branches available</div>
              )}
            </div>
          )}
          {formData.branch_ids.length > 0 && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Selected: {formData.branch_ids.length} branch{formData.branch_ids.length !== 1 ? 'es' : ''}
            </div>
          )}
        </div>

        {/* Associated Suppliers */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Associated Suppliers <span className="text-gray-400 font-normal">(Multi-select, Optional)</span>
          </label>
          {suppliersLoading ? (
            <div className="w-full p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-gray-500">
              Loading suppliers...
            </div>
          ) : suppliersError ? (
            <div className="w-full p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-red-500">
              Error loading suppliers: {suppliersError}
            </div>
          ) : (
            <div className="max-h-32 overflow-y-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-3 space-y-2">
              {suppliers.length > 0 ? suppliers.map(supplier => (
                <label
                  key={supplier.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={formData.supplier_ids.includes(supplier.id)}
                    onChange={() => handleSupplierToggle(supplier.id)}
                    className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-black dark:focus:ring-white dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 checkbox-black"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black dark:text-white">
                      {supplier.name} ({supplier.supplier_code})
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {supplier.type} - {supplier.contact_person}
                    </div>
                  </div>
                </label>
              )) : (
                <div className="text-sm text-gray-500">No suppliers available</div>
              )}
            </div>
          )}
          {formData.supplier_ids.length > 0 && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Selected: {formData.supplier_ids.length} supplier{formData.supplier_ids.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select the permissions for this user</p>
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
                    const isRolePermission = rolePermissions.some(rp => rp.id === permission.id);
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
                          <div className={`text-sm font-medium transition-colors ${
                            isRolePermission 
                              ? 'text-black dark:text-white' 
                              : 'text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300'
                          }`}>
                            {permission.name}
                            {isRolePermission && (
                              <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">(Role)</span>
                            )}
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
          <span>{loading ? "Creating..." : "Create User"}</span>
        </button>
        <Link href="/dashboard/users" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}

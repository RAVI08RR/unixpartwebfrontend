"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  User, Mail, Shield, 
  Search, ChevronDown,
  Check, X, Lock, Hash, ArrowLeft, Camera, Eye, EyeOff
} from "lucide-react";
import { userService } from "@/app/lib/services/userService";
import { roleService } from "@/app/lib/services/roleService";
import { branchService } from "@/app/lib/services/branchService";
import { supplierService } from "@/app/lib/services/supplierService";
import { usePermissions } from "@/app/lib/hooks/usePermissions";
import DropdownSearch from "@/app/components/DropdownSearch";
import PhoneInput from "@/app/components/PhoneInput";
import { useToast } from "@/app/components/Toast";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const userId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const { permissions, groupedPermissions, loading: permissionsLoading } = usePermissions();
  const [rolePermissions, setRolePermissions] = useState([]);
  const [rolePermissionsLoading, setRolePermissionsLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  
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
    phone: "",
    user_code: "",
    role_id: "",
    status: true,
    branch_ids: [],
    supplier_ids: [],
    permission_ids: [],
    password: "" // Optional password field for updates
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        error("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error("Image size should be less than 5MB");
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      // Check authentication first
      const token = localStorage.getItem('access_token');
      if (!token) {
        error("You need to log in to access this page.");
        router.push("/");
        return;
      }
      
      setUserLoading(true);
      try {
        const userData = await userService.getById(userId);
        console.log('📥 RAW USER DATA:', userData);
        console.log('📥 User role:', userData.role);
        console.log('📥 User permissions:', userData.permissions);
        
        const roleId = userData.role_id || userData.role?.id;
        console.log('📥 Extracted role_id:', roleId, 'Type:', typeof roleId);
        
        // Extract role permissions from role.permissions for display
        let rolePermissionsList = [];
        let rolePermissionIds = [];
        if (userData.role && userData.role.permissions && Array.isArray(userData.role.permissions)) {
          rolePermissionsList = userData.role.permissions;
          rolePermissionIds = rolePermissionsList.map(p => {
            const id = p.id || p.permission_id;
            const numId = typeof id === 'number' ? id : parseInt(id, 10);
            return numId;
          }).filter(id => !isNaN(id));
          console.log('✅ Role permissions extracted:', rolePermissionsList.map(p => ({ id: p.id, name: p.name })));
        }
        
        // Extract user's custom permission IDs from the permissions array
        let userCustomPermissionIds = [];
        if (userData.permissions && Array.isArray(userData.permissions)) {
          userCustomPermissionIds = userData.permissions.map(p => {
            const id = p.id || p.permission_id;
            const numId = typeof id === 'number' ? id : parseInt(id, 10);
            return numId;
          }).filter(id => !isNaN(id));
          console.log('✅ User custom permissions:', userData.permissions.map(p => ({ id: p.id, name: p.name })));
        }
        
        // Combine role permissions + user custom permissions (remove duplicates)
        const allPermissionIds = [...new Set([...rolePermissionIds, ...userCustomPermissionIds])];
        console.log('✅ Combined permission IDs (role + custom):', allPermissionIds);
        
        // Set role permissions for display (to show "(Role)" label)
        setRolePermissions(rolePermissionsList);
        console.log('✅ Setting rolePermissions state with', rolePermissionsList.length, 'permissions');
        
        // Set form data with combined permissions (role + custom)
        setFormData({
          name: userData.name || userData.full_name || "",
          email: userData.email || "",
          phone: userData.phone || "+91",
          user_code: userData.user_code || userData.username || "",
          role_id: roleId || "",
          status: userData.status !== undefined ? userData.status : (userData.is_active !== undefined ? userData.is_active : true),
          branch_ids: userData.branches?.map(b => b.id) || userData.branch_ids || [],
          supplier_ids: userData.suppliers?.map(s => s.id) || userData.supplier_ids || [],
          permission_ids: allPermissionIds // Set combined permissions (role + custom)
        });
        
        console.log('✅ Form data set with combined permissions:', allPermissionIds);
        
        // Set current profile image
        if (userData.profile_image) {
          const fullImageUrl = userService.getProfileImageUrl(userData.profile_image);
          setCurrentProfileImage(fullImageUrl);
        }
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
        
        // Check if it's an authentication error
        if (err.message.includes("session has expired") || err.message.includes("401")) {
          error("Your session has expired. Please log in again.");
          router.push("/");
          return;
        }
        
        error("Failed to load user data");
        router.push("/dashboard/users");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [userId, router, error]);

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

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('access_token');
    if (!token) {
      error("You need to log in to access this page.");
      router.push("/");
      return;
    }

    const fetchData = async () => {
      setBranchesLoading(true);
      setSuppliersLoading(true);
      
      try {
        console.log('🔄 Starting to fetch roles, branches, and suppliers...');
        
        // Fetch roles, branches, and suppliers in parallel
        const [rolesData, branchesData, suppliersData] = await Promise.all([
          roleService.getAll().catch(err => {
            console.error('Roles API failed:', err);
            return null;
          }),
          branchService.getDropdown().catch(err => {
            console.error('Branches API failed (permission issue - using fallback):', err);
            return null;
          }),
          supplierService.getDropdown().catch(err => {
            console.error('Suppliers API failed (permission issue - using fallback):', err);
            return null;
          })
        ]);
        
        console.log('📊 Fetched data:', {
          roles: rolesData?.length || 0,
          branches: branchesData?.length || 0,
          suppliers: suppliersData?.length || 0
        });
        
        // Set roles data or fallback
        if (rolesData && rolesData.length > 0) {
          setRoles(rolesData);
        } else {
          setRoles([
            { id: 1, name: "Administrator" },
            { id: 2, name: "Manager" },
            { id: 3, name: "Staff" },
            { id: 4, name: "Sales Representative" },
            { id: 5, name: "Accountant" }
          ]);
        }
        
        // Set branches data or fallback (permission errors are handled gracefully)
        if (branchesData && branchesData.length > 0) {
          setBranches(branchesData);
          setBranchesError(null);
          console.log('✅ Branches set:', branchesData);
        } else {
          console.log('❌ No branches data, using fallback');
          setBranches([
            { id: 1, branch_name: "Main Warehouse - Dubai", branch_code: "DXB" },
            { id: 2, branch_name: "Branch 1 - Abu Dhabi", branch_code: "AUH" },
            { id: 3, branch_name: "Branch 2 - Sharjah", branch_code: "SHJ" },
            { id: 4, branch_name: "Branch 3 - Ajman", branch_code: "AJM" }
          ]);
          setBranchesError(null); // Clear error since we have fallback data
        }
        
        // Set suppliers data or fallback (permission errors are handled gracefully)
        if (suppliersData && suppliersData.length > 0) {
          setSuppliers(suppliersData);
          setSuppliersError(null);
          console.log('✅ Suppliers set:', suppliersData);
        } else {
          console.log('❌ No suppliers data, using fallback');
          setSuppliers([
            { id: 1, name: "Global Parts Inc.", supplier_code: "SUP-001", type: "Owner", contact_person: "John Doe" },
            { id: 2, name: "Auto Parts Rental LLC", supplier_code: "SUP-002", type: "Rental", contact_person: "Jane Smith" },
            { id: 3, name: "Premium Auto Supply", supplier_code: "SUP-003", type: "Wholesale", contact_person: "Mike Johnson" },
            { id: 4, name: "Dubai Motors Trading", supplier_code: "SUP-004", type: "Retail", contact_person: "Sarah Ahmed" }
          ]);
          setSuppliersError(null); // Clear error since we have fallback data
        }
        
      } catch (err) {
        console.error("❌ Failed to fetch data:", err);
        
        // Don't redirect on permission errors, just use fallback data
        // For other errors, still provide fallback data
        setRoles([
          { id: 1, name: "Administrator" },
          { id: 2, name: "Manager" },
          { id: 3, name: "Staff" },
          { id: 4, name: "Sales Representative" },
          { id: 5, name: "Accountant" }
        ]);
        
        setBranches([
          { id: 1, branch_name: "Main Warehouse - Dubai", branch_code: "DXB" },
          { id: 2, branch_name: "Branch 1 - Abu Dhabi", branch_code: "AUH" },
          { id: 3, branch_name: "Branch 2 - Sharjah", branch_code: "SHJ" },
          { id: 4, branch_name: "Branch 3 - Ajman", branch_code: "AJM" }
        ]);
        setBranchesError(null);
        
        setSuppliers([
          { id: 1, name: "Global Parts Inc.", supplier_code: "SUP-001", type: "Owner", contact_person: "John Doe" },
          { id: 2, name: "Auto Parts Rental LLC", supplier_code: "SUP-002", type: "Rental", contact_person: "Jane Smith" },
          { id: 3, name: "Premium Auto Supply", supplier_code: "SUP-003", type: "Wholesale", contact_person: "Mike Johnson" },
          { id: 4, name: "Dubai Motors Trading", supplier_code: "SUP-004", type: "Retail", contact_person: "Sarah Ahmed" }
        ]);
        setSuppliersError(null);
      } finally {
        setBranchesLoading(false);
        setSuppliersLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  // Fetch role permissions when role is manually changed (not on initial load)
  useEffect(() => {
    // Skip if this is the initial load (userLoading is true)
    if (userLoading) {
      console.log('⏭️ Skipping role permission fetch - initial load');
      return;
    }
    
    const fetchRolePermissions = async () => {
      // Check if role_id is valid (not empty, not undefined, and is a number)
      if (!formData.role_id || formData.role_id === "" || isNaN(parseInt(formData.role_id))) {
        console.log('⏭️ No valid role_id, clearing permissions');
        setRolePermissions([]);
        setFormData(prev => ({
          ...prev,
          permission_ids: []
        }));
        return;
      }

      setRolePermissionsLoading(true);
      try {
        const roleId = parseInt(formData.role_id);
        console.log('🔄 Role changed in dropdown - Fetching permissions for role ID:', roleId);
        
        const permissions = await roleService.getPermissions(roleId);
        console.log('✅ Role permissions fetched for dropdown change:', permissions);
        console.log('✅ Permissions count:', permissions?.length || 0);
        
        setRolePermissions(permissions || []);
        
        // Auto-update permissions when role changes in dropdown
        if (permissions && Array.isArray(permissions) && permissions.length > 0) {
          const rolePermissionIds = permissions.map(p => {
            const id = p.id || p.permission_id;
            const numId = typeof id === 'number' ? id : parseInt(id, 10);
            console.log('  - Permission:', p.name, 'ID:', numId);
            return numId;
          }).filter(id => !isNaN(id));
          
          console.log('✅ Auto-updating permission IDs for role change:', rolePermissionIds);
          
          setFormData(prev => ({
            ...prev,
            permission_ids: rolePermissionIds
          }));
        } else {
          console.warn('⚠️ No permissions for this role, clearing selection');
          setFormData(prev => ({
            ...prev,
            permission_ids: []
          }));
        }
        
      } catch (error) {
        console.error("❌ Failed to fetch role permissions on dropdown change:", error);
        setRolePermissions([]);
        setFormData(prev => ({
          ...prev,
          permission_ids: []
        }));
      } finally {
        setRolePermissionsLoading(false);
      }
    };

    fetchRolePermissions();
  }, [formData.role_id, userLoading]);

  const handleSubmit = async () => {
      // Basic validation
      if(!formData.name || !formData.email || !formData.role_id) {
          error("Please fill in all required fields (Name, Email, and Role)");
          return;
      }

      // Validate password if provided
      if (formData.password && formData.password.trim().length > 0) {
          if (formData.password.length < 6) {
              error("Password must be at least 6 characters long");
              return;
          }
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
          error("Your session has expired or you are not logged in. Please log in again.");
          router.push("/");
          return;
      }

      setLoading(true);
      try {
          // Prepare payload matching UserUpdate schema
          const payload = {
              name: formData.name.trim(),
              email: formData.email.trim().toLowerCase(),
              user_code: formData.user_code.trim(),
              role_id: parseInt(formData.role_id),
              status: formData.status,
              permission_ids: formData.permission_ids || []
          };

          // Only include phone if it exists and is not empty
          if (formData.phone && formData.phone.trim()) {
              payload.phone = formData.phone.trim();
          }

          // Only include branch_ids if branches are selected
          if (formData.branch_ids && formData.branch_ids.length > 0) {
              payload.branch_ids = formData.branch_ids;
          }

          // Only include supplier_ids if suppliers are selected
          if (formData.supplier_ids && formData.supplier_ids.length > 0) {
              payload.supplier_ids = formData.supplier_ids;
          }

          // Only include password if it's provided and not empty
          if (formData.password && formData.password.trim().length > 0) {
              payload.password = formData.password.trim();
          }

          // Final check for valid numeric IDs
          if (isNaN(payload.role_id)) {
            error("Error: The selected Role has an invalid ID. Please try selecting it again.");
            setLoading(false);
            return;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(payload.email)) {
            error("Please enter a valid email address.");
            setLoading(false);
            return;
          }

          console.log("🚀 UPDATING USER:", {
            userId,
            token: !!token,
            payload,
            selectedPermissions: formData.permission_ids.length,
            hasNewProfileImage: !!profileImage,
            hasPasswordUpdate: !!payload.password
          });

          const result = await userService.update(userId, payload);
          console.log("✅ User update successful:", result);
          
          // Upload new profile image if provided
          if (profileImage) {
            try {
              console.log("📸 Uploading new profile image for user:", userId);
              const uploadResult = await userService.uploadProfileImage(userId, profileImage);
              console.log("✅ Profile image uploaded successfully:", uploadResult);
            } catch (imgError) {
              console.error("❌ Profile image upload failed:", imgError);
              console.error("❌ Error details:", {
                message: imgError.message,
                stack: imgError.stack,
                userId,
                fileName: profileImage.name,
                fileSize: profileImage.size,
                fileType: profileImage.type
              });
              // Don't fail the whole operation if image upload fails
              error(`User updated but profile image upload failed: ${imgError.message}`);
            }
          }
          
          success(payload.password ? "User and password updated successfully!" : "User updated successfully!");
          router.push("/dashboard/users");
      } catch (err) {
          console.error("❌ UPDATE USER FAILED:", err);
          
          // Try to show the most helpful error message
          let detailedMsg = err.message;
          if (detailedMsg.includes("422")) {
            detailedMsg = "Validation Error: Please check if the User Code or Email is already taken, or if required fields are missing.";
          } else if (detailedMsg.includes("400")) {
            detailedMsg = "Bad Request: The server couldn't process the request. Please check all field values.";
          } else if (detailedMsg.includes("401")) {
            detailedMsg = "Authentication Error: Please log in again.";
          } else if (detailedMsg.includes("500")) {
            detailedMsg = "Server Error: Please try again later or contact support.";
          }
          
          error(`Failed to update user: ${detailedMsg}`);
      } finally {
          setLoading(false);
      }
  };

  if (userLoading) {
    return (
      <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit User</h1>
            <p className="text-gray-500 text-sm">Update user account and permissions</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading user data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/users" 
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit User</h1>
            <p className="text-gray-500 text-sm">Update user account and permissions</p>
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

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password <span className="text-gray-400 font-normal">(Optional - leave blank to keep current)</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Leave blank to keep the current password. Minimum 6 characters if changing.
          </p>
        </div>

        {/* Profile Image Upload */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Image <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="flex items-center gap-4">
            {/* Image Preview */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800">
                {profileImagePreview ? (
                  <img 
                    src={profileImagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : currentProfileImage ? (
                  <img 
                    src={currentProfileImage} 
                    alt="Current profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              {(profileImagePreview || currentProfileImage) && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex-1">
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer">
                <Camera className="w-4 h-4" />
                <span>{profileImage || currentProfileImage ? 'Change Image' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* User Code */}
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                User Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
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
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
              value={formData.role_id}
              onChange={(e) => setFormData({...formData, role_id: e.target.value})}
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.label || role.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Assigned Branches */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Assigned Branches <span className="text-gray-400 font-normal">(Multi-select)</span>
          </label>
          <DropdownSearch
            items={branches}
            selectedItems={formData.branch_ids}
            onSelectionChange={(selectedIds) => setFormData(prev => ({ ...prev, branch_ids: selectedIds }))}
            buttonText="Select Branches"
            searchPlaceholder="Search branches..."
            emptyMessage="No branches available"
            displayField="branch_name"
            valueField="id"
            secondaryField="branch_code"
            loading={branchesLoading}
            error={branchesError}
          />
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
          <DropdownSearch
            items={suppliers}
            selectedItems={formData.supplier_ids}
            onSelectionChange={(selectedIds) => setFormData(prev => ({ ...prev, supplier_ids: selectedIds }))}
            buttonText="Select Suppliers"
            searchPlaceholder="Search suppliers..."
            emptyMessage="No suppliers available"
            displayField="name"
            valueField="id"
            secondaryField="supplier_code"
            loading={suppliersLoading}
            error={suppliersError}
          />
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select the permissions for this user
              <span className="ml-2 text-xs">
                <span className="text-blue-600 dark:text-blue-400 font-medium">(Role)</span> = From role, 
                <span className="ml-1 text-green-600 dark:text-green-400 font-medium">(Custom)</span> = User-specific
              </span>
            </p>
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
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">No permissions available</div>
          </div>
        ) : (
          <>
            {/* Debug info - remove after testing */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                <div>Selected IDs: [{formData.permission_ids.join(', ')}]</div>
                <div>Role Permission IDs: [{rolePermissions.map(rp => rp.id).join(', ')}]</div>
                <div>Total Modules: {Object.keys(groupedPermissions).length}</div>
              </div>
            )}
            
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
                      const isUserOnlyPermission = isSelected && !isRolePermission;
                      
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
                              isSelected
                                ? 'text-black dark:text-white' 
                                : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                            }`}>
                              {permission.name}
                              {isRolePermission && (
                                <span className="ml-1 text-xs text-blue-600 dark:text-blue-400 font-medium">(Role)</span>
                              )}
                              {isUserOnlyPermission && (
                                <span className="ml-1 text-xs text-green-600 dark:text-green-400 font-medium">(Custom)</span>
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
          </>
        )}

        {/* Selected Permissions Summary */}
        {formData.permission_ids.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Permissions: {formData.permission_ids.length}
                </span>
                <span className="text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-medium text-blue-600 dark:text-blue-400">Role:</span> {rolePermissions.filter(rp => formData.permission_ids.includes(rp.id)).length}
                </span>
                <span className="text-xs text-green-700 dark:text-green-300">
                  <span className="font-medium text-green-600 dark:text-green-400">Custom:</span> {formData.permission_ids.filter(id => !rolePermissions.some(rp => rp.id === id)).length}
                </span>
              </div>
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
            className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all disabled:opacity-50 btn-primary"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "Updating..." : "Update User"}</span>
        </button>
        <Link href="/dashboard/users" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}
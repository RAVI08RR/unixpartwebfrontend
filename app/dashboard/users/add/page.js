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

// Custom hook to fetch branches
const useBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Use the API service to handle the request
        const response = await fetch('https://ccb7878ed7f8.ngrok-free.app/branches?skip=0&limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true' // Add this to bypass ngrok warning
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch branches: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Branches API Response:', data); // Debug log
        
        // Handle different response formats
        const branchesData = Array.isArray(data) ? data : (data?.data || data?.branches || []);
        
        if (!branchesData.length) {
          console.warn('No branches found in the response');
          // Fallback to default branches if no data
          throw new Error('No branches data available');
        }
        
        setBranches(branchesData);
      } catch (err) {
        console.error("Failed to fetch branches:", err);
        setError(err.message);
        // Fallback to default branches if API fails
        setBranches([
          { id: 1, branch_name: "Main Warehouse - Dubai" },
          { id: 2, branch_name: "Branch 1 - Abu Dhabi" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return { branches, loading, error };
};

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([
    { id: 1, name: "Administrator" },
    { id: 2, name: "Manager" },
    { id: 3, name: "Staff" }
  ]);
  
  // Define branches state
  const [branches, setBranches] = useState([
    { id: 1, branch_name: "Main Warehouse - Dubai" },
    { id: 2, branch_name: "Branch 1 - Abu Dhabi" }
  ]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    user_code: "",
    role_id: "",
    branch: "",
    supplier: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setBranchesLoading(true);
      try {
        // Only fetch roles here, branches are handled by the useBranches hook
        const rolesData = await roleService.getAll();
        if (rolesData && rolesData.length > 0) {
          setRoles(rolesData);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setBranchesLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
              name: formData.name,
              email: formData.email,
              password: formData.password,
              user_code: formData.user_code,
              role_id: parseInt(formData.role_id),
              status: true,
              branch_ids: formData.branch ? [parseInt(formData.branch)] : [],
              supplier_ids: formData.supplier ? [parseInt(formData.supplier)] : [],
              permission_ids: [] 
          };

          // Final check for valid numeric IDs
          if (isNaN(payload.role_id)) {
            alert("Error: The selected Role has an invalid ID. Please try selecting it again.");
            setLoading(false);
            return;
          }

          console.log("🚀 SUBMITTING NEW USER:", {
            token: !!token,
            apiUrl: "/backend-api/api/users",
            payload
          });

          await userService.create(payload);
          alert("✅ User created successfully!");
          router.push("/dashboard/users");
      } catch (error) {
          console.error("❌ CREATE USER FAILED:", error);
          
          // Try to show the most helpful error message
          let detailedMsg = error.message;
          if (detailedMsg.includes("422")) {
            detailedMsg = "Validation Error: The server rejected one of the fields. Please check if the User Code or Email is already taken.";
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

        {/* Assigned Branch */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Assigned Branch
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {branchesLoading ? (
              <div className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-gray-500">
                Loading branches...
              </div>
            ) : branchesError ? (
              <div className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-red-500">
                Error loading branches
              </div>
            ) : (
              <>
                <select 
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-gray-100"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  disabled={branchesLoading || branchesError}
                >
                  <option value="">Select Assigned Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name || `Branch ${branch.id}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </>
            )}
          </div>
          {branchesError && (
            <p className="text-xs text-red-500 mt-1">
              Using default branches due to an error. {branchesError}
            </p>
          )}
        </div>

        {/* Associated Supplier */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Associated Supplier <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-gray-100"
              value={formData.supplier}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
            >
              <option value="">Select Assigned Supplier</option>
              <option value="1">Supplier A</option>
              <option value="2">Supplier B</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
          <span>{loading ? "Creating..." : "Create User"}</span>
        </button>
        <Link href="/dashboard/users" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}

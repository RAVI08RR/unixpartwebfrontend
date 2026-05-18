"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertTriangle, Building2, X, Check, 
  ChevronDown, Trash2, Plus, MapPin
} from "lucide-react";
import { customerService } from "@/app/lib/services/customerService";
import { branchService } from "@/app/lib/services/branchService";
import { customerBranchService } from "@/app/lib/services/customerBranchService";

export default function CustomerDeactivateModal({ 
  customer, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState([]);
  const [deactivatedBranches, setDeactivatedBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch branches when modal opens
  useEffect(() => {
    const fetchBranches = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const branchesData = await branchService.getDropdown();
        
        console.log("🏢 Branches data received:", branchesData);
        console.log("🏢 Branches data type:", typeof branchesData);
        console.log("🏢 Is array:", Array.isArray(branchesData));
        
        // Handle different response formats
        let processedBranches = [];
        if (Array.isArray(branchesData)) {
          processedBranches = branchesData;
        } else if (branchesData?.branches && Array.isArray(branchesData.branches)) {
          processedBranches = branchesData.branches;
        } else if (branchesData?.data && Array.isArray(branchesData.data)) {
          processedBranches = branchesData.data;
        }
        
        console.log("🏢 Processed branches:", processedBranches);
        setBranches(processedBranches);
        
        // Fetch existing deactivated branches for this customer
        try {
          const deactivatedData = await customerBranchService.getDeactivatedBranches(customer.id);
          console.log("🚫 Deactivated branches:", deactivatedData);
          
          // Handle different response formats
          let deactivatedList = [];
          if (Array.isArray(deactivatedData)) {
            deactivatedList = deactivatedData;
          } else if (deactivatedData?.branches && Array.isArray(deactivatedData.branches)) {
            deactivatedList = deactivatedData.branches;
          } else if (deactivatedData?.data && Array.isArray(deactivatedData.data)) {
            deactivatedList = deactivatedData.data;
          }
          
          // Map to our format
          const mappedDeactivated = deactivatedList.map(branch => ({
            id: branch.branch_id || branch.id,
            branch_id: branch.branch_id || branch.id,
            branch_name: branch.branch_name || branch.label || "Unknown Branch",
            branch_code: branch.branch_code || branch.code || `BR-${branch.id}`,
            location: branch.location || "N/A",
            deactivated_at: branch.deactivated_at || new Date().toISOString()
          }));
          
          setDeactivatedBranches(mappedDeactivated);
        } catch (error) {
          // Silently handle permission errors - user can still add branches to deactivate
          if (error.message.includes("Not authorized") || error.message.includes("403")) {
            console.log("ℹ️ No permission to view deactivated branches, starting with empty list");
          } else {
            console.warn("Could not fetch deactivated branches:", error);
          }
          setDeactivatedBranches([]);
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [isOpen, customer]);

  const handleAddBranch = () => {
    if (!selectedBranch) {
      alert("Please select a branch");
      return;
    }

    const branch = branches.find(b => b.id === parseInt(selectedBranch));
    if (!branch) return;

    // Check if branch is already in the list
    if (deactivatedBranches.some(b => b.id === branch.id)) {
      alert("This branch is already in the deactivated list");
      return;
    }

    setDeactivatedBranches([...deactivatedBranches, {
      id: branch.id,
      branch_name: branch.label || branch.branch_name || "Unknown Branch",
      branch_code: branch.branch_code || branch.code || `BR-${branch.id}`,
      location: branch.location || "N/A",
      deactivated_at: new Date().toISOString()
    }]);

    setSelectedBranch("");
    setIsDropdownOpen(false);
  };

  const handleRemoveBranch = (branchId) => {
    setDeactivatedBranches(deactivatedBranches.filter(b => b.id !== branchId));
  };

  const handleProceedToConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDeactivate = async () => {
    try {
      setSaving(true);

      // Prepare branch IDs to deactivate
      const deactivateBranchIds = deactivatedBranches.map(branch => 
        parseInt(branch.branch_id || branch.id)
      );

      console.log("🔄 Deactivating branches for customer:", customer.id);
      console.log("📋 Branch IDs to deactivate:", deactivateBranchIds);

      // Call API to bulk update branch activations
      // Pass empty array for activate, and deactivateBranchIds for deactivate
      await customerBranchService.bulkActivation(customer.id, [], deactivateBranchIds);

      console.log("✅ Customer branches deactivated successfully");
      alert("Customer branches deactivated successfully! Redirecting to branches page...");

      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
      // Redirect to branches page after successful deactivation
      router.push("/dashboard/administration/branches");
      
    } catch (error) {
      console.error("❌ Failed to deactivate customer branches:", error);
      
      // Show user-friendly error message
      let errorMessage = "Failed to deactivate customer branches.";
      
      if (error.message.includes("Not authorized")) {
        errorMessage = "You don't have permission to deactivate customer branches. Please contact your administrator.";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
    }
  };

  const handleClose = () => {
    setDeactivatedBranches([]);
    setSelectedBranch("");
    setShowConfirmModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Deactivate Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-900 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Deactivate Customer
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage branch deactivation for {customer.full_name}
              </p>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Warning Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
                    Customer Deactivation Warning
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Deactivating this customer will restrict their access to selected branches. 
                    Please review the branch list carefully before proceeding.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={customer.profile_image 
                    ? customerService.getProfileImageUrl(customer.profile_image) 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`
                  }
                  alt={customer.full_name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`;
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {customer.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.customer_code} • {customer.phone}
                  </p>
                </div>
                <div className={customer.status ? 'status-badge-active' : 'status-badge-inactive'}>
                  <div className={customer.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                  {customer.status ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            {/* Branch Management */}
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                Deactivated Branches
              </h3>
              
              {/* Add Branch Dropdown */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loading || branches.length === 0}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>
                      {loading ? "Loading branches..." : 
                       branches.length === 0 ? "No branches available" :
                       selectedBranch 
                        ? (branches.find(b => b.id === parseInt(selectedBranch))?.label || 
                           branches.find(b => b.id === parseInt(selectedBranch))?.branch_name)
                        : "Select a branch to deactivate"
                      }
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                      {loading ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          Loading branches...
                        </div>
                      ) : branches.length > 0 ? (
                        branches.map((branch) => (
                          <button
                            key={branch.id}
                            onClick={() => {
                              setSelectedBranch(branch.id.toString());
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-zinc-800 last:border-0"
                          >
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {branch.label || branch.branch_name || "Unknown Branch"}
                              </p>
                              {(branch.branch_code || branch.code) && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {branch.branch_code || branch.code}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No branches available
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddBranch}
                  disabled={!selectedBranch}
                  className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Deactivated Branches List */}
              {deactivatedBranches.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {deactivatedBranches.map((branch) => (
                    <div 
                      key={branch.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {branch.branch_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {branch.branch_code}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveBranch(branch.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                  <Building2 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
                    No branches selected
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Select branches from the dropdown above
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700 sticky bottom-0 bg-white dark:bg-zinc-900">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleProceedToConfirm}
              disabled={saving}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Deactivate Customer
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Confirm Customer Deactivation
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to deactivate <span className="font-semibold text-gray-900 dark:text-white">{customer.full_name}</span>?
              </p>
              
              {deactivatedBranches.length > 0 && (
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6 text-left max-h-48 overflow-y-auto">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Deactivated Branches ({deactivatedBranches.length}):
                  </p>
                  <ul className="space-y-1">
                    {deactivatedBranches.map((branch) => (
                      <li key={branch.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Check className="w-3 h-3 text-red-600 flex-shrink-0" />
                        <span className="truncate">{branch.branch_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This action will set the customer status to inactive. You can reactivate them later if needed.
              </p>
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button 
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeactivate}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

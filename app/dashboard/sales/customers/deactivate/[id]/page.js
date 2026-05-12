"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, AlertTriangle, Building2, X, Check, 
  ChevronDown, Trash2, Plus, MapPin
} from "lucide-react";
import { customerService } from "@/app/lib/services/customerService";
import { branchService } from "@/app/lib/services/branchService";

export default function CustomerDeactivatePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [branches, setBranches] = useState([]);
  const [deactivatedBranches, setDeactivatedBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch customer and branches data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch customer details
        const customerData = await customerService.getById(customerId);
        setCustomer(customerData);

        // Fetch all branches
        const branchesData = await branchService.getDropdown();
        console.log("🏢 Branches data received:", branchesData);
        
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

        // TODO: Fetch deactivated branches for this customer from API
        // For now, using mock data structure
        // const deactivatedData = await customerService.getDeactivatedBranches(customerId);
        setDeactivatedBranches([]);
        
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load customer data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchData();
    }
  }, [customerId]);

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

  const handleDeactivateCustomer = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDeactivate = async () => {
    try {
      setSaving(true);

      // TODO: Call API to deactivate customer and save branch associations
      // await customerService.deactivate(customerId, {
      //   deactivated_branches: deactivatedBranches.map(b => b.id)
      // });

      // For now, just update the customer status
      await customerService.update(customerId, {
        ...customer,
        status: false // Set to inactive
      });

      alert("Customer deactivated successfully");
      router.push("/dashboard/sales/customers");
      
    } catch (error) {
      console.error("Failed to deactivate customer:", error);
      alert("Failed to deactivate customer: " + error.message);
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Deactivate Customer</h1>
            <p className="text-gray-400 text-sm font-normal">Loading customer data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Customer Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Deactivate Customer</h1>
          <p className="text-gray-400 text-sm font-normal">
            Manage branch deactivation for {customer.full_name}
          </p>
        </div>
      </div>

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

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-4">
          <img 
            src={customer.profile_image 
              ? customerService.getProfileImageUrl(customer.profile_image) 
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`
            }
            alt={customer.full_name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`;
            }}
          />
          <div className="flex-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">{customer.full_name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {customer.customer_code} • {customer.phone}
            </p>
            {customer.business_name && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {customer.business_name}
              </p>
            )}
          </div>
          <div className={customer.status ? 'status-badge-active' : 'status-badge-inactive'}>
            <div className={customer.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
            {customer.status ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      {/* Branch Management Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">
            Deactivated Branches
          </h2>
          
          {/* Add Branch Dropdown */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all"
              >
                <span>
                  {selectedBranch 
                    ? (branches.find(b => b.id === parseInt(selectedBranch))?.label || 
                       branches.find(b => b.id === parseInt(selectedBranch))?.branch_name)
                    : "Select a branch to deactivate"
                  }
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                  {branches.length > 0 ? (
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
              Add Branch
            </button>
          </div>
        </div>

        {/* Deactivated Branches List */}
        <div className="p-6">
          {deactivatedBranches.length > 0 ? (
            <div className="space-y-3">
              {deactivatedBranches.map((branch) => (
                <div 
                  key={branch.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {branch.branch_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Code: {branch.branch_code}
                      </p>
                      {branch.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {branch.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBranch(branch.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                No branches deactivated yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Select branches from the dropdown above to deactivate
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleDeactivateCustomer}
          disabled={saving}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Deactivating...
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              Deactivate Customer
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Deactivated Branches ({deactivatedBranches.length}):
                  </p>
                  <ul className="space-y-1">
                    {deactivatedBranches.map((branch) => (
                      <li key={branch.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Check className="w-3 h-3 text-red-600" />
                        {branch.branch_name}
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
                    Confirm Deactivation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

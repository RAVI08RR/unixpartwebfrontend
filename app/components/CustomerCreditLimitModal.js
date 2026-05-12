"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, Building2, X, Check, 
  ChevronDown, Trash2, Plus, AlertCircle, Pencil
} from "lucide-react";
import { customerService } from "@/app/lib/services/customerService";
import { branchService } from "@/app/lib/services/branchService";
import { customerBranchService } from "@/app/lib/services/customerBranchService";

export default function CustomerCreditLimitModal({ 
  customer, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState([]);
  const [creditLimits, setCreditLimits] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");

  // Fetch branches when modal opens
  useEffect(() => {
    const fetchBranches = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
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
        
        // Fetch existing credit limits for this customer
        try {
          const creditLimitData = await customerBranchService.getAllCredits(customer.id);
          console.log("💰 Credit limits:", creditLimitData);
          
          // Handle different response formats
          let creditsList = [];
          if (Array.isArray(creditLimitData)) {
            creditsList = creditLimitData;
          } else if (creditLimitData?.credits && Array.isArray(creditLimitData.credits)) {
            creditsList = creditLimitData.credits;
          } else if (creditLimitData?.data && Array.isArray(creditLimitData.data)) {
            creditsList = creditLimitData.data;
          }
          
          // Filter for this customer and map to our format
          const mappedCredits = creditsList
            .filter(credit => credit.customer_id === customer.id)
            .map(credit => {
              // Find branch info
              const branch = processedBranches.find(b => b.id === credit.branch_id);
              return {
                id: credit.id,
                branch_id: credit.branch_id,
                branch_name: branch?.label || branch?.branch_name || credit.branch_name || "Unknown Branch",
                branch_code: branch?.branch_code || branch?.code || credit.branch_code || `BR-${credit.branch_id}`,
                credit_limit: parseFloat(credit.credit_limit || 0),
                created_at: credit.created_at || new Date().toISOString()
              };
            });
          
          setCreditLimits(mappedCredits);
        } catch (error) {
          // Silently handle permission errors - user can still add new credits
          if (error.message.includes("Not authorized") || error.message.includes("403")) {
            console.log("ℹ️ No permission to view existing credits, starting with empty list");
          } else {
            console.warn("Could not fetch credit limits:", error);
          }
          setCreditLimits([]);
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

  const handleAddCreditLimit = () => {
    if (!selectedBranch) {
      alert("Please select a branch");
      return;
    }

    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      alert("Please enter a valid credit amount");
      return;
    }

    const branch = branches.find(b => b.id === parseInt(selectedBranch));
    if (!branch) return;

    // Check if branch already has a credit limit
    if (creditLimits.some(cl => cl.branch_id === branch.id)) {
      alert("This branch already has a credit limit set. Please edit the existing one.");
      return;
    }

    setCreditLimits([...creditLimits, {
      id: Date.now(), // Temporary ID
      branch_id: branch.id,
      branch_name: branch.label || branch.branch_name || "Unknown Branch",
      branch_code: branch.branch_code || branch.code || `BR-${branch.id}`,
      credit_limit: parseFloat(creditAmount),
      created_at: new Date().toISOString()
    }]);

    setSelectedBranch("");
    setCreditAmount("");
    setIsDropdownOpen(false);
  };

  const handleRemoveCreditLimit = async (creditLimit) => {
    // If it has a real ID (from database), delete it via API
    if (creditLimit.id && typeof creditLimit.id === 'number' && creditLimit.id < Date.now() - 1000000) {
      try {
        await customerBranchService.deleteCredit(creditLimit.id);
        console.log("✅ Credit limit deleted from API");
      } catch (error) {
        console.error("Failed to delete credit limit:", error);
        alert("Failed to delete credit limit: " + error.message);
        return;
      }
    }
    
    // Remove from local state
    setCreditLimits(creditLimits.filter(cl => cl.id !== creditLimit.id));
  };

  const handleEditCreditLimit = (creditLimit) => {
    setEditingId(creditLimit.id);
    setEditAmount(creditLimit.credit_limit.toString());
  };

  const handleSaveEdit = (id) => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      alert("Please enter a valid credit amount");
      return;
    }

    setCreditLimits(creditLimits.map(cl => 
      cl.id === id 
        ? { ...cl, credit_limit: parseFloat(editAmount) }
        : cl
    ));

    setEditingId(null);
    setEditAmount("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);

      console.log("💰 Saving credit limits for customer:", customer.id);
      console.log("📋 Credit limits:", creditLimits);

      // Separate new and existing credits
      const newCredits = creditLimits.filter(cl => !cl.id || cl.id > Date.now() - 1000000);
      const existingCredits = creditLimits.filter(cl => cl.id && cl.id < Date.now() - 1000000);

      console.log("➕ New credits to create:", newCredits.length);
      console.log("✏️ Existing credits to update:", existingCredits.length);

      // Create new credits
      for (const credit of newCredits) {
        await customerBranchService.createCredit({
          customer_id: customer.id,
          branch_id: credit.branch_id,
          credit_limit: credit.credit_limit
        });
      }

      // Update existing credits
      for (const credit of existingCredits) {
        await customerBranchService.updateCredit(credit.id, {
          customer_id: customer.id,
          branch_id: credit.branch_id,
          credit_limit: credit.credit_limit
        });
      }

      console.log("✅ Credit limits saved successfully");
      alert("Credit limits updated successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
    } catch (error) {
      console.error("❌ Failed to save credit limits:", error);
      
      // Show user-friendly error message
      let errorMessage = "Failed to save credit limits.";
      
      if (error.message.includes("Not authorized")) {
        errorMessage = "You don't have permission to manage credit limits. Please contact your administrator.";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setCreditLimits([]);
    setSelectedBranch("");
    setCreditAmount("");
    setEditingId(null);
    setEditAmount("");
    onClose();
  };

  if (!isOpen) return null;

  const totalCreditLimit = creditLimits.reduce((sum, cl) => sum + cl.credit_limit, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Change Credit Limit
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Set credit limits for {customer.full_name} per branch
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
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
                  Credit Limit Management
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Set individual credit limits for each branch. The customer can make purchases up to the specified limit at each branch.
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
              {totalCreditLimit > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Credit</p>
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                    AED {totalCreditLimit.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Add Credit Limit Section */}
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Branch Credit Limits
            </h3>
            
            {/* Add Branch & Amount */}
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
                      : "Select a branch"
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
                          disabled={creditLimits.some(cl => cl.branch_id === branch.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-zinc-800 last:border-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          {creditLimits.some(cl => cl.branch_id === branch.id) && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                              ✓ Added
                            </span>
                          )}
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

              <div className="w-48">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold">
                    AED
                  </span>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-14 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAddCreditLimit}
                disabled={!selectedBranch || !creditAmount}
                className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Credit Limits List */}
            {creditLimits.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {creditLimits.map((creditLimit) => (
                  <div 
                    key={creditLimit.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {creditLimit.branch_name}
                      </p>
                      {creditLimit.branch_code && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {creditLimit.branch_code}
                        </p>
                      )}
                    </div>
                    
                    {editingId === creditLimit.id ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-32">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 font-bold">
                            AED
                          </span>
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-2 py-2 bg-white dark:bg-zinc-900 border border-blue-500 rounded-lg text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => handleSaveEdit(creditLimit.id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                            AED {creditLimit.credit_limit.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleEditCreditLimit(creditLimit)}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveCreditLimit(creditLimit)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
                  No credit limits set
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Select a branch and enter an amount to add
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700 sticky bottom-0 bg-white dark:bg-zinc-900">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={saving || creditLimits.length === 0}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

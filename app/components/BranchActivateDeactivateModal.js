"use client";

import React, { useState } from "react";
import { AlertTriangle, Building2, X, Check } from "lucide-react";
import { branchService } from "@/app/lib/services/branchService";

export default function BranchActivateDeactivateModal({ 
  branch, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [saving, setSaving] = useState(false);

  const isActivating = !branch?.status; // If branch is inactive, we're activating it

  const handleConfirm = async () => {
    try {
      setSaving(true);

      // Toggle the branch status
      const updatedData = {
        branch_name: branch.branch_name,
        branch_code: branch.branch_code,
        status: !branch.status, // Toggle status
      };

      console.log(`${isActivating ? '✅ Activating' : '🚫 Deactivating'} branch:`, branch.id);
      console.log("📋 Updated data:", updatedData);

      await branchService.update(branch.id, updatedData);

      console.log(`✅ Branch ${isActivating ? 'activated' : 'deactivated'} successfully`);

      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
    } catch (error) {
      console.error(`❌ Failed to ${isActivating ? 'activate' : 'deactivate'} branch:`, error);
      
      // Show user-friendly error message
      let errorMessage = `Failed to ${isActivating ? 'activate' : 'deactivate'} branch.`;
      
      if (error.message.includes("Not authorized")) {
        errorMessage = "You don't have permission to modify branches. Please contact your administrator.";
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

  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl max-w-md w-full border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="p-6 text-center border-b border-gray-100 dark:border-zinc-800">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isActivating 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-amber-100 dark:bg-amber-900/20'
          }`}>
            {isActivating ? (
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Are you sure?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You are about to {isActivating ? 'activate' : 'deactivate'} the branch: <span className="font-semibold text-gray-900 dark:text-white">{branch.branch_name}</span>.
          </p>
        </div>

        {/* Branch Info */}
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {branch.branch_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {branch.branch_code || 'No code'}
                </p>
              </div>
              <div className={branch.status ? 'status-badge-active' : 'status-badge-inactive'}>
                <div className={branch.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                {branch.status ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          {/* Warning/Info Message */}
          <div className={`rounded-xl p-4 ${
            isActivating 
              ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' 
              : 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800'
          }`}>
            <div className="flex items-start gap-3">
              {isActivating ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              )}
              <div>
                <h4 className={`text-sm font-bold mb-1 ${
                  isActivating 
                    ? 'text-green-900 dark:text-green-200' 
                    : 'text-amber-900 dark:text-amber-200'
                }`}>
                  {isActivating ? 'Activation Confirmation' : 'Deactivation Warning'}
                </h4>
                <p className={`text-sm ${
                  isActivating 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-amber-700 dark:text-amber-300'
                }`}>
                  {isActivating 
                    ? 'This branch will be reactivated and available for operations.' 
                    : 'This branch will be deactivated and may affect ongoing operations.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-100 dark:border-zinc-800">
          <button 
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={saving}
            className={`flex-1 px-6 py-3 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              isActivating 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

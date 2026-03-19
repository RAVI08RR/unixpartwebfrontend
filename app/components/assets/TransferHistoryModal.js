"use client";

import React from "react";
import { X, History, Calendar, Building2, ArrowRightLeft, User, FileText, Loader2 } from "lucide-react";

export default function TransferHistoryModal({ isOpen, onClose, asset, transferHistory, branches, loading }) {
  if (!isOpen) return null;

  const getBranchName = (branchId) => {
    const branch = branches?.find(b => b.id === branchId);
    return branch ? (branch.branch_name || branch.label || branch.name) : 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-5xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-black dark:text-white tracking-tight">Transfer History</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {asset?.asset_id} - {asset?.asset_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
              <p className="text-sm text-gray-500">Loading transfer history...</p>
            </div>
          ) : transferHistory && transferHistory.length > 0 ? (
            <div className="p-6">
              {/* Summary Card */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-1">
                      Total Transfers
                    </p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {transferHistory.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-1">
                      Current Location
                    </p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {getBranchName(asset?.current_operating_branch_id)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transfer Timeline */}
              <div className="space-y-4">
                {transferHistory.map((transfer, index) => (
                  <div
                    key={index}
                    className="relative pl-8 pb-8 border-l-2 border-gray-200 dark:border-zinc-800 last:border-l-0 last:pb-0"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-0 -translate-x-[9px] w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-500 border-4 border-white dark:border-zinc-900"></div>

                    {/* Transfer Card */}
                    <div className="bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700 p-5 hover:shadow-lg transition-shadow">
                      {/* Date Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {transfer.transfer_date ? new Date(transfer.transfer_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </div>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                            Latest
                          </span>
                        )}
                      </div>

                      {/* Transfer Route */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">From</p>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {getBranchName(transfer.from_branch_id)}
                            </p>
                          </div>
                        </div>

                        <ArrowRightLeft className="w-5 h-5 text-blue-500 shrink-0" />

                        <div className="flex-1 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
                          <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-medium">To</p>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-500" />
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                              {getBranchName(transfer.to_branch_id)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Transfer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {transfer.reason && (
                          <div className="p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Reason
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {transfer.reason}
                            </p>
                          </div>
                        )}

                        {transfer.responsible_person && (
                          <div className="p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Responsible Person
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {transfer.responsible_person}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Return Date if exists */}
                      {transfer.return_date && (
                        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-lg">
                          <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                            Expected Return: {new Date(transfer.return_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No transfer history available</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Transfer records will appear here once the asset is moved between branches
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

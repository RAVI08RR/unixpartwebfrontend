"use client";

import React, { useState } from "react";
import { X, ArrowRightLeft, Building2, Calendar, FileText, User, Clock } from "lucide-react";

export default function TransferModal({
    isOpen,
    onClose,
    asset,
    branches,
    onTransfer,
    isLoading
}) {
    const [formData, setFormData] = useState({
        to_branch_id: "",
        transfer_date: new Date().toISOString().split('T')[0],
        reason: "",
        responsible_person: "",
        return_date: ""
    });

    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.to_branch_id || !formData.transfer_date || !formData.reason) {
            setError("Please fill in all required fields");
            return;
        }

        if (parseInt(formData.to_branch_id) === asset?.current_operating_branch_id) {
            setError("Cannot transfer to the same branch");
            return;
        }

        try {
            await onTransfer(formData);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to transfer asset");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-2xl animate-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <ArrowRightLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transfer Asset</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {asset?.asset_id} - {asset?.asset_name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Current Location */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            Current Location
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {branches?.find(b => b.id === asset?.current_operating_branch_id)?.branch_name || 'Unknown'}
                        </p>
                    </div>

                    {/* To Branch */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Transfer To Branch <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={formData.to_branch_id}
                                onChange={(e) => setFormData({ ...formData, to_branch_id: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                required
                            >
                                <option value="">Select destination branch</option>
                                {branches?.filter(b => b.id !== asset?.current_operating_branch_id).map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.branch_name || branch.label || branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Transfer Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Transfer Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={formData.transfer_date}
                                onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Reason for Transfer <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="e.g., High demand, Maintenance, New branch opening"
                                rows={3}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Responsible Person */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Responsible Person <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={formData.responsible_person}
                                onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                                placeholder="e.g., Mohammed (Warehouse Manager)"
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Return Date (Optional) */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            Estimated Return Date <span className="text-gray-400 font-normal">(If temporary)</span>
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={formData.return_date}
                                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                                min={formData.transfer_date}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Transferring..." : "Transfer Asset"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

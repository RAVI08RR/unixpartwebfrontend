"use client";

import React from "react";
import { Plus, Trash2, Percent, Truck, AlertCircle } from "lucide-react";

export default function OwnershipSection({
    owners,
    setOwners,
    suppliers,
    suppliersLoading
}) {
    const handleAddOwner = () => {
        setOwners(prev => [...prev, { supplier_id: "", ownership_percentage: "" }]);
    };

    const handleRemoveOwner = (index) => {
        setOwners(prev => prev.filter((_, i) => i !== index));
    };

    const handleOwnerChange = (index, field, value) => {
        setOwners(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const getTotalPercentage = () => {
        return owners.reduce((sum, owner) => {
            const percentage = parseFloat(owner.ownership_percentage) || 0;
            return sum + percentage;
        }, 0);
    };

    const totalPercentage = getTotalPercentage();
    const isValid = totalPercentage === 100;
    const hasOwners = owners.length > 0;

    // Check for duplicate suppliers
    const getDuplicateSuppliers = () => {
        const supplierIds = owners.map(o => o.supplier_id).filter(Boolean);
        return supplierIds.filter((id, index) => supplierIds.indexOf(id) !== index);
    };

    const duplicates = getDuplicateSuppliers();
    const hasDuplicates = duplicates.length > 0;

    return (
        <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        Ownership Structure
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add owner suppliers and their ownership percentage (Total must equal 100%)
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleAddOwner}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Owner</span>
                </button>
            </div>

            {/* Validation Messages */}
            {hasOwners && !isValid && (
                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-orange-900 dark:text-orange-200">
                            Total ownership must equal 100%
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                            Current total: {totalPercentage.toFixed(2)}%
                        </p>
                    </div>
                </div>
            )}

            {hasDuplicates && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-red-900 dark:text-red-200">
                        Duplicate suppliers detected. Each supplier can only be added once.
                    </p>
                </div>
            )}

            {/* Owners List */}
            {owners.length > 0 && (
                <div className="space-y-4">
                    {owners.map((owner, index) => {
                        const isDuplicate = owner.supplier_id && duplicates.includes(owner.supplier_id);

                        return (
                            <div
                                key={index}
                                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${isDuplicate
                                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                                        : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700'
                                    }`}
                            >
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Supplier Dropdown */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            Owner Supplier <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={owner.supplier_id}
                                            onChange={(e) => handleOwnerChange(index, 'supplier_id', e.target.value)}
                                            className={`w-full px-3 py-2 bg-white dark:bg-zinc-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm ${isDuplicate
                                                    ? 'border-red-300 dark:border-red-700'
                                                    : 'border-gray-200 dark:border-zinc-700'
                                                }`}
                                            disabled={suppliersLoading}
                                        >
                                            <option value="">{suppliersLoading ? 'Loading...' : 'Select owner supplier'}</option>
                                            {suppliers.map(supplier => (
                                                <option key={supplier.id} value={supplier.id}>
                                                    {supplier.name} ({supplier.supplier_code || 'N/A'})
                                                </option>
                                            ))}
                                        </select>
                                        {isDuplicate && (
                                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                                This supplier is already added
                                            </p>
                                        )}
                                    </div>

                                    {/* Ownership Percentage */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            Ownership % <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={owner.ownership_percentage}
                                                onChange={(e) => handleOwnerChange(index, 'ownership_percentage', e.target.value)}
                                                placeholder="0.00"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                className="w-full pl-3 pr-8 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            />
                                            <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveOwner(index)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group/delete mt-7"
                                    title="Remove owner"
                                >
                                    <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600" />
                                </button>
                            </div>
                        );
                    })}

                    {/* Total Percentage Display */}
                    <div className={`flex items-center justify-end gap-2 px-4 py-3 rounded-xl border ${isValid
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : totalPercentage > 100
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                        }`}>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Total Ownership:</span>
                        <span className={`text-lg font-black ${isValid
                                ? 'text-green-600 dark:text-green-400'
                                : totalPercentage > 100
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-orange-600 dark:text-orange-400'
                            }`}>
                            {totalPercentage.toFixed(2)}% / 100%
                        </span>
                    </div>
                </div>
            )}

            {owners.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                    No owners added yet. Click "Add Owner" to add owner suppliers.
                </div>
            )}
        </div>
    );
}

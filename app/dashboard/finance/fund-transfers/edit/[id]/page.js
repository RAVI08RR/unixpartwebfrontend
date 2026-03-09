"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowLeftRight, Save, X, Calendar, FileText, DollarSign, Truck, Building2, Hash } from "lucide-react";
import Link from "next/link";
import { fundTransferService } from "@/app/lib/services/fundTransferService";
import { supplierService } from "@/app/lib/services/supplierService";
import { branchService } from "@/app/lib/services/branchService";
import { useToast } from "@/app/components/Toast";

export default function EditFundTransferPage({ params }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [transferId, setTransferId] = useState(null);
  const { success, error: showError } = useToast();
  
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    method: "bank_transfer",
    reference: "",
    notes: "",
    supplier_id: "",
    branch_id: "",
  });

  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      setTransferId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoadingDropdowns(true);
        const [suppliersData, branchesData] = await Promise.all([
          supplierService.getDropdown(),
          branchService.getDropdown()
        ]);
        
        console.log('Suppliers data:', suppliersData);
        console.log('Branches data:', branchesData);
        
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
        setBranches(Array.isArray(branchesData) ? branchesData : []);
      } catch (err) {
        console.error("Failed to fetch dropdowns:", err);
        showError("Failed to load dropdown data. Using fallback.");
        // Set empty arrays as fallback
        setSuppliers([]);
        setBranches([]);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (!transferId) return;

    const fetchTransfer = async () => {
      try {
        setFetching(true);
        const data = await fundTransferService.getById(transferId);
        
        setFormData({
          date: data.date ? data.date.split('T')[0] : "",
          amount: data.amount || "",
          method: data.method || "bank_transfer",
          reference: data.reference || "",
          notes: data.notes || "",
          supplier_id: data.supplier_id || "",
          branch_id: data.branch_id || "",
        });
      } catch (err) {
        console.error("Failed to fetch fund transfer:", err);
        showError("Failed to load fund transfer data");
      } finally {
        setFetching(false);
      }
    };

    fetchTransfer();
  }, [transferId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const submitData = {
        date: formData.date,
        amount: parseFloat(formData.amount),
        method: formData.method,
        reference: formData.reference.trim() || null,
        notes: formData.notes.trim() || null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        branch_id: formData.branch_id ? parseInt(formData.branch_id) : null,
      };

      if (!submitData.amount || submitData.amount <= 0) {
        setError("Valid amount is required");
        return;
      }

      await fundTransferService.update(transferId, submitData);
      success("Fund transfer updated successfully!");
      router.push("/dashboard/finance/fund-transfers");
      
    } catch (err) {
      console.error("Failed to update fund transfer:", err);
      const errorMsg = err.message || "Failed to update fund transfer. Please try again.";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/finance/fund-transfers"
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Edit Fund Transfer</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Update fund transfer record</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transfer Information</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Fill in the fund transfer details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Date and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount (AED) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Row 2: Method and Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Transfer Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="hawala">Hawala</option>
                  <option value="exchange">Exchange</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Reference Number
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="e.g., BANK-REF-456, HAW-REF-789"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Row 3: Supplier and Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Supplier
                </label>
                <select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleChange}
                  disabled={loadingDropdowns}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm disabled:opacity-50"
                >
                  <option value="">Select Supplier (Optional)</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.label || supplier.name || supplier.supplier_name || 'Unnamed Supplier'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Branch
                </label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  disabled={loadingDropdowns}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm disabled:opacity-50"
                >
                  <option value="">Select Branch (Optional)</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.label || branch.branch_name || branch.name || 'Unnamed Branch'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any additional notes..."
                rows="4"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={isLoading || fetching}
                className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? "Updating..." : fetching ? "Loading..." : "Update Fund Transfer"}</span>
              </button>
              
              <Link
                href="/dashboard/finance/fund-transfers"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

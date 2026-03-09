"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Receipt, Save, X, Calendar, FileText, DollarSign, Truck, Upload, File } from "lucide-react";
import Link from "next/link";
import { fundTransferService } from "@/app/lib/services/fundTransferService";
import { supplierService } from "@/app/lib/services/supplierService";
import { branchService } from "@/app/lib/services/branchService";
import { useToast } from "@/app/components/Toast";

export default function AddTransferPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { success, error: showError } = useToast();
  
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    method: "bank_transfer",
    reference: "",
    notes: "",
    supplier_id: "",
    branch_id: "",
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoadingDropdowns(true);
        const [suppliersData, branchesData] = await Promise.all([
          supplierService.getDropdown(),
          branchService.getDropdown()
        ]);
        
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
        setBranches(Array.isArray(branchesData) ? branchesData : []);
      } catch (err) {
        console.error("Failed to fetch dropdowns:", err);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadPreview(null);
      }
      
      // Set the file name in the document_path field
      setFormData(prev => ({
        ...prev,
        document_path: file.name
      }));
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadPreview(null);
    setFormData(prev => ({
      ...prev,
      document_path: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const submitData = {
        date: formData.date,
        description: formData.description.trim(),
        type: formData.type,
        category: formData.category.trim(),
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        amount: parseFloat(formData.amount),
        document_path: formData.document_path.trim() || null,
      };

      if (!submitData.description || !submitData.amount || submitData.amount <= 0) {
        setError("Description and valid amount are required");
        return;
      }

      await fundTransferService.create(submitData);
      success("Transfer created successfully!");
      router.push("/dashboard/finance/transfers");
      
    } catch (err) {
      console.error("Failed to create transfer:", err);
      const errorMsg = err.message || "Failed to create transfer. Please try again.";
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
          href="/dashboard/finance/transfers"
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Add New Transfer</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Create a new transfer record</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transfer Information</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Fill in the transfer details below</p>
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
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
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
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Row 2: Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  required
                >
                  <option value="General">General</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="Port">Port</option>
                  <option value="VAT">VAT</option>
                  <option value="Personal">Personal</option>
                  <option value="Other Exp">Other Exp</option>
                </select>
              </div>
            </div>

            {/* Row 3: Supplier and Document */}
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
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm disabled:opacity-50"
                >
                  <option value="">Select Supplier (Optional)</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name || supplier.supplier_name || 'Unnamed Supplier'}
                      {supplier.supplier_code ? ` (${supplier.supplier_code})` : supplier.code ? ` (${supplier.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Reference
                </label>
                <input
                  type="text"
                  name="document_path"
                  value={formData.document_path}
                  onChange={handleChange}
                  placeholder="e.g., Receipt number, invoice reference"
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Document
              </label>
              
              {!uploadedFile ? (
                <div className="relative">
                  <input
                    type="file"
                    id="document-upload"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                  />
                  <label
                    htmlFor="document-upload"
                    className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:border-red-500 dark:hover:border-red-500 transition-all bg-gray-50 dark:bg-zinc-800/50"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      Click to upload document
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PDF, JPG, PNG, DOC, XLS (Max 10MB)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl">
                  {uploadPreview ? (
                    <img 
                      src={uploadPreview} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <File className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter transfer description..."
                rows="4"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Document Reference
              </label>
              <input
                type="text"
                name="document_path"
                value={formData.document_path}
                onChange={handleChange}
                placeholder="e.g., Receipt number, invoice reference"
                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
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
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-lg shadow-black/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? "Creating..." : "Create Transfer"}</span>
              </button>
              
              <Link
                href="/dashboard/finance/transfers"
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Truck, User, Mail, Phone, Building2, 
  Check, X, MapPin, FileText, Hash, Tag, ChevronDown
} from "lucide-react";
import { supplierService } from "@/app/lib/services/supplierService";

export default function AddSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    supplier_code: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
    type: "Wholesale", // Default type
    status: true
  });

  const handleSubmit = async () => {
      // Basic validation
      if(!formData.name || !formData.email || !formData.supplier_code) {
          alert("Please fill in all required fields (Supplier Code, Name and Email)");
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
          // Prepare payload
          const payload = {
              supplier_code: formData.supplier_code.trim(),
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone?.trim() || null,
              company: formData.company?.trim() || null,
              address: formData.address?.trim() || null,
              notes: formData.notes?.trim() || null,
              type: formData.type,
              status: formData.status
          };

          console.log("🚀 SUBMITTING NEW SUPPLIER:", {
            token: !!token,
            payload
          });

          const result = await supplierService.create(payload);
          console.log("✅ Supplier creation successful:", result);
          alert("✅ Supplier created successfully!");
          router.push("/dashboard/inventory/suppliers");
      } catch (error) {
          console.error("❌ CREATE SUPPLIER FAILED:", error);
          
          // Try to show the most helpful error message
          let detailedMsg = error.message;
          if (detailedMsg.includes("422")) {
            detailedMsg = "Validation Error: Please check if the supplier code or email is already taken, or if required fields are missing.";
          } else if (detailedMsg.includes("400")) {
            detailedMsg = "Bad Request: The server couldn't process the request. Please check all field values.";
          } else if (detailedMsg.includes("401")) {
            detailedMsg = "Authentication Error: Please log in again.";
          } else if (detailedMsg.includes("500")) {
            detailedMsg = "Server Error: Please try again later or contact support.";
          }
          
          alert(`Failed to create supplier: ${detailedMsg}`);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add Supplier</h1>
          <p className="text-gray-500 text-sm">Create a new supplier record</p>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Supplier Code */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Supplier Code <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g. SUP-001"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.supplier_code}
              onChange={(e) => setFormData({...formData, supplier_code: e.target.value})}
            />
          </div>
        </div>

        {/* Supplier Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Supplier Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g. ABC Auto Parts"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="email"
              placeholder="e.g. contact@supplier.com"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        {/* Supplier Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Supplier Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-gray-100"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="Wholesale">Wholesale</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Distributor">Distributor</option>
              <option value="Owner">Owner</option>
              <option value="Rental">Rental</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="tel"
              placeholder="e.g. +971 50 123 4567"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Name <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g. ABC Trading LLC"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
          </div>
        </div>

        {/* Address - Full Width */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Address <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <textarea 
              placeholder="Enter supplier address..."
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>

        {/* Notes - Full Width */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <textarea 
              placeholder="Add any notes or comments about this supplier..."
              rows={4}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.checked})}
                className="checkbox-black"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Supplier
              </span>
            </label>
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
          <span>{loading ? "Creating..." : "Create Supplier"}</span>
        </button>
        <Link href="/dashboard/inventory/suppliers" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}
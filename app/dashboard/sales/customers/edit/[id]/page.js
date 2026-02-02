"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  User, Mail, Phone, Building, MapPin, 
  Search, Filter, Download, Plus, ChevronLeft, ChevronDown,
  Check, X, Lock, Hash, ArrowLeft
} from "lucide-react";
import { customerService } from "../../../../../lib/services/customerService";
import { useCustomer } from "../../../../../lib/hooks/useCustomers";

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(true);
  const { customer, loading: hookLoading } = useCustomer(customerId);
  
  const [formData, setFormData] = useState({
    customer_code: "",
    full_name: "",
    phone: "",
    business_name: "",
    business_number: "",
    address: "",
    notes: "",
    status: true
  });

  // Update form data when customer is loaded
  useEffect(() => {
    if (customer) {
      setFormData({
        customer_code: customer.customer_code || "",
        full_name: customer.full_name || "",
        phone: customer.phone || "",
        business_name: customer.business_name || "",
        business_number: customer.business_number || "",
        address: customer.address || "",
        notes: customer.notes || "",
        status: customer.status ?? true
      });
      setCustomerLoading(false);
    }
  }, [customer]);

  // Set loading state based on hook loading
  useEffect(() => {
    setCustomerLoading(hookLoading);
  }, [hookLoading]);

  const handleSubmit = async () => {
    // Basic validation
    if(!formData.full_name || !formData.customer_code || !formData.phone || !formData.address) {
      alert("Please fill in all required fields (Name, Customer Code, Phone, and Address)");
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
        customer_code: formData.customer_code.trim(),
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        business_name: formData.business_name.trim() || null,
        business_number: formData.business_number.trim() || null,
        address: formData.address.trim(),
        notes: formData.notes.trim() || null,
        status: formData.status
      };

      console.log("🚀 UPDATING CUSTOMER:", {
        customerId,
        token: !!token,
        payload
      });

      const result = await customerService.update(customerId, payload);
      console.log("✅ Customer update successful:", result);
      alert("✅ Customer updated successfully!");
      router.push("/dashboard/sales/customers");
    } catch (error) {
      console.error("❌ UPDATE CUSTOMER FAILED:", error);
      
      // Try to show the most helpful error message
      let detailedMsg = error.message;
      if (detailedMsg.includes("422")) {
        detailedMsg = "Validation Error: Please check if the Customer Code is already taken, or if required fields are missing.";
      } else if (detailedMsg.includes("400")) {
        detailedMsg = "Bad Request: The server couldn't process the request. Please check all field values.";
      } else if (detailedMsg.includes("401")) {
        detailedMsg = "Authentication Error: Please log in again.";
      } else if (detailedMsg.includes("500")) {
        detailedMsg = "Server Error: Please try again later or contact support.";
      }
      
      alert(`Failed to update customer: ${detailedMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (customerLoading) {
    return (
      <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Customer</h1>
            <p className="text-gray-500 text-sm">Update customer information</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading customer data...</div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Customer</h1>
            <p className="text-gray-500 text-sm">Update customer information</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Customer not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Customer</h1>
          <p className="text-gray-500 text-sm">Update customer information</p>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Customer Code */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Customer Code <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g., CUST-001"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.customer_code}
              onChange={(e) => setFormData({...formData, customer_code: e.target.value})}
            />
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Enter full name"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="tel"
              placeholder="+971 50 123 4567"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.phone || ""}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        {/* Business Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Business Name <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Enter business name"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.business_name || ""}
              onChange={(e) => setFormData({...formData, business_name: e.target.value})}
            />
          </div>
        </div>

        {/* Business Number */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Business Number <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Enter business registration number"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.business_number || ""}
              onChange={(e) => setFormData({...formData, business_number: e.target.value})}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select 
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-gray-100"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value === 'true'})}
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <textarea 
              placeholder="Enter complete address"
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.address || ""}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea 
            placeholder="Additional notes about the customer"
            rows={3}
            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
            value={formData.notes || ""}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>
      </div>

      {/* Financial Summary (Read-only) */}
      {customer.total_purchase !== undefined && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Summary</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current financial information for this customer</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <label className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Purchases</label>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                AED {parseFloat(customer.total_purchase || 0).toFixed(2)}
              </div>
            </div>
            <div className={`p-4 rounded-lg border ${
              parseFloat(customer.outstanding_balance || 0) > 0 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <label className={`text-sm font-medium ${
                parseFloat(customer.outstanding_balance || 0) > 0 
                  ? 'text-red-900 dark:text-red-100' 
                  : 'text-green-900 dark:text-green-100'
              }`}>Outstanding Balance</label>
              <div className={`text-2xl font-bold mt-1 ${
                parseFloat(customer.outstanding_balance || 0) > 0 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-green-700 dark:text-green-300'
              }`}>
                AED {parseFloat(customer.outstanding_balance || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-8">
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "Updating..." : "Update Customer"}</span>
        </button>
        <Link href="/dashboard/sales/customers" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}
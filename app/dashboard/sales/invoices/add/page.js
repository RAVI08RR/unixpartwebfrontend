"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Receipt, User, Calendar, FileText, 
  Check, X, Hash, Building2
} from "lucide-react";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { customerService } from "@/app/lib/services/customerService";

export default function AddInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    invoice_number: "",
    customer_id: "",
    invoice_date: new Date().toISOString().split('T')[0], // Today's date
    invoice_status: "pending",
    overall_load_status: "pending",
    invoice_notes: "",
    items: []
  });

  // Selected customer details
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Helper function to format currency for customer details
  const formatCurrency = (amount) => {
    if (!amount) return "₹0.00";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "₹0.00";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  // Handle customer selection change
  const handleCustomerChange = (customerId) => {
    setFormData({...formData, customer_id: customerId});
    
    // Find and set selected customer details
    if (customerId) {
      const customer = customers.find(c => c.id === parseInt(customerId));
      setSelectedCustomer(customer);
    } else {
      setSelectedCustomer(null);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      try {
        console.log('🔄 Starting to fetch customers...');
        const customersData = await customerService.getAll();
        
        console.log('📊 Fetched customers:', customersData?.length || 0);
        
        if (customersData && customersData.length > 0) {
          setCustomers(customersData);
          console.log('✅ Customers set:', customersData);
        } else {
          console.log('❌ No customers data from API');
          setCustomers([]);
        }
        
      } catch (error) {
        console.error("❌ Failed to fetch customers:", error);
        setCustomers([]);
      } finally {
        setCustomersLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  const handleSubmit = async () => {
      // Basic validation
      if(!formData.invoice_number || !formData.customer_id || !formData.invoice_date) {
          alert("Please fill in all required fields (Invoice Number, Customer, and Date)");
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
          // Prepare payload matching InvoiceCreate schema
          const payload = {
              invoice_number: formData.invoice_number.trim(),
              customer_id: parseInt(formData.customer_id),
              invoice_date: formData.invoice_date,
              invoice_status: formData.invoice_status || "pending",
              overall_load_status: formData.overall_load_status || "pending",
              invoice_notes: formData.invoice_notes?.trim() || null,
              items: formData.items || []
          };

          // Final check for valid numeric IDs
          if (isNaN(payload.customer_id)) {
            alert("Error: The selected Customer has an invalid ID. Please try selecting it again.");
            setLoading(false);
            return;
          }

          console.log("🚀 SUBMITTING NEW INVOICE:", {
            token: !!token,
            payload
          });

          const result = await invoiceService.create(payload);
          console.log("✅ Invoice creation successful:", result);
          alert("✅ Invoice created successfully!");
          router.push("/dashboard/sales/invoices");
      } catch (error) {
          console.error("❌ CREATE INVOICE FAILED:", error);
          
          // Try to show the most helpful error message
          let detailedMsg = error.message;
          if (detailedMsg.includes("422")) {
            detailedMsg = "Validation Error: Please check if the Invoice Number is already taken, or if required fields are missing.";
          } else if (detailedMsg.includes("400")) {
            detailedMsg = "Bad Request: The server couldn't process the request. Please check all field values.";
          } else if (detailedMsg.includes("401")) {
            detailedMsg = "Authentication Error: Please log in again.";
          } else if (detailedMsg.includes("500")) {
            detailedMsg = "Server Error: Please try again later or contact support.";
          }
          
          alert(`Failed to create invoice: ${detailedMsg}`);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add Invoice</h1>
          <p className="text-gray-500 text-sm">Create a new sales invoice</p>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {/* Invoice Number */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Invoice Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="e.g. INV-001"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              value={formData.invoice_number}
              onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
            />
          </div>
        </div>

        {/* Customer */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Customer <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-gray-100"
              value={formData.customer_id}
              onChange={(e) => handleCustomerChange(e.target.value)}
              disabled={customersLoading}
            >
              <option value="">
                {customersLoading 
                  ? "Loading customers..." 
                  : customers.length === 0 
                    ? "No customers available" 
                    : "Select Customer"
                }
              </option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name} - {customer.business_name || customer.customer_code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Invoice Date */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Invoice Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="date"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              value={formData.invoice_date}
              onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
            />
          </div>
        </div>

        {/* Invoice Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Invoice Status
          </label>
          <div className="relative">
            <Receipt className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-gray-100"
              value={formData.invoice_status}
              onChange={(e) => setFormData({...formData, invoice_status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Overall Load Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Load Status
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-gray-100"
              value={formData.overall_load_status}
              onChange={(e) => setFormData({...formData, overall_load_status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="loaded">Loaded</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Invoice Notes - Full Width */}
        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Invoice Notes <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
            <textarea 
              placeholder="Add any notes or comments about this invoice..."
              rows={4}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
              value={formData.invoice_notes}
              onChange={(e) => setFormData({...formData, invoice_notes: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Customer Details Section - Show when customer is selected */}
      {selectedCustomer && (
        <div className="lg:col-span-2 mt-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Customer Basic Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedCustomer.full_name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Code:</span> {selectedCustomer.customer_code}
                      </p>
                      {selectedCustomer.business_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Business:</span> {selectedCustomer.business_name}
                        </p>
                      )}
                      {selectedCustomer.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Phone:</span> {selectedCustomer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Customer Financial Info */}
                  <div className="grid grid-cols-2 gap-4 lg:gap-6">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Total Purchase
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(selectedCustomer.total_purchase)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Outstanding
                        </p>
                        <p className={`text-lg font-bold ${
                          parseFloat(selectedCustomer.outstanding_balance || 0) > 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {formatCurrency(selectedCustomer.outstanding_balance)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Customer Address & Notes */}
                {(selectedCustomer.address || selectedCustomer.notes) && (
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    {selectedCustomer.address && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">Address:</span> {selectedCustomer.address}
                      </p>
                    )}
                    {selectedCustomer.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Notes:</span> {selectedCustomer.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-8 lg:col-span-2">
        <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-6 py-2.5 bg-black dark:bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-900 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "Creating..." : "Create Invoice"}</span>
        </button>
        <Link href="/dashboard/sales/invoices" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}
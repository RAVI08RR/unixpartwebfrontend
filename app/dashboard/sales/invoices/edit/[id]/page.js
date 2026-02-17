"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Receipt, User, Calendar, FileText, 
  Check, X, Hash, Building2, ChevronLeft
} from "lucide-react";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { customerService } from "@/app/lib/services/customerService";

export default function EditInvoicePage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [updateProgress, setUpdateProgress] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const invoiceId = resolvedParams.id;
  
  const [formData, setFormData] = useState({
    invoice_number: "",
    customer_id: "",
    invoice_date: "",
    invoice_status: "pending",
    overall_load_status: "pending",
    invoice_notes: "",
    items: []
  });

  // Selected customer details
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Helper function to format currency for customer details
  const formatCurrency = (amount) => {
    if (!amount) return "AED 0.00";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return "AED 0.00";
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
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

  // Fetch invoice data and customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Validate invoice ID
        if (!invoiceId || invoiceId === 'undefined') {
          throw new Error('Invalid invoice ID');
        }

        // Fetch customers and invoice data in parallel
        const [customersData, invoiceData] = await Promise.all([
          customerService.getAll().catch(err => {
            console.error('Failed to fetch customers:', err);
            return [];
          }),
          invoiceService.getById(invoiceId).catch(err => {
            console.error('Failed to fetch invoice:', err);
            throw err;
          })
        ]);

        // Set customers
        if (customersData && customersData.length > 0) {
          setCustomers(customersData);
        }

        // Set invoice data
        if (invoiceData) {
          setFormData({
            invoice_number: invoiceData.invoice_number || "",
            customer_id: invoiceData.customer_id || "",
            invoice_date: invoiceData.invoice_date || "",
            invoice_status: invoiceData.invoice_status || "pending",
            overall_load_status: invoiceData.overall_load_status || "pending",
            invoice_notes: invoiceData.invoice_notes || "",
            items: invoiceData.items || []
          });

          // Set selected customer
          if (invoiceData.customer_id && customersData) {
            const customer = customersData.find(c => c.id === parseInt(invoiceData.customer_id));
            setSelectedCustomer(customer);
          }
        }

      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
        alert("Failed to load invoice data. Redirecting to invoice list.");
        router.push("/dashboard/sales/invoices");
      } finally {
        setPageLoading(false);
      }
    };
    
    fetchData();
  }, [invoiceId, router]);

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
      setUpdateProgress('Validating data...');
      
      try {
          // Prepare payload matching InvoiceUpdate schema
          const payload = {
              invoice_number: formData.invoice_number.trim(),
              customer_id: parseInt(formData.customer_id),
              invoice_date: formData.invoice_date,
              invoice_status: formData.invoice_status,
              overall_load_status: formData.overall_load_status,
              invoice_notes: formData.invoice_notes.trim()
          };

          console.log("🚀 UPDATING INVOICE:", {
            id: invoiceId,
            payload
          });

          setUpdateProgress('Updating invoice...');
          const result = await invoiceService.update(invoiceId, payload);
          
          console.log("✅ Invoice update successful:", result);
          setUpdateProgress('Update successful! Redirecting...');
          
          // Show success message
          alert("✅ Invoice updated successfully!");
          
          // Use window.location for more reliable navigation
          window.location.href = "/dashboard/sales/invoices";
      } catch (error) {
          console.error("❌ UPDATE INVOICE FAILED:", error);
          setUpdateProgress('');
          
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
          
          alert(`Failed to update invoice: ${detailedMsg}`);
      } finally {
          setLoading(false);
          setUpdateProgress('');
      }
  };

  if (pageLoading) {
    return (
      <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Edit Invoice</h1>
            <p className="text-gray-500 text-sm">Loading invoice data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/dashboard/sales/invoices"
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Invoice</h1>
          </div>
          <p className="text-gray-500 text-sm">Update invoice information and details</p>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Invoice Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Invoice Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Customer Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
                    value={formData.customer_id}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    disabled={customersLoading}
                  >
                    <option value="">
                      {customersLoading ? "Loading customers..." : "Select Customer"}
                    </option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </option>
                    ))}
                  </select>
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
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
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
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall Load Status
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none text-gray-900 dark:text-white"
                    value={formData.overall_load_status}
                    onChange={(e) => setFormData({...formData, overall_load_status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Invoice Notes */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Invoice Notes
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea 
                    placeholder="Add any additional notes or comments..."
                    rows={4}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 resize-none"
                    value={formData.invoice_notes}
                    onChange={(e) => setFormData({...formData, invoice_notes: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Details */}
        <div className="space-y-6">
          {selectedCustomer && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Name</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{selectedCustomer.full_name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedCustomer.email || "Not provided"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedCustomer.phone || "Not provided"}</p>
                </div>
                
                {selectedCustomer.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedCustomer.address}</p>
                  </div>
                )}
                
                {selectedCustomer.outstanding_balance && (
                  <div className="pt-3 border-t border-gray-200 dark:border-zinc-700">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding Balance</p>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
                      {formatCurrency(selectedCustomer.outstanding_balance)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice Summary */}
          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-200 dark:border-zinc-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  formData.invoice_status === 'paid' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                  formData.invoice_status === 'overdue' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                  formData.invoice_status === 'cancelled' ? 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400' :
                  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {formData.invoice_status.charAt(0).toUpperCase() + formData.invoice_status.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Load Status</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.overall_load_status.charAt(0).toUpperCase() + formData.overall_load_status.slice(1).replace('_', ' ')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.invoice_date ? new Date(formData.invoice_date).toLocaleDateString() : "Not set"}
                </span>
              </div>
            </div>
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
          <span>{loading ? (updateProgress || "Updating...") : "Update Invoice"}</span>
        </button>
        <Link href="/dashboard/sales/invoices" className="px-6 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all text-center">
          Cancel
        </Link>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Calendar, Filter, Download, Eye, 
  ChevronDown, Search, FileText, DollarSign
} from "lucide-react";
import { customerService } from "@/app/lib/services/customerService";
import { invoiceService } from "@/app/lib/services/invoiceService";
import Link from "next/link";

export default function CustomerPurchaseHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);

  // Fetch customer and invoices
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch customer details
        const customerData = await customerService.getById(customerId);
        setCustomer(customerData);

        // Fetch invoices for this customer
        try {
          const invoicesData = await invoiceService.getAll(0, 100, customerId);
          console.log("📋 Invoices data:", invoicesData);
          
          // Handle different response formats
          let invoicesList = [];
          if (Array.isArray(invoicesData)) {
            invoicesList = invoicesData;
          } else if (invoicesData?.data && Array.isArray(invoicesData.data)) {
            invoicesList = invoicesData.data;
          } else if (invoicesData?.invoices && Array.isArray(invoicesData.invoices)) {
            invoicesList = invoicesData.invoices;
          }
          
          setInvoices(invoicesList);
        } catch (error) {
          console.warn("Could not fetch invoices:", error);
          setInvoices([]);
        }
        
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load purchase history: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchData();
    }
  }, [customerId]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    return invoices.filter(invoice => {
      const matchesSearch = 
        (invoice.invoice_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (invoice.invoice_amount?.toString() || "").includes(searchQuery);
      
      const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;
      
      // Time filter logic
      let matchesTime = true;
      if (timeFilter !== "All Time") {
        const invoiceDate = new Date(invoice.invoice_date);
        const now = new Date();
        
        switch (timeFilter) {
          case "Last 7 Days":
            matchesTime = (now - invoiceDate) / (1000 * 60 * 60 * 24) <= 7;
            break;
          case "Last 30 Days":
            matchesTime = (now - invoiceDate) / (1000 * 60 * 60 * 24) <= 30;
            break;
          case "Last 3 Months":
            matchesTime = (now - invoiceDate) / (1000 * 60 * 60 * 24) <= 90;
            break;
          case "Last 6 Months":
            matchesTime = (now - invoiceDate) / (1000 * 60 * 60 * 24) <= 180;
            break;
          case "Last Year":
            matchesTime = (now - invoiceDate) / (1000 * 60 * 60 * 24) <= 365;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [invoices, searchQuery, statusFilter, timeFilter]);

  // Calculate totals
  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.invoice_amount || 0), 0);
  }, [filteredInvoices]);

  const paidAmount = useMemo(() => {
    return filteredInvoices
      .filter(inv => inv.status === "Saved and Paid" || inv.status === "Paid")
      .reduce((sum, inv) => sum + parseFloat(inv.invoice_amount || 0), 0);
  }, [filteredInvoices]);

  const pendingAmount = useMemo(() => {
    return filteredInvoices
      .filter(inv => inv.status === "Pending" || inv.status === "Draft")
      .reduce((sum, inv) => sum + parseFloat(inv.invoice_amount || 0), 0);
  }, [filteredInvoices]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Purchase History</h1>
            <p className="text-gray-400 text-sm font-normal">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Customer Not Found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">
            Purchase History for {customer.full_name}
          </h1>
          <p className="text-gray-400 text-sm font-normal">
            View a filtered list of all past invoices
          </p>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-4">
          <img 
            src={customer.profile_image 
              ? customerService.getProfileImageUrl(customer.profile_image) 
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`
            }
            alt={customer.full_name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`;
            }}
          />
          <div className="flex-1">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">{customer.full_name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {customer.customer_code} • {customer.phone}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Purchases</p>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                AED {customer.total_purchase ? parseFloat(customer.total_purchase).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Outstanding</p>
              <p className="text-lg font-black text-red-600 dark:text-red-400">
                AED {customer.outstanding_balance ? parseFloat(customer.outstanding_balance).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <div className={customer.status ? 'status-badge-active' : 'status-badge-inactive'}>
                <div className={customer.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                {customer.status ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">Total Amount</p>
          </div>
          <p className="text-2xl font-black text-blue-900 dark:text-blue-100">
            AED {totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-bold text-green-900 dark:text-green-200 uppercase tracking-wider">Paid Amount</p>
          </div>
          <p className="text-2xl font-black text-green-900 dark:text-green-100">
            AED {paidAmount.toFixed(2)}
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            {filteredInvoices.filter(inv => inv.status === "Saved and Paid" || inv.status === "Paid").length} paid
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">Pending Amount</p>
          </div>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-100">
            AED {pendingAmount.toFixed(2)}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            {filteredInvoices.filter(inv => inv.status === "Pending" || inv.status === "Draft").length} pending
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by invoice number or amount..."
            className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Time Filter */}
        <div className="relative">
          <button 
            onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
            className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm min-w-[180px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{timeFilter}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isTimeFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isTimeFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {["All Time", "Last 7 Days", "Last 30 Days", "Last 3 Months", "Last 6 Months", "Last Year"].map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    setTimeFilter(time);
                    setIsTimeFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    timeFilter === time 
                      ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button 
            onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
            className="flex items-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all min-w-[150px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{statusFilter === "All" ? "All Status" : statusFilter}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isStatusFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {["All", "Saved and Paid", "Paid", "Pending", "Draft"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setIsStatusFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    statusFilter === status 
                      ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {status === "All" ? "All Status" : status}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Button */}
        <button className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Invoice Date & Time</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Invoice #</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Invoice Amount</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {invoice.invoice_number || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        AED {parseFloat(invoice.invoice_amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                        invoice.status === "Saved and Paid" || invoice.status === "Paid"
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : invoice.status === "Pending"
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {invoice.status || "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <Link
                        href={`/dashboard/sales/invoices/view/${invoice.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No invoices found</p>
                    <p className="text-gray-400 text-xs mt-1">This customer has no purchase history yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

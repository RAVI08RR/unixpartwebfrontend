"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

  // Format currency
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
            View a filtered list of all past invoices.
          </p>
        </div>
      </div>

      {/* Simple Time Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">All Time</span>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
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
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }).replace(',', 'th,') : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {invoice.invoice_number || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.invoice_total || invoice.invoice_amount || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                        invoice.invoice_status === 'paid' || invoice.invoice_status === 'Saved and Paid'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : invoice.invoice_status === 'overdue' || invoice.invoice_status === 'Overdue'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          : invoice.invoice_status === 'pending' || invoice.invoice_status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {invoice.invoice_status || invoice.status || "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <Link
                        href={`/dashboard/sales/invoices/view/${invoice.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
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

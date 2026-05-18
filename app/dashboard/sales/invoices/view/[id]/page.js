"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useReactToPrint } from 'react-to-print';
import { 
  ArrowLeft, Printer, FileText, CreditCard, Receipt
} from "lucide-react";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { customerService } from "@/app/lib/services/customerService";
import PrintableInvoice from "@/app/components/PrintableInvoice";

export default function ViewInvoicePage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoiceId, setInvoiceId] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  useEffect(() => {
    // Unwrap params promise
    Promise.resolve(params).then((resolvedParams) => {
      setInvoiceId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!invoiceId) return;
      
      setLoading(true);
      try {
        const invoiceData = await invoiceService.getById(invoiceId);
        setInvoice(invoiceData);
        
        // Fetch customer details
        if (invoiceData?.customer_id) {
          try {
            const customerData = await customerService.getById(invoiceData.customer_id);
            setCustomer(customerData);
          } catch (err) {
            console.error("Failed to fetch customer:", err);
          }
        }
      } catch (error) {
        console.error("Failed to load invoice:", error);
        alert("Failed to load invoice");
        router.push("/dashboard/sales/invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [invoiceId, router]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'saved and paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getLoadStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'loaded':
      case 'full':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'partial':
      case 'partially_loaded':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'pending':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'draft':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'not_loaded':
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getLoadStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'loaded':
      case 'full':
        return 'Loaded';
      case 'partial':
      case 'partially_loaded':
        return 'Partial';
      case 'pending':
      case 'draft':
      case 'not_loaded':
      default:
        return 'Unloaded';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Invoice not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-12 px-4 sm:px-6">
      {/* Header - Hide in print mode */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/sales/invoices" 
            className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Invoice Details</h1>
            <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">{invoice.invoice_number}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <Link
            href={`/dashboard/sales/invoices/edit/${invoiceId}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Edit Invoice
          </Link>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm p-8">
        {/* Header with Invoice Status in Upper Right */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">{invoice.invoice_number}</h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Invoice Date: {formatDate(invoice.invoice_date)}</p>
            {invoice.created_by?.name || invoice.created_by_name ? (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                <span className="font-semibold">Invoice By:</span> {invoice.created_by?.name || invoice.created_by_name}
              </p>
            ) : null}
          </div>
          
          {/* Invoice Status - Upper Right Corner */}
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Invoice Status</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(invoice.invoice_status)}`}>
              {invoice.invoice_status || "Pending"}
            </div>
            
            {/* Load Status */}
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 mt-4">Load Status</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getLoadStatusColor(invoice.overall_load_status)}`}>
              {getLoadStatusLabel(invoice.overall_load_status)}
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Customer Information</h3>
          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer Name</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">{customer?.full_name || `Customer #${invoice.customer_id}`}</p>
              </div>
              {customer?.customer_code && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer Code</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{customer.customer_code}</p>
                </div>
              )}
              {customer?.phone && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{customer.phone}</p>
                </div>
              )}
              {customer?.email && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{customer.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        {((invoice.items && invoice.items.length > 0) || (invoice.invoice_items && invoice.invoice_items.length > 0)) && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stock #</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Load Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Load Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.invoice_items || invoice.items || []).map((item, index) => {
                    const itemTotal = (parseFloat(item.sale_amount) || 0) - (parseFloat(item.discount) || 0);
                    return (
                      <tr key={index} className="border-b border-gray-100 dark:border-zinc-800/50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {item.stock_number || item.po_item?.stock_number || '-'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.sale_description || item.item_name || item.po_item?.item_name || item.po_item?.po_description || '-'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(item.sale_amount)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {formatCurrency(item.discount)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm font-black text-gray-900 dark:text-white">
                            {formatCurrency(itemTotal)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getLoadStatusColor(item.load_status)}`}>
                            {getLoadStatusLabel(item.load_status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.load_date ? new Date(item.load_date).toLocaleString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payments</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Received By</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-zinc-800/50">
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(payment.payment_date)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                            {payment.payment_method?.replace('_', ' ')}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-black text-green-600 dark:text-green-400">
                          {formatCurrency(payment.payment_amount)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          {payment.received_by?.name || payment.received_by_name || payment.created_by?.name || "Admin User"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.payment_notes || '-'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-lg p-6 border border-gray-200 dark:border-zinc-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(invoice.invoice_total)}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Total Paid</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(invoice.paid_amount)}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Balance Due</p>
              <p className="text-2xl font-black text-red-600 dark:text-red-400">{formatCurrency(invoice.outstanding_amount)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.invoice_notes && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Notes</h3>
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">{invoice.invoice_notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Printable Invoice */}
      <div style={{ display: 'none' }}>
        <PrintableInvoice ref={printRef} invoice={invoice} customer={customer} invoiceId={invoiceId} />
      </div>
    </div>
  );
}

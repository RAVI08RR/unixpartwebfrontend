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
    documentTitle: invoice?.invoice_number || "Invoice",
  });

  useEffect(() => {
    // Unwrap params promise
    Promise.resolve(params).then((resolvedParams) => {
      if (resolvedParams.id && resolvedParams.id !== 'undefined') {
        setInvoiceId(resolvedParams.id);
      } else {
        setLoading(false);
      }
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
        {/* Show PrintableInvoice component directly in the page */}
        <PrintableInvoice invoice={invoice} customer={customer} invoiceId={invoiceId} />
      </div>

      {/* Hidden Printable Invoice for actual printing */}
      <div style={{ display: 'none' }}>
        <PrintableInvoice ref={printRef} invoice={invoice} customer={customer} invoiceId={invoiceId} />
      </div>
    </div>
  );
}

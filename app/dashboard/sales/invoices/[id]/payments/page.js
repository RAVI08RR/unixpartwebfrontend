"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Plus, DollarSign, Calendar, CreditCard, 
  Trash2, Receipt, User, Building2, Hash
} from "lucide-react";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { useToast } from "@/app/components/Toast";

export default function InvoicePaymentsPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id;
  
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { success, error: showError } = useToast();
  
  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: "",
    payment_method: "cash",
    notes: ""
  });

  // Fetch invoice and payments
  useEffect(() => {
    const fetchData = async () => {
      if (!invoiceId) return;
      
      try {
        setLoading(true);
        const [invoiceData, paymentsData] = await Promise.all([
          invoiceService.getById(invoiceId),
          invoiceService.getPayments(invoiceId)
        ]);
        
        setInvoice(invoiceData);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (err) {
        showError("Failed to load data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      showError("Please enter a valid payment amount");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        payment_date: paymentForm.payment_date,
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        notes: paymentForm.notes || null
      };

      await invoiceService.addPayment(invoiceId, payload);
      success("Payment added successfully!");
      
      // Refresh data
      const [invoiceData, paymentsData] = await Promise.all([
        invoiceService.getById(invoiceId),
        invoiceService.getPayments(invoiceId)
      ]);
      
      setInvoice(invoiceData);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      
      // Reset form and close modal
      setPaymentForm({
        payment_date: new Date().toISOString().split('T')[0],
        amount: "",
        payment_method: "cash",
        notes: ""
      });
      setAddModalOpen(false);
    } catch (err) {
      showError("Failed to add payment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "AED 0.00";
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
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
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/sales/invoices')}
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Invoice Payments</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">
            {invoice.invoice_number} - {invoice.customer?.full_name || `Customer #${invoice.customer_id}`}
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Payment
        </button>
      </div>

      {/* Invoice Summary Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Invoice Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.invoice_total)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Paid Amount</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(invoice.paid_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Outstanding</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(invoice.outstanding_amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
              invoice.invoice_status === 'paid'
                ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                : invoice.invoice_status === 'overdue'
                ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
            }`}>
              {invoice.invoice_status?.charAt(0).toUpperCase() + invoice.invoice_status?.slice(1) || "Pending"}
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment History</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                          {formatDate(payment.payment_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-black text-green-600 dark:text-green-400">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-700 dark:text-zinc-300 capitalize">
                          {payment.payment_method}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {payment.notes || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <DollarSign className="w-16 h-16 text-gray-300" />
                      <div>
                        <p className="text-gray-400 font-bold text-sm">No payments recorded yet</p>
                        <button
                          onClick={() => setAddModalOpen(true)}
                          className="mt-4 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add First Payment
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-lg border border-gray-100 dark:border-zinc-800 shadow-2xl">
            <form onSubmit={handleAddPayment} className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black dark:text-white">Add Payment</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Record a new payment for this invoice</p>
                </div>
              </div>

              <div className="space-y-4">
                <FormField label="Payment Date" required>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})}
                    required
                  />
                </FormField>

                <FormField label="Amount (AED)" required>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    max={invoice.outstanding_amount}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Outstanding: {formatCurrency(invoice.outstanding_amount)}
                  </p>
                </FormField>

                <FormField label="Payment Method" required>
                  <select 
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </FormField>

                <FormField label="Notes">
                  <textarea 
                    rows="3"
                    placeholder="Optional payment notes..."
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white resize-none"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  />
                </FormField>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-[15px] font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Adding Payment...' : 'Add Payment'}
                </button>
                <button 
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 dark:text-gray-400 rounded-[15px] font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

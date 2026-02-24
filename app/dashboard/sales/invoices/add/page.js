"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Receipt, User, Calendar, FileText, Check, X, Hash, 
  Building2, ArrowLeft, Plus, Trash2, DollarSign, Package
} from "lucide-react";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { customerService } from "@/app/lib/services/customerService";
import { useToast } from "@/app/components/Toast";

export default function AddInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const { success, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    invoice_number: "",
    customer_id: "",
    invoice_date: new Date().toISOString().split('T')[0],
    invoice_by: 1, // Current user ID
    invoice_status: "pending",
    overall_load_status: "not_loaded",
    invoice_notes: "",
    items: [],
    payments: []
  });

  // Selected customer details
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Calculate totals
  const totals = useMemo(() => {
    const itemsTotal = formData.items.reduce((sum, item) => {
      const saleAmt = parseFloat(item.sale_amount) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (saleAmt - discount);
    }, 0);

    const totalPaid = formData.payments.reduce((sum, payment) => {
      return sum + (parseFloat(payment.payment_amount) || 0);
    }, 0);

    const balanceDue = itemsTotal - totalPaid;

    return {
      itemsTotal,
      totalPaid,
      balanceDue
    };
  }, [formData.items, formData.payments]);

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

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    setFormData({...formData, customer_id: customerId});
    if (customerId) {
      const customer = customers.find(c => c.id === parseInt(customerId));
      setSelectedCustomer(customer);
    } else {
      setSelectedCustomer(null);
    }
  };

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      try {
        const customersData = await customerService.getAll();
        if (customersData && customersData.length > 0) {
          setCustomers(customersData);
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setCustomersLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Add invoice item
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          stock_number: "",
          item_description: "",
          sale_description: "",
          sale_amount: "",
          discount: "",
          discount_details: "",
          paid_amount: 0,
          load_status: "not_loaded",
          load_datetime: ""
        }
      ]
    });
  };

  // Remove invoice item
  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({...formData, items: newItems});
  };

  // Update invoice item
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({...formData, items: newItems});
  };

  // Add payment row
  const addPayment = () => {
    setFormData({
      ...formData,
      payments: [
        ...formData.payments,
        {
          payment_method: "cash",
          payment_date: new Date().toISOString().split('T')[0],
          payment_amount: "",
          payment_notes: "",
          branch_id: null,
          supplier_id: null
        }
      ]
    });
  };

  // Remove payment row
  const removePayment = (index) => {
    const newPayments = formData.payments.filter((_, i) => i !== index);
    setFormData({...formData, payments: newPayments});
  };

  // Update payment
  const updatePayment = (index, field, value) => {
    const newPayments = [...formData.payments];
    newPayments[index][field] = value;
    setFormData({...formData, payments: newPayments});
  };

  // Distribute payment across items based on formula
  // paid amount of item = (item sale amount / total invoice sale amount) * current payment
  const distributePayment = () => {
    if (formData.items.length === 0 || totals.totalPaid === 0) return;

    const newItems = formData.items.map(item => {
      const itemAmount = (parseFloat(item.sale_amount) || 0) - (parseFloat(item.discount) || 0);
      const itemPaidAmount = (itemAmount / totals.itemsTotal) * totals.totalPaid;
      return {
        ...item,
        paid_amount: itemPaidAmount.toFixed(2)
      };
    });

    setFormData({...formData, items: newItems});
  };

  // Auto-distribute when payments change
  useEffect(() => {
    if (formData.items.length > 0 && formData.payments.length > 0) {
      distributePayment();
    }
  }, [formData.payments]);

  // Submit form
  const handleSubmit = async () => {
    if(!formData.invoice_number || !formData.customer_id || !formData.invoice_date) {
      showError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        invoice_number: formData.invoice_number.trim(),
        customer_id: parseInt(formData.customer_id),
        invoice_date: formData.invoice_date,
        invoice_by: formData.invoice_by,
        invoice_status: formData.invoice_status,
        overall_load_status: formData.overall_load_status,
        invoice_notes: formData.invoice_notes?.trim() || null,
        invoice_total: totals.itemsTotal.toString(),
        paid_amount: totals.totalPaid.toString(),
        outstanding_amount: totals.balanceDue.toString(),
        items: formData.items,
        payments: formData.payments
      };

      await invoiceService.create(payload);
      success("Invoice created successfully!");
      router.push("/dashboard/sales/invoices");
    } catch (error) {
      showError("Failed to create invoice: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/sales/invoices" 
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Create New Invoice</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Fill in the details below to create an invoice</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Invoice Number" required>
            <input 
              type="text"
              placeholder="INV-001"
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
              value={formData.invoice_number}
              onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
            />
          </FormField>

          <FormField label="Date & Time" required>
            <input 
              type="date"
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
              value={formData.invoice_date}
              onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
            />
          </FormField>

          <FormField label="Invoice Status" required>
            <select 
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
              value={formData.invoice_status}
              onChange={(e) => setFormData({...formData, invoice_status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Overall Load Status" required>
            <select 
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
              value={formData.overall_load_status}
              onChange={(e) => setFormData({...formData, overall_load_status: e.target.value})}
            >
              <option value="not_loaded">Not Loaded</option>
              <option value="loaded">Loaded</option>
              <option value="delivered">Delivered</option>
            </select>
          </FormField>

          <FormField label="Customer" required>
            <select 
              className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
              value={formData.customer_id}
              onChange={(e) => handleCustomerChange(e.target.value)}
              disabled={customersLoading}
            >
              <option value="">Select a customer...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name} - {customer.customer_code}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Customer Details */}
        {selectedCustomer && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Customer Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-bold text-gray-900 dark:text-white">{selectedCustomer.full_name}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Code</p>
                <p className="font-bold text-gray-900 dark:text-white">{selectedCustomer.customer_code}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Phone</p>
                <p className="font-bold text-gray-900 dark:text-white">{selectedCustomer.phone || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Outstanding</p>
                <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(selectedCustomer.outstanding_balance)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invoice Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {formData.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Stock #</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sale Desc</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sale Amt</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Paid Amt</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Load Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-zinc-800/50">
                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          placeholder="STK-001"
                          className="w-24 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={item.stock_number}
                          onChange={(e) => updateItem(index, 'stock_number', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          placeholder="Item description"
                          className="w-32 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={item.item_description}
                          onChange={(e) => updateItem(index, 'item_description', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          placeholder="Sale description"
                          className="w-32 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={item.sale_description}
                          onChange={(e) => updateItem(index, 'sale_description', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-24 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={item.sale_amount}
                          onChange={(e) => updateItem(index, 'sale_amount', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-24 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-green-600">{formatCurrency(item.paid_amount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select 
                          className="w-28 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={item.load_status}
                          onChange={(e) => updateItem(index, 'load_status', e.target.value)}
                        >
                          <option value="not_loaded">Not Loaded</option>
                          <option value="loaded">Loaded</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No items added yet.</p>
              <button
                type="button"
                onClick={addItem}
                className="mt-4 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Item
              </button>
            </div>
          )}
        </div>

        {/* Payments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payments</h3>
            <button
              type="button"
              onClick={addPayment}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Payment Row
            </button>
          </div>

          {formData.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Notes</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.payments.map((payment, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-zinc-800/50">
                      <td className="px-4 py-3">
                        <select 
                          className="w-32 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={payment.payment_method}
                          onChange={(e) => updatePayment(index, 'payment_method', e.target.value)}
                        >
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="cheque">Cheque</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="date"
                          className="w-36 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={payment.payment_date}
                          onChange={(e) => updatePayment(index, 'payment_date', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-28 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={payment.payment_amount}
                          onChange={(e) => updatePayment(index, 'payment_amount', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text"
                          placeholder="Notes"
                          className="w-40 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded text-sm"
                          value={payment.payment_notes}
                          onChange={(e) => updatePayment(index, 'payment_notes', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removePayment(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No payments added yet.</p>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.itemsTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totals.totalPaid)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Balance Due</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totals.balanceDue)}</p>
            </div>
          </div>
        </div>

        {/* Invoice Notes */}
        <FormField label="Invoice Notes">
          <textarea 
            rows="4"
            placeholder="Add any notes or comments..."
            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all resize-none"
            value={formData.invoice_notes}
            onChange={(e) => setFormData({...formData, invoice_notes: e.target.value})}
          />
        </FormField>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
          <Link 
            href="/dashboard/sales/invoices"
            className="px-6 py-3 text-gray-500 dark:text-gray-400 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            Cancel
          </Link>
        </div>
      </div>
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

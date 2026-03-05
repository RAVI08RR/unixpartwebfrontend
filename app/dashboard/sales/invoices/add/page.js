"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Receipt, User, Calendar, FileText, Check, X, Hash, 
  Building2, ArrowLeft, Plus, Trash2, DollarSign, Package, CreditCard
} from "lucide-react";
import { invoiceService } from "@/app/lib/services/invoiceService";
import { customerService } from "@/app/lib/services/customerService";
import { poItemService } from "@/app/lib/services/poItemService";
import { useToast } from "@/app/components/Toast";

export default function AddInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [poItems, setPoItems] = useState([]);
  const [poItemsLoading, setPoItemsLoading] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
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

  // Item form for modal
  const [itemForm, setItemForm] = useState({
    po_item_id: "",
    stock_number: "",
    item_name: "",
    po_description: "",
    sale_description: "",
    sale_amount: "",
    discount: "",
    discount_details: "",
    load_status: "pending",
    load_date: ""
  });

  // Payment form for modal
  const [paymentForm, setPaymentForm] = useState({
    payment_method: "cash",
    payment_date: new Date().toISOString().split('T')[0],
    payment_amount: "",
    payment_notes: ""
  });

  // Calculate totals and distributed paid amounts
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

    // Calculate distributed paid amounts for each item
    const itemsWithPaidAmounts = formData.items.map(item => {
      const itemAmount = (parseFloat(item.sale_amount) || 0) - (parseFloat(item.discount) || 0);
      const itemPaidAmount = itemsTotal > 0 && totalPaid > 0 
        ? (itemAmount / itemsTotal) * totalPaid 
        : 0;
      return {
        ...item,
        paid_amount_calculated: itemPaidAmount.toFixed(2)
      };
    });

    return {
      itemsTotal,
      totalPaid,
      balanceDue,
      itemsWithPaidAmounts
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
  const handleCustomerChange = async (customerId) => {
    setFormData({...formData, customer_id: customerId});
    if (customerId) {
      try {
        const customer = await customerService.getById(customerId);
        setSelectedCustomer(customer);
      } catch (error) {
        console.error("Failed to fetch full customer details:", error);
        const minimalCustomer = customers.find(c => c.id === parseInt(customerId));
        setSelectedCustomer(minimalCustomer);
      }
    } else {
      setSelectedCustomer(null);
    }
  };

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      try {
        const customersData = await customerService.getDropdown();
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

  // Fetch PO Items
  useEffect(() => {
    const fetchPoItems = async () => {
      setPoItemsLoading(true);
      try {
        const data = await poItemService.getDropdown();
        console.log('PO Items fetched:', data?.length, 'items');
        setPoItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching PO items:", error);
        setPoItems([]);
      } finally {
        setPoItemsLoading(false);
      }
    };
    fetchPoItems();
  }, []);

  // Add invoice item
  const addItem = () => {
    setItemModalOpen(true);
    setItemForm({
      po_item_id: "",
      stock_number: "",
      item_name: "",
      po_description: "",
      sale_description: "",
      sale_amount: "",
      discount: "",
      discount_details: "",
      load_status: "pending",
      load_date: ""
    });
  };

  // Handle PO Item selection
  const handlePoItemSelect = (poItemId) => {
    const selectedPoItem = poItems.find(item => item.id === parseInt(poItemId));
    if (selectedPoItem) {
      setItemForm({
        ...itemForm,
        po_item_id: poItemId,
        stock_number: selectedPoItem.stock_number || "",
        item_name: selectedPoItem.item_name || selectedPoItem.stock_item?.name || "",
        po_description: selectedPoItem.po_description || selectedPoItem.item_name || "",
        sale_description: selectedPoItem.po_description || selectedPoItem.item_name || ""
      });
    } else {
      setItemForm({
        ...itemForm,
        po_item_id: poItemId,
        stock_number: "",
        item_name: "",
        po_description: "",
        sale_description: ""
      });
    }
  };

  // Save item from modal
  const saveItem = () => {
    if (!itemForm.po_item_id || !itemForm.sale_amount) {
      showError("Please select a PO Item and enter Sale Amount");
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, { ...itemForm }]
    });
    setItemModalOpen(false);
  };

  // Remove invoice item
  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({...formData, items: newItems});
  };

  // Add payment row
  const addPayment = () => {
    setPaymentModalOpen(true);
    setPaymentForm({
      payment_method: "cash",
      payment_date: new Date().toISOString().split('T')[0],
      payment_amount: "",
      payment_notes: ""
    });
  };

  // Save payment from modal
  const savePayment = () => {
    if (!paymentForm.payment_amount || parseFloat(paymentForm.payment_amount) <= 0) {
      showError("Please enter a valid payment amount");
      return;
    }

    setFormData({
      ...formData,
      payments: [...formData.payments, { ...paymentForm }]
    });
    setPaymentModalOpen(false);
  };

  // Remove payment row
  const removePayment = (index) => {
    const newPayments = formData.payments.filter((_, i) => i !== index);
    setFormData({...formData, payments: newPayments});
  };

  // Distribute payment across items based on formula
  // paid amount of item = (item sale amount / total invoice sale amount) * current payment
  // This is now handled in the totals useMemo above

  // Submit form
  const handleSubmit = async () => {
    if(!formData.invoice_number || !formData.customer_id || !formData.invoice_date) {
      showError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        create_invoice: {
          invoice_number: formData.invoice_number.trim(),
          customer_id: parseInt(formData.customer_id),
          invoice_date: formData.invoice_date,
          invoice_status: formData.invoice_status,
          overall_load_status: formData.overall_load_status,
          invoice_notes: formData.invoice_notes?.trim() || null,
        },
        create_items: formData.items.map(item => ({
          po_item_id: parseInt(item.po_item_id),
          sale_description: item.sale_description || null,
          sale_amount: parseFloat(item.sale_amount) || 0,
          discount: parseFloat(item.discount) || 0,
          discount_details: item.discount_details || null,
          load_status: item.load_status,
          load_date: item.load_date ? item.load_date.split('T')[0] : null
        })),
        create_payments: formData.payments.map(payment => ({
          payment_date: payment.payment_date,
          payment_amount: parseFloat(payment.payment_amount) || 0,
          payment_method: payment.payment_method,
          payment_notes: payment.payment_notes || null
        })),
        update_items: [],
        delete_item_ids: [],
        update_payments: [],
        delete_payment_ids: []
      };

      await invoiceService.saveGranular(payload);
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
                  {customer.label || customer.full_name || customer.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Customer Details */}
        {selectedCustomer && (selectedCustomer.full_name || selectedCustomer.customer_code) && (
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
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Discount Details</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Paid Amt</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Load Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Load Date & Time</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {totals.itemsWithPaidAmounts.map((item, index) => {
                    const netAmount = (parseFloat(item.sale_amount) || 0) - (parseFloat(item.discount) || 0);
                    return (
                      <tr key={index} className="border-b border-gray-100 dark:border-zinc-800/50">
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{item.stock_number || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.item_name || item.item_description || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.sale_description || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(item.sale_amount)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-red-600 dark:text-red-400">{formatCurrency(item.discount)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.discount_details || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {item.paid_amount_calculated ? formatCurrency(item.paid_amount_calculated) : formatCurrency(0)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                            item.load_status === 'delivered' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : item.load_status === 'loaded'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {item.load_status === 'pending' ? 'Pending' : item.load_status === 'loaded' ? 'Loaded' : 'Delivered'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.load_date ? new Date(item.load_date).toLocaleString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </span>
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
                    );
                  })}
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
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                            {payment.payment_method.replace('_', ' ')}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          {new Date(payment.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-black text-green-600 dark:text-green-400">
                          {formatCurrency(payment.payment_amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.payment_notes || '-'}
                        </span>
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

      {/* Add Item Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-2xl border border-gray-100 dark:border-zinc-800 shadow-2xl">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black dark:text-white">Add Invoice Item</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the item details</p>
                </div>
                <button
                  onClick={() => setItemModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <FormField label="Select PO Item" required>
                  <select 
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                    value={itemForm.po_item_id}
                    onChange={(e) => handlePoItemSelect(e.target.value)}
                    disabled={poItemsLoading}
                  >
                    <option value="">
                      {poItemsLoading ? 'Loading items...' : poItems.length === 0 ? 'No items available' : 'Select a PO Item...'}
                    </option>
                    {poItems.map(poItem => (
                      <option key={poItem.id} value={poItem.id}>
                        {poItem.item_name || poItem.label || poItem.po_description} - {poItem.stock_number}
                      </option>
                    ))}
                  </select>
                  {poItemsLoading && <p className="text-xs text-gray-500 mt-1">Loading items...</p>}
                  {!poItemsLoading && poItems.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">No PO items found. Please add items to purchase orders first.</p>
                  )}
                  {!poItemsLoading && poItems.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{poItems.length} items available</p>
                  )}
                </FormField>

                {itemForm.po_item_id && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Selected Item Details</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Stock #</p>
                        <p className="font-bold text-gray-900 dark:text-white">{itemForm.stock_number || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Item</p>
                        <p className="font-bold text-gray-900 dark:text-white">{itemForm.item_name || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Sale Amount" required>
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                      value={itemForm.sale_amount}
                      onChange={(e) => setItemForm({...itemForm, sale_amount: e.target.value})}
                    />
                  </FormField>

                  <FormField label="Discount">
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                      value={itemForm.discount}
                      onChange={(e) => setItemForm({...itemForm, discount: e.target.value})}
                    />
                  </FormField>
                </div>

                <FormField label="Sale Description">
                  <input 
                    type="text"
                    placeholder="Item sale description"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                    value={itemForm.sale_description}
                    onChange={(e) => setItemForm({...itemForm, sale_description: e.target.value})}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Discount Details">
                    <input 
                      type="text"
                      placeholder="Optional discount details"
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                      value={itemForm.discount_details}
                      onChange={(e) => setItemForm({...itemForm, discount_details: e.target.value})}
                    />
                  </FormField>

                  <FormField label="Load Status">
                    <select 
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                      value={itemForm.load_status}
                      onChange={(e) => setItemForm({...itemForm, load_status: e.target.value})}
                    >
                      <option value="pending">Pending</option>
                      <option value="loaded">Loaded</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Load Date & Time">
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                    value={itemForm.load_date}
                    onChange={(e) => setItemForm({...itemForm, load_date: e.target.value})}
                  />
                </FormField>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={saveItem}
                  className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-[15px] font-bold text-sm hover:opacity-90 transition-all"
                >
                  Add Item
                </button>
                <button 
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 dark:text-gray-400 rounded-[15px] font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] w-full max-w-lg border border-gray-100 dark:border-zinc-800 shadow-2xl">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black dark:text-white">Add Payment</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Record a payment for this invoice</p>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <FormField label="Payment Date" required>
                  <input 
                    type="date"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_date: e.target.value})}
                  />
                </FormField>

                <FormField label="Amount (AED)" required>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                    value={paymentForm.payment_amount}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_amount: e.target.value})}
                  />
                </FormField>

                <FormField label="Payment Method" required>
                  <select 
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
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
                    value={paymentForm.payment_notes}
                    onChange={(e) => setPaymentForm({...paymentForm, payment_notes: e.target.value})}
                  />
                </FormField>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={savePayment}
                  className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black rounded-[15px] font-bold text-sm hover:opacity-90 transition-all"
                >
                  Add Payment
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 dark:text-gray-400 rounded-[15px] font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
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

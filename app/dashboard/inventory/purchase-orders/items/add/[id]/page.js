"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Package, Hash, FileText, Building2, Box, RefreshCw } from "lucide-react";
import { poItemService } from "@/app/lib/services/poItemService";
import { purchaseOrderService } from "@/app/lib/services/purchaseOrderService";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { useToast } from "@/app/components/Toast";

export default function AddPOItemPage({ params }) {
  const [poId, setPoId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      setPoId(resolvedParams.id);
    });
  }, [params]);

  const [submitting, setSubmitting] = useState(false);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [allPoItems, setAllPoItems] = useState([]);
  const [poItemsLoaded, setPoItemsLoaded] = useState(false);
  const [stockNumberTouched, setStockNumberTouched] = useState(false);
  const { success, error: showError } = useToast();

  const { branches: apiBranches } = useBranches(1, 10, true);
  const { stockItems: apiStockItems } = useStockItems(1, 10, null, true);

  const branches = useMemo(() => Array.isArray(apiBranches) ? apiBranches : [], [apiBranches]);
  const stockItems = useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);

  const [formData, setFormData] = useState({
    stock_number: "",
    item_id: "",
    po_description: "",
    stock_notes: "",
    current_branch_id: "",
    status: "in_stock",
    quantity: 1
  });

  const normalizeStockNumber = (stockNumber) => (stockNumber || "").trim().toUpperCase();
  const padNumber = (value, size) => String(value).padStart(size, "0");
  const getBranchCode = (branchId = formData.current_branch_id) => {
    const branch = branches.find(b => String(b.id) === String(branchId));
    const fallback = branch?.label || branch?.branch_name || "STK";
    return normalizeStockNumber(branch?.branch_code || branch?.code || fallback)
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 3) || "STK";
  };

  const getPoSegment = () => {
    const rawPoId = purchaseOrder?.po_id || poId || "0";
    const numericPart = String(rawPoId).match(/\d+/g)?.join("") || poId || "0";
    return padNumber(numericPart, 3).slice(-3);
  };

  const generateStockNumber = (branchId = formData.current_branch_id, items = allPoItems) => {
    const branchCode = getBranchCode(branchId);
    const poSegment = getPoSegment();
    const prefix = `${branchCode}-${poSegment}-`;
    const existingStockNumbers = new Set(items.map(item => normalizeStockNumber(item.stock_number)));
    const maxSequence = items.reduce((max, item) => {
      const stockNumber = normalizeStockNumber(item.stock_number);
      if (!stockNumber.startsWith(prefix)) return max;
      const sequence = parseInt(stockNumber.slice(prefix.length), 10);
      return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
    }, 0);

    let nextSequence = maxSequence + 1;
    let nextStockNumber = `${prefix}${padNumber(nextSequence, 6)}`;
    while (existingStockNumbers.has(nextStockNumber)) {
      nextSequence += 1;
      nextStockNumber = `${prefix}${padNumber(nextSequence, 6)}`;
    }

    return nextStockNumber;
  };

  const refreshStockNumber = (branchId = formData.current_branch_id) => {
    setFormData(prev => ({
      ...prev,
      stock_number: generateStockNumber(branchId),
    }));
    setStockNumberTouched(true);
  };

  const stockNumberExists = async (stockNumber) => {
    try {
      await poItemService.getByStockNumber(stockNumber);
      return true;
    } catch (err) {
      return false;
    }
  };

  const getUniqueStockNumber = async (branchId = formData.current_branch_id) => {
    const response = await poItemService.getAll(1, 5000);
    let latestItems = response?.data || response || [];
    let stockNumber = generateStockNumber(branchId, latestItems);
    let attempts = 0;

    while (attempts < 50 && await stockNumberExists(stockNumber)) {
      latestItems = [...latestItems, { stock_number: stockNumber }];
      stockNumber = generateStockNumber(branchId, latestItems);
      attempts += 1;
    }

    if (attempts >= 50) {
      throw new Error("Could not generate a unique stock number. Please try again.");
    }

    return { stockNumber, latestItems };
  };

  useEffect(() => {
    if (!poId) return;

    const loadPurchaseOrder = async () => {
      try {
        const poData = await purchaseOrderService.getById(poId);
        setPurchaseOrder(poData);
        if (poData?.arrival_branch_id) {
          setFormData(prev => ({
            ...prev,
            current_branch_id: prev.current_branch_id || String(poData.arrival_branch_id),
          }));
        }
      } catch (err) {
        console.error("Failed to load purchase order for stock number generation:", err);
      }
    };

    loadPurchaseOrder();
  }, [poId]);

  useEffect(() => {
    const loadPoItems = async () => {
      const response = await poItemService.getAll(1, 1000);
      const items = response?.data || response || [];
      setAllPoItems(items);
      setPoItemsLoaded(true);
    };

    loadPoItems();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const stockNumber = (formData.stock_number || "").trim().toUpperCase();
    if (!stockNumber) {
      showError("Stock Number is required");
      setSubmitting(false);
      return;
    }

    try {
      // Check if the stock number already exists in the system
      const exists = await stockNumberExists(stockNumber);
      if (exists) {
        showError(`Stock Number "${stockNumber}" already exists. Please enter a unique stock number.`);
        setSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        stock_number: stockNumber,
        po_id: parseInt(poId),
        item_id: parseInt(formData.item_id),
        current_branch_id: parseInt(formData.current_branch_id),
        quantity: parseInt(formData.quantity)
      };

      await poItemService.create(payload);
      success("Item added successfully");

      // Auto-update purchase order status to Saved & Published
      try {
        const poData = await purchaseOrderService.getById(poId);
        if (poData && poData.status !== 'saved_published') {
          await purchaseOrderService.update(poId, {
            po_id: poData.po_id,
            container_id: poData.container_id,
            supplier_id: poData.supplier_id,
            arrival_date: poData.arrival_date,
            arrival_branch_id: poData.arrival_branch_id,
            total_container_revenue: poData.total_container_revenue,
            items_in_stock: poData.items_in_stock,
            status: "saved_published",
            notes: poData.notes
          });
        }
      } catch (statusErr) {
        console.error("Auto-status transition failed:", statusErr);
      }

      router.push(`/dashboard/inventory/purchase-orders/items/${poId}`);
    } catch (err) {
      showError(err.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-500 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/inventory/purchase-orders/items/${poId}`}
          className="flex items-center justify-center w-10 h-10 rounded-[15px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Add New Item</h1>
          <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Add a new item to PO #{poId}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Stock Number" required>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Stock Number..."
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-black tracking-wider focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white uppercase"
                  value={formData.stock_number}
                  onChange={(e) => setFormData({ ...formData, stock_number: e.target.value })}
                  required
                />
              </div>
            </FormField>

            <FormField label="Category" required>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                  value={formData.item_id}
                  onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                  required
                >
                  <option value="">Select Item Category</option>
                  {stockItems.map(si => <option key={si.id} value={si.id}>{si.label || si.name}</option>)}
                </select>
              </div>
            </FormField>

            <FormField label="Current Branch / Warehouse" required>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                  value={formData.current_branch_id}
                  onChange={(e) => {
                    const branchId = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      current_branch_id: branchId,
                    }));
                  }}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.label || b.branch_name}</option>)}
                </select>
              </div>
            </FormField>

            <FormField label="Quantity" required>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  placeholder="1"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
            </FormField>

            <FormField label="Status" required>
              <select
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="in_stock">In Stock</option>
                <option value="sold">Sold</option>
                <option value="reserved">Reserved</option>
                <option value="damaged">Damaged</option>
              </select>
            </FormField>
          </div>

          <FormField label="Order Description">
            <div className="relative">
              <FileText className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. Engine Block - High quality part"
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white"
                value={formData.po_description}
                onChange={(e) => setFormData({ ...formData, po_description: e.target.value })}
              />
            </div>
          </FormField>

          <FormField label="Internal Item Notes">
            <div className="relative">
              <FileText className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
              <textarea
                rows="4"
                placeholder="Enter any internal notes about this specific part..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white resize-none"
                value={formData.stock_notes}
                onChange={(e) => setFormData({ ...formData, stock_notes: e.target.value })}
              />
            </div>
          </FormField>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-[15px] font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Adding...' : 'Add Item'}</span>
            </button>

            <Link
              href={`/dashboard/inventory/purchase-orders/items/${poId}`}
              className="px-6 py-3 text-gray-500 dark:text-gray-400 rounded-[15px] font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
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

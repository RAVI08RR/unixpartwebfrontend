"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Scissors, X, Printer, Download, Save, Plus, Trash2, Box 
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useStockItems } from "@/app/lib/hooks/useStockItems";
import { useBranches } from "@/app/lib/hooks/useBranches";
import { poItemService } from "@/app/lib/services/poItemService";
import { useToast } from "@/app/components/Toast";
import PrintableLabel from "./PrintableLabel";

export default function DismantleModal({ isOpen, onClose, item, onSuccess }) {
  const { success, error: showError } = useToast();
  const [dismantleTableItems, setDismantleTableItems] = useState([]);
  const [selectedStockItemId, setSelectedStockItemId] = useState("");
  const [qtyInput, setQtyInput] = useState(1);
  const [saving, setSaving] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Printing label state
  const [printLabelModalOpen, setPrintLabelModalOpen] = useState(false);
  const [labelSize, setLabelSize] = useState({ width: 2.25, height: 1.25 });
  const [labelStyles] = useState({
    branch: { fontSize: 10, bold: false, underline: false },
    supplier: { fontSize: 10, bold: false, underline: false },
    container: { fontSize: 10, bold: false, underline: false },
    stockNumber: { fontSize: 14, bold: true, underline: false },
    item: { fontSize: 10, bold: false, underline: false },
    poDescription: { fontSize: 10, bold: false, underline: false },
    qrSize: 50,
  });
  const printRef = useRef();

  // Load stock item categories and branches
  const { stockItems: apiStockItems, isLoading: loadingStockItems } = useStockItems(0, 100, null, true);
  const { branches: apiBranches } = useBranches(0, 100, true);

  const stockItemsList = useMemo(() => {
    if (!apiStockItems) return [];
    return Array.isArray(apiStockItems) ? apiStockItems : (apiStockItems?.stock_items || []);
  }, [apiStockItems]);

  const branchList = useMemo(() => {
    return Array.isArray(apiBranches) ? apiBranches : [];
  }, [apiBranches]);

  // Find parent category name
  const parentCategoryName = useMemo(() => {
    if (!item) return "";
    if (item.stock_item?.name) return item.stock_item.name;
    const matched = stockItemsList.find(si => String(si.id) === String(item.item_id));
    return matched?.label || matched?.name || "Parent Item";
  }, [item, stockItemsList]);

  // Find parent branch code
  const parentBranchCode = useMemo(() => {
    if (!item) return "N/A";
    const branch = branchList.find(b => String(b.id) === String(item.current_branch_id));
    return item.current_branch?.branch_code || item.container?.destination_branch?.branch_code || branch?.branch_code || "AUH";
  }, [item, branchList]);

  // Reset local state when item changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setDismantleTableItems([]);
      setSelectedStockItemId("");
      setQtyInput(1);
      setSelectedRows([]);
    }
  }, [isOpen, item]);

  // Add and commit sub-items to preview table
  const handleAddSubItems = (e) => {
    e.preventDefault();
    if (!selectedStockItemId) {
      showError("Please choose an item category first.");
      return;
    }
    const selectedItemObj = stockItemsList.find(si => String(si.id) === String(selectedStockItemId));
    if (!selectedItemObj) return;

    const count = parseInt(qtyInput) || 1;
    const newItems = [];
    
    // Suffix based on current table length
    const startIndex = dismantleTableItems.length;

    for (let i = 0; i < count; i++) {
      const indexSuffix = startIndex + i + 1;
      newItems.push({
        temp_id: `${selectedStockItemId}-${Date.now()}-${i}`,
        item_id: selectedItemObj.id,
        item_name: selectedItemObj.label || selectedItemObj.name || "Unknown Item",
        po_description: `Dismantled from ${parentCategoryName}`,
        quantity: 1,
        branch_code: parentBranchCode,
        status: "In Stock",
        sale_amount: "-",
        invoice_num: "-",
        sale_date: "-",
        expected_stock_number: `${item.stock_number}-${indexSuffix}`
      });
    }

    setDismantleTableItems(prev => [...prev, ...newItems]);
    setQtyInput(1);
    setSelectedStockItemId("");
    success(`Added ${count} ${selectedItemObj.label || selectedItemObj.name || "item"} to list`);
  };

  // Remove individual row
  const handleRemoveRow = (tempId) => {
    setDismantleTableItems(prev => {
      const updated = prev.filter(t => t.temp_id !== tempId);
      // Re-index suffixes so stock numbers are contiguous
      return updated.map((t, index) => ({
        ...t,
        expected_stock_number: `${item.stock_number}-${index + 1}`
      }));
    });
    setSelectedRows(prev => prev.filter(id => id !== tempId));
  };

  // Select / deselect row
  const handleSelectRow = (tempId) => {
    setSelectedRows(prev =>
      prev.includes(tempId) ? prev.filter(id => id !== tempId) : [...prev, tempId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === dismantleTableItems.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(dismantleTableItems.map(t => t.temp_id));
    }
  };

  // Group child items to matching API payload formats
  const handleSave = async () => {
    if (dismantleTableItems.length === 0) {
      showError("Please add at least one sub-item to dismantle.");
      return;
    }

    setSaving(true);
    try {
      const child_items = [];
      dismantleTableItems.forEach(t => {
        const existing = child_items.find(c => String(c.item_id) === String(t.item_id));
        if (existing) {
          existing.quantity += t.quantity || 1;
        } else {
          child_items.push({
            item_id: parseInt(t.item_id, 10),
            quantity: t.quantity || 1
          });
        }
      });

      console.log("Saving dismantle. Parent ID:", item.id, "Payload:", { parent_item_id: item.id, child_items });
      const res = await poItemService.dismantle(item.id, { child_items });
      success(res?.message || "Item dismantled successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showError(err.message || "Failed to dismantle item.");
    } finally {
      setSaving(false);
    }
  };

  // Export Table Data to CSV
  const handleExportData = () => {
    if (dismantleTableItems.length === 0) {
      showError("No data to export");
      return;
    }
    const headers = ["New Stock Number", "Item Category", "PO Description", "Qty", "Branch", "Status"];
    const rows = dismantleTableItems.map(t => [
      t.expected_stock_number,
      t.item_name,
      t.po_description,
      t.quantity,
      t.branch_code,
      t.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dismantle-${item.stock_number}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Exported CSV successfully");
  };

  // Print Labels
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Dismantle-Labels-${item?.stock_number}`,
    preserveAfterPrint: true,
    onAfterPrint: () => {
      setPrintLabelModalOpen(false);
      success("Labels sent to printer!");
    },
  });

  const handlePrintLabelsClick = () => {
    if (selectedRows.length === 0) {
      showError("Please select at least one item to print labels");
      return;
    }
    setPrintLabelModalOpen(true);
  };

  const getPrintData = () => {
    return dismantleTableItems
      .filter(t => selectedRows.includes(t.temp_id))
      .map(t => ({
        id: t.temp_id,
        stock_number: t.expected_stock_number,
        item_name: t.item_name,
        po_description: t.po_description,
        branch_code: t.branch_code,
        supplier_code: item.stock_number?.split("-")[1] || "",
        container_number: item.purchase_order?.container_number || "",
        qr_data: `${window.location.origin}/dashboard/inventory/all-inventory/view/${t.expected_stock_number}`,
      }));
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-[24px] shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-zinc-800 flex flex-col scrollbar-hide"
      >
        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between gap-6 shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
              <Scissors className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Dismantling Item: <span className="text-blue-600 font-black">{item.stock_number}</span>
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium mt-1">
                Add new items from <span className="font-bold">"{parentCategoryName}"</span>. These will be linked to the parent.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Total Revenue Indicator */}
            <div className="text-right pr-4 md:border-r border-gray-200 dark:border-zinc-850">
              <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                Total Dismantle Revenue
              </p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
                AED 0.00
              </p>
            </div>

            {/* Actions Buttons */}
            <button
              onClick={handlePrintLabelsClick}
              disabled={selectedRows.length === 0}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                selectedRows.length > 0 
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700" 
                  : "bg-gray-50 dark:bg-zinc-850 text-gray-300 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              <Printer className="w-4 h-4" />
              Print Labels {selectedRows.length > 0 && `(${selectedRows.length})`}
            </button>

            <button
              onClick={handleExportData}
              disabled={dismantleTableItems.length === 0}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                dismantleTableItems.length > 0 
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700" 
                  : "bg-gray-50 dark:bg-zinc-850 text-gray-300 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>

            <button
              onClick={handleSave}
              disabled={saving || dismantleTableItems.length === 0}
              className={`px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </button>

            <button 
              onClick={onClose}
              className="p-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-750 text-gray-400 hover:text-gray-750 dark:hover:text-white rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Add Parts */}
        <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-zinc-900/40 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <form onSubmit={handleAddSubItems} className="max-w-4xl flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                Choose Item
              </label>
              <select
                required
                value={selectedStockItemId}
                onChange={(e) => setSelectedStockItemId(e.target.value)}
                disabled={loadingStockItems}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer text-gray-900 dark:text-white"
              >
                <option value="">Choose item category...</option>
                {stockItemsList.map((si) => (
                  <option key={si.id} value={si.id}>
                    {si.label || si.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-32 space-y-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                Enter Qty
              </label>
              <input
                type="number"
                required
                min="1"
                max="50"
                value={qtyInput}
                onChange={(e) => setQtyInput(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/10 active:scale-95 shrink-0 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add and Commit Parts to Inventory
            </button>
          </form>
        </div>

        {/* Parts Table */}
        <div className="flex-1 overflow-x-auto min-h-[250px] p-6 md:p-8">
          {dismantleTableItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-850 rounded-2xl flex items-center justify-center mb-4">
                <Box className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
              </div>
              <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                No Sub-Items Added Yet
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 max-w-xs">
                Select an item and quantity above to commit recovery parts.
              </p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800">
                  <th className="py-4 px-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === dismantleTableItems.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-4 px-4 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    New Stock Number
                  </th>
                  <th className="py-4 px-4 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="py-4 px-4 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    PO Description
                  </th>
                  <th className="py-4 px-4 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="py-4 px-4 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="py-4 px-4 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-4 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Sale Amount
                  </th>
                  <th className="py-4 px-4 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="py-4 px-4 text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    Sale Date
                  </th>
                  <th className="py-4 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-850">
                {dismantleTableItems.map((row) => {
                  const isChecked = selectedRows.includes(row.temp_id);
                  return (
                    <tr 
                      key={row.temp_id}
                      className={`group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors ${
                        isChecked ? "bg-blue-50/20 dark:bg-blue-900/5" : ""
                      }`}
                    >
                      <td className="py-4 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(row.temp_id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-sm text-gray-900 dark:text-white">
                        {row.expected_stock_number}
                      </td>
                      <td className="py-4 px-4 font-semibold text-sm text-gray-700 dark:text-zinc-300">
                        {row.item_name}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {row.po_description}
                      </td>
                      <td className="py-4 px-4 font-bold text-sm text-gray-700 dark:text-zinc-350">
                        {row.quantity}
                      </td>
                      <td className="py-4 px-4 font-bold text-xs text-blue-600 dark:text-blue-400">
                        {row.branch_code}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">
                        {row.sale_amount}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">
                        {row.invoice_num}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-400">
                        {row.sale_date}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleRemoveRow(row.temp_id)}
                          className="p-1.5 text-gray-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Hidden label element used for printing */}
      <div className="hidden">
        <PrintableLabel 
          ref={printRef} 
          items={getPrintData()} 
          styles={labelStyles} 
          labelSize={labelSize} 
        />
      </div>

      {/* Printing Modal */}
      {printLabelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold dark:text-white">Print Dismantle Labels</h3>
                <p className="text-xs text-gray-500 mt-1">Set the dimensions for barcode label printing.</p>
              </div>
              <button 
                onClick={() => setPrintLabelModalOpen(false)} 
                className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-gray-250 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Label Width (in)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={labelSize.width}
                  onChange={(e) => setLabelSize(prev => ({ ...prev, width: parseFloat(e.target.value) || 2.25 }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Label Height (in)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={labelSize.height}
                  onChange={(e) => setLabelSize(prev => ({ ...prev, height: parseFloat(e.target.value) || 1.25 }))}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-250 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setPrintLabelModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all"
              >
                Print Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

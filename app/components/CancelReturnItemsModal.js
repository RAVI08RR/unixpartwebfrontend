"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

const CancelReturnItemsModal = ({ isOpen, onClose, invoice }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [retainedProfit, setRetainedProfit] = useState(0);

  if (!isOpen) return null;

  const invoiceItems = invoice?.invoice_items || invoice?.items || [];

  const handleItemSelect = (item) => {
    setSelectedItemDetails(item);
    // Initialize with item's sale amount
    setRefundAmount(parseFloat(item.sale_amount) || 0);
    setRetainedProfit(0);
  };

  const handleConfirm = () => {
    // API call will be added later
    console.log("Cancellation confirmed:", {
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      selected_item: selectedItemDetails,
      refund_amount: refundAmount,
      retained_profit: retainedProfit,
    });
    onClose();
  };

  const totalRefund = refundAmount;
  const totalRetainedProfit = retainedProfit;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Cancel / Return Items from Invoice {invoice?.invoice_number}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select items to return and specify financial details. Un-refunded amounts will be allocated as supplier profit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Select Items */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                1. Select Items to Return
              </h3>
              
              <div className="space-y-3">
                {invoiceItems.length > 0 ? (
                  invoiceItems.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleItemSelect(item)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedItemDetails?.id === item.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                          : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {item.item_name || item.po_item?.stock_item?.name || "Item"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Stock #: {item.stock_number || item.po_item?.stock_number || "-"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Sale Amount: AED {parseFloat(item.sale_amount || 0).toFixed(2)}
                          </p>
                        </div>
                        {selectedItemDetails?.id === item.id && (
                          <div className="ml-2">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No items found in this invoice
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Refund Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                2. Specify Refund & Profit Details
              </h3>

              {selectedItemDetails ? (
                <div className="space-y-4">
                  {/* Selected Item Info */}
                  <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Selected Item
                    </p>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                      {selectedItemDetails.item_name || selectedItemDetails.po_item?.stock_item?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Stock #: {selectedItemDetails.stock_number || selectedItemDetails.po_item?.stock_number}
                    </p>
                  </div>

                  {/* Refund Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Refund Amount (AED)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Retained Profit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Retained Profit (AED)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={retainedProfit}
                      onChange={(e) => setRetainedProfit(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Total Refund:
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        AED {totalRefund.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Total Retained Profit:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        AED {totalRetainedProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <p className="text-sm">Select an item from the left to specify details.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedItemDetails}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelReturnItemsModal;

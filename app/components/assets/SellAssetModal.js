"use client";

import React, { useState } from "react";
import { X, DollarSign, Calendar, User, FileText, TrendingUp } from "lucide-react";

export default function SellAssetModal({ isOpen, onClose, asset, onSell, isLoading }) {
  const [formData, setFormData] = useState({
    sale_price: "",
    sale_date: new Date().toISOString().split('T')[0],
    buyer_name: "",
    buyer_contact: "",
    buyer_address: "",
    payment_method: "cash",
    disposal_reason: "sold",
    disposal_action: "sale",
    notes: ""
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sale_price || parseFloat(formData.sale_price) <= 0) {
      newErrors.sale_price = "Sale price is required and must be greater than 0";
    }

    if (!formData.sale_date) {
      newErrors.sale_date = "Sale date is required";
    }

    if (!formData.buyer_name || formData.buyer_name.trim() === "") {
      newErrors.buyer_name = "Buyer name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const saleData = {
      disposal_reason: formData.disposal_reason,
      disposal_action: formData.disposal_action,
      estimated_value: parseFloat(asset?.current_value || asset?.purchase_price || 0),
      sale_date: formData.sale_date,
      sale_price: parseFloat(formData.sale_price),
      buyer_name: formData.buyer_name.trim(),
      buyer_contact: formData.buyer_contact.trim() || null,
      buyer_address: formData.buyer_address.trim() || null,
      book_value: parseFloat(asset?.current_value || asset?.purchase_price || 0),
      approved_by: null,
      approval_date: formData.sale_date,
      notes: formData.notes.trim() || null
    };

    try {
      await onSell(saleData);
      // Reset form on success
      setFormData({
        sale_price: "",
        sale_date: new Date().toISOString().split('T')[0],
        buyer_name: "",
        buyer_contact: "",
        buyer_address: "",
        payment_method: "cash",
        disposal_reason: "sold",
        disposal_action: "sale",
        notes: ""
      });
      setErrors({});
    } catch (err) {
      // Error is handled by parent component
      console.error("Sell asset error:", err);
    }
  };

  const handleClose = () => {
    setFormData({
      sale_price: "",
      sale_date: new Date().toISOString().split('T')[0],
      buyer_name: "",
      buyer_contact: "",
      buyer_address: "",
      payment_method: "cash",
      disposal_reason: "sold",
      disposal_action: "sale",
      notes: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const purchasePrice = parseFloat(asset?.purchase_price || 0);
  const salePrice = parseFloat(formData.sale_price || 0);
  const profitLoss = salePrice - purchasePrice;
  const profitLossPercentage = purchasePrice > 0 ? ((profitLoss / purchasePrice) * 100).toFixed(2) : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-2xl animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-black dark:text-white tracking-tight">Sell Asset</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {asset?.asset_id} - {asset?.asset_name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Asset Info Summary */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-1">
                  Purchase Price
                </p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                  AED {purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider mb-1">
                  Current Value
                </p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                  AED {parseFloat(asset?.current_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sale Price */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Sale Price (AED) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border ${
                    errors.sale_price ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800'
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              {errors.sale_price && (
                <p className="text-xs text-red-500 font-medium">{errors.sale_price}</p>
              )}
            </div>

            {/* Sale Date */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Sale Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border ${
                    errors.sale_date ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800'
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                  value={formData.sale_date}
                  onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              {errors.sale_date && (
                <p className="text-xs text-red-500 font-medium">{errors.sale_date}</p>
              )}
            </div>

            {/* Buyer Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Buyer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter buyer name"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border ${
                    errors.buyer_name ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800'
                  } rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all`}
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              {errors.buyer_name && (
                <p className="text-xs text-red-500 font-medium">{errors.buyer_name}</p>
              )}
            </div>

            {/* Buyer Contact */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Buyer Contact <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Phone or email"
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={formData.buyer_contact}
                onChange={(e) => setFormData({ ...formData, buyer_contact: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Buyer Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Buyer Address <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Enter buyer address"
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={formData.buyer_address}
                onChange={(e) => setFormData({ ...formData, buyer_address: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['cash', 'bank_transfer', 'cheque', 'other'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_method: method })}
                    disabled={isLoading}
                    className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      formData.payment_method === method
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {method.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profit/Loss Indicator */}
          {formData.sale_price && (
            <div className={`p-4 rounded-xl border-2 ${
              profitLoss >= 0 
                ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: profitLoss >= 0 ? '#16a34a' : '#dc2626' }}>
                    {profitLoss >= 0 ? 'Profit' : 'Loss'}
                  </p>
                  <p className="text-2xl font-black" style={{ color: profitLoss >= 0 ? '#16a34a' : '#dc2626' }}>
                    {profitLoss >= 0 ? '+' : ''}AED {Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: profitLoss >= 0 ? '#16a34a' : '#dc2626' }}>
                    Margin
                  </p>
                  <p className="text-2xl font-black" style={{ color: profitLoss >= 0 ? '#16a34a' : '#dc2626' }}>
                    {profitLoss >= 0 ? '+' : ''}{profitLossPercentage}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                placeholder="Additional notes about the sale..."
                rows={3}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Confirm Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

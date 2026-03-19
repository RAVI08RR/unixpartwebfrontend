"use client";

import React from "react";
import { X, DollarSign, Calendar, User, Phone, CreditCard, FileText, TrendingUp, TrendingDown, Package } from "lucide-react";

export default function SaleDetailsModal({ isOpen, onClose, asset, saleDetails }) {
  if (!isOpen || !saleDetails) return null;

  const purchasePrice = parseFloat(asset?.purchase_price || 0);
  const salePrice = parseFloat(saleDetails?.sale_price || 0);
  const profitLoss = salePrice - purchasePrice;
  const profitLossPercentage = purchasePrice > 0 ? ((profitLoss / purchasePrice) * 100).toFixed(2) : 0;
  const isProfitable = profitLoss >= 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-2xl animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isProfitable 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                {isProfitable ? (
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-black dark:text-white tracking-tight">Sale Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {asset?.asset_id} - {asset?.asset_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profit/Loss Summary */}
          <div className={`p-6 rounded-xl border-2 ${
            isProfitable 
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Purchase Price
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  AED {purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Sale Price
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">
                  AED {salePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: isProfitable ? '#16a34a' : '#dc2626' }}>
                  {isProfitable ? 'Profit' : 'Loss'}
                </p>
                <p className="text-2xl font-black" style={{ color: isProfitable ? '#16a34a' : '#dc2626' }}>
                  {isProfitable ? '+' : ''}AED {Math.abs(profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm font-bold mt-1" style={{ color: isProfitable ? '#16a34a' : '#dc2626' }}>
                  {isProfitable ? '+' : ''}{profitLossPercentage}% margin
                </p>
              </div>
            </div>
          </div>

          {/* Sale Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sale Date */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sale Date
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {saleDetails.sale_date ? new Date(saleDetails.sale_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Method
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {saleDetails.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer Name */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Buyer Name
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {saleDetails.buyer_name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer Contact */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Buyer Contact
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {saleDetails.buyer_contact || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Information */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                Asset Information
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Asset ID</p>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{asset?.asset_id}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Category</p>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">{asset?.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Purchase Date</p>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  {asset?.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Status</p>
                <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                  SOLD
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {saleDetails.notes && (
            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sale Notes
                </p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {saleDetails.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <span>
              Sale recorded: {saleDetails.created_at ? new Date(saleDetails.created_at).toLocaleString() : 'N/A'}
            </span>
            {saleDetails.updated_at && saleDetails.updated_at !== saleDetails.created_at && (
              <span>
                Last updated: {new Date(saleDetails.updated_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

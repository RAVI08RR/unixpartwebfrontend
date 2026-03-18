"use client";

import React from 'react';
import { X, User, Mail, Phone, Building2, MapPin, FileText, Hash, Tag, Calendar, Truck } from 'lucide-react';

const ViewSupplierModal = ({ supplier, isOpen, onClose }) => {
  if (!isOpen || !supplier) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
              <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {supplier.name || 'Supplier Details'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supplier Information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              (supplier.status === true || supplier.status === "active")
                ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                (supplier.status === true || supplier.status === "active") ? 'bg-green-600' : 'bg-red-600'
              }`}></div>
              {(supplier.status === true || supplier.status === "active") ? "Active" : "Inactive"}
            </div>
            {supplier.type && (
              <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                {supplier.type}
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-800 pb-2">
                Basic Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier Code</p>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {supplier.supplier_code || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier Name</p>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {supplier.name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</p>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {supplier.contact_person || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</p>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {supplier.company || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-800 pb-2">
                Contact Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {supplier.contact_email || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {supplier.contact_number || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {supplier.address || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Funds Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800/30">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              Supplier Funds Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sales</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">
                  AED 150,000.00
                </p>
              </div>
              
              <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Transferred</p>
                <p className="text-xl font-black text-green-600 dark:text-green-400">
                  AED 130,000.00
                </p>
              </div>
              
              <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expenses</p>
                <p className="text-xl font-black text-red-600 dark:text-red-400">
                  - AED 8,000.00
                </p>
              </div>
              
              <div className="bg-white dark:bg-zinc-900/50 rounded-lg p-4 border border-blue-100 dark:border-blue-800/20">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Outstanding Balance</p>
                <p className="text-xl font-black text-orange-600 dark:text-orange-400">
                  AED 12,000.00
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                💡 This is static data. API integration coming soon.
              </p>
            </div>
          </div>

          {/* Notes Section */}
          {supplier.notes && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-zinc-800 pb-2">
                Notes
              </h3>
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {supplier.notes}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(supplier.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(supplier.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSupplierModal;
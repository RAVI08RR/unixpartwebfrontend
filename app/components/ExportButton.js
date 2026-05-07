"use client";

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCSV, exportToExcel } from '@/app/lib/utils/exportUtils';

/**
 * Reusable Export Button Component with CSV and Excel options
 * @param {Array} data - Data to export
 * @param {Array} columns - Column definitions [{key, label, formatter}]
 * @param {string} filename - Base filename without extension
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export default function ExportButton({ 
  data, 
  columns, 
  filename = 'export',
  onSuccess,
  onError,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      if (!data || data.length === 0) {
        throw new Error('No data available to export');
      }
      exportToCSV(data, columns, `${filename}.csv`);
      if (onSuccess) onSuccess('CSV');
      setIsOpen(false);
    } catch (error) {
      console.error('CSV Export Error:', error);
      if (onError) onError(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      if (!data || data.length === 0) {
        throw new Error('No data available to export');
      }
      await exportToExcel(data, columns, `${filename}.xlsx`);
      if (onSuccess) onSuccess('Excel');
      setIsOpen(false);
    } catch (error) {
      console.error('Excel Export Error:', error);
      if (onError) onError(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || !data || data.length === 0}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
      </button>
      
      {isOpen && !isExporting && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="text-gray-900 dark:text-white">Export as CSV</div>
                <div className="text-xs text-gray-400 font-normal">Comma-separated values</div>
              </div>
            </button>
            
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="text-gray-900 dark:text-white">Export as Excel</div>
                <div className="text-xs text-gray-400 font-normal">Microsoft Excel format</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

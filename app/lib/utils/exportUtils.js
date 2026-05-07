/**
 * Utility functions for exporting data to various formats
 * Supports CSV and Excel (XLSX) exports
 */

/**
 * Convert data array to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions {key, label}
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, columns) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = columns.map(col => col.label || col.key).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col.key];
      
      // Handle nested objects (e.g., user.name)
      if (col.key.includes('.')) {
        const keys = col.key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], item);
      }
      
      // Handle custom formatters
      if (col.formatter && typeof col.formatter === 'function') {
        value = col.formatter(value, item);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        value = '';
      }
      
      // Convert to string and escape quotes
      value = String(value).replace(/"/g, '""');
      
      // Wrap in quotes if contains comma, newline, or quote
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }
      
      return value;
    }).join(',');
  });
  
  return [headers, ...rows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (csvContent, filename = 'export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions {key, label, formatter}
 * @param {string} filename - Name of the file to download
 */
export const exportToCSV = (data, columns, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }
  
  const csvContent = convertToCSV(data, columns);
  downloadCSV(csvContent, filename);
};

/**
 * Format date for export
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForExport = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

/**
 * Format currency for export
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: AED)
 * @returns {string} Formatted currency string
 */
export const formatCurrencyForExport = (amount, currency = 'AED') => {
  if (amount === null || amount === undefined) return '';
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
};

/**
 * Format boolean for export
 * @param {boolean} value - Boolean value
 * @returns {string} 'Yes' or 'No'
 */
export const formatBooleanForExport = (value) => {
  return value ? 'Yes' : 'No';
};

/**
 * Format status for export
 * @param {boolean|string} status - Status value
 * @returns {string} 'Active' or 'Inactive'
 */
export const formatStatusForExport = (status) => {
  if (typeof status === 'boolean') {
    return status ? 'Active' : 'Inactive';
  }
  if (typeof status === 'string') {
    return status.toLowerCase() === 'active' ? 'Active' : 'Inactive';
  }
  return 'Inactive';
};

/**
 * Export data to Excel (XLSX) file using SheetJS
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions {key, label, formatter}
 * @param {string} filename - Name of the file to download
 */
export const exportToExcel = async (data, columns, filename = 'export.xlsx') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  try {
    // Dynamically import xlsx library
    const XLSX = await import('xlsx');
    
    // Prepare data for Excel
    const excelData = data.map(item => {
      const row = {};
      columns.forEach(col => {
        let value = item[col.key];
        
        // Handle nested objects
        if (col.key.includes('.')) {
          const keys = col.key.split('.');
          value = keys.reduce((obj, key) => obj?.[key], item);
        }
        
        // Handle custom formatters
        if (col.formatter && typeof col.formatter === 'function') {
          value = col.formatter(value, item);
        }
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          value = '';
        }
        
        row[col.label || col.key] = value;
      });
      return row;
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const columnWidths = columns.map(col => ({
      wch: Math.max(
        (col.label || col.key).length,
        15 // minimum width
      )
    }));
    worksheet['!cols'] = columnWidths;
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Failed to export to Excel. Please try CSV export instead.');
  }
};

/**
 * Show export options modal and handle export
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions
 * @param {string} baseFilename - Base filename without extension
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const showExportOptions = (data, columns, baseFilename, onSuccess, onError) => {
  // This will be called from the component
  return {
    exportCSV: () => {
      try {
        exportToCSV(data, columns, `${baseFilename}.csv`);
        if (onSuccess) onSuccess('CSV');
      } catch (error) {
        if (onError) onError(error);
      }
    },
    exportExcel: async () => {
      try {
        await exportToExcel(data, columns, `${baseFilename}.xlsx`);
        if (onSuccess) onSuccess('Excel');
      } catch (error) {
        if (onError) onError(error);
      }
    }
  };
};

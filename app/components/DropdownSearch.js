"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

const DropdownSearch = ({ 
  items = [], 
  selectedItems = [], 
  onSelectionChange, 
  placeholder = "Search...", 
  buttonText = "Select Items",
  searchPlaceholder = "Search items",
  emptyMessage = "No items available",
  displayField = "name",
  valueField = "id",
  secondaryField = null,
  loading = false,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item[displayField]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (secondaryField && item[secondaryField]?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleItemToggle = (item) => {
    const itemValue = item[valueField];
    const isSelected = selectedItems.includes(itemValue);
    
    if (isSelected) {
      onSelectionChange(selectedItems.filter(id => id !== itemValue));
    } else {
      onSelectionChange([...selectedItems, itemValue]);
    }
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const getSelectedItemsText = () => {
    if (selectedItems.length === 0) return buttonText;
    if (selectedItems.length === 1) {
      const item = items.find(item => item[valueField] === selectedItems[0]);
      return item ? item[displayField] : `${selectedItems.length} selected`;
    }
    return `${selectedItems.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="inline-flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all disabled:opacity-50"
      >
        <span className="truncate">
          {loading ? "Loading..." : error ? "Error loading data" : getSelectedItemsText()}
        </span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg">
          {/* Search Input */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Items List */}
          <ul className="max-h-48 overflow-y-auto p-2 text-sm">
            {loading ? (
              <li className="p-2 text-gray-500 text-center">Loading...</li>
            ) : error ? (
              <li className="p-2 text-red-500 text-center">{error}</li>
            ) : filteredItems.length === 0 ? (
              <li className="p-2 text-gray-500 text-center">
                {searchTerm ? `No items found for "${searchTerm}"` : emptyMessage}
              </li>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItems.includes(item[valueField]);
                return (
                  <li key={item[valueField]}>
                    <div className="inline-flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleItemToggle(item)}
                        className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-black dark:focus:ring-white dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 checkbox-black"
                      />
                      <label 
                        onClick={() => handleItemToggle(item)}
                        className="w-full ml-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                      >
                        <div>{item[displayField]}</div>
                        {secondaryField && item[secondaryField] && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item[secondaryField]}
                          </div>
                        )}
                      </label>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          {/* Clear All Button */}
          {selectedItems.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center justify-center w-full px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition-colors"
              >
                <X className="w-4 h-4 mr-1.5" />
                Clear All ({selectedItems.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownSearch;
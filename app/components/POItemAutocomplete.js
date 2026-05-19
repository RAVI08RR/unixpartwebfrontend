"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Package } from "lucide-react";
import { apiClient } from "../lib/api";

export default function POItemAutocomplete({ 
  value, 
  onChange, 
  onSelect,
  placeholder = "Search PO item by stock number or name...",
  className = "",
  disabled = false,
  initialDisplayText = "" // Add this prop to show initial selected item
}) {
  const [searchQuery, setSearchQuery] = useState(initialDisplayText);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const wrapperRef = useRef(null);

  // Update search query when initialDisplayText changes
  useEffect(() => {
    if (initialDisplayText && !searchQuery) {
      setSearchQuery(initialDisplayText);
    }
  }, [initialDisplayText]);

  // Fetch PO item suggestions
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get(`/api/dropdown/po-items`, { search: query });
      // Filter out sold items
      const availableItems = Array.isArray(response) 
        ? response.filter(item => item.status !== 'sold' && item.status !== 'Sold')
        : [];
      setSuggestions(availableItems);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching PO item suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && !selectedItem) {
        fetchSuggestions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedItem]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setSelectedItem(null);
    
    if (!newValue) {
      setSuggestions([]);
      setIsOpen(false);
      onChange("");
      if (onSelect) onSelect(null);
    }
  };

  const handleSelectItem = (item) => {
    // Create a display text from available fields
    const displayText = item.stock_number 
      ? `${item.stock_number} - ${item.label || item.item_name || 'Item'}`
      : item.label || item.item_name || 'Selected Item';
    
    setSearchQuery(displayText);
    setSelectedItem(item);
    onChange(item.id);
    if (onSelect) onSelect(item);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedItem(null);
    onChange("");
    if (onSelect) onSelect(null);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-11 pr-10 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[15px] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        />
        {searchQuery && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (suggestions.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-2xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Searching...
            </div>
          ) : (
            <div className="py-2">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {item.label}
                    </p>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-0.5">
                      {item.stock_number}
                    </p>
                    {item.status && (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'in_stock' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && !loading && suggestions.length === 0 && searchQuery.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            No PO items found for "{searchQuery}"
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
            Try searching by stock number or item name
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, User } from "lucide-react";
import { apiClient } from "../lib/api";

export default function CustomerAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Search customer...",
  className = ""
}) {
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const wrapperRef = useRef(null);

  // Fetch customer suggestions
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get(`/dropdown/customers`, { search: query });
      setSuggestions(response || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching customer suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && !selectedCustomer) {
        fetchSuggestions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCustomer]);

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
    setSelectedCustomer(null);
    onChange(newValue);
    
    if (!newValue) {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSearchQuery(customer.label);
    setSelectedCustomer(customer);
    onChange(customer.label);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedCustomer(null);
    onChange("");
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
          className={`w-full pl-11 pr-10 py-3 bg-gray-50/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all ${className}`}
        />
        {searchQuery && (
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
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-2xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Loading...
            </div>
          ) : (
            <div className="py-2">
              {suggestions.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {customer.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Customer ID: {customer.id}
                    </p>
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
            No customers found for "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}

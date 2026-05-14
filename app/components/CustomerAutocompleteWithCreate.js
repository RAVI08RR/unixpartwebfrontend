"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus, User, Phone, Building2, MapPin, FileText, Loader2, Hash, Camera } from "lucide-react";
import { apiClient } from "../lib/api";
import { customerService } from "../lib/services/customerService";

export default function CustomerAutocompleteWithCreate({ 
  value, 
  onChange, 
  onCustomerSelect,
  placeholder = "Search customer by name, phone, or ID...",
  disabled = false 
}) {
  const [query, setQuery] = useState("");
  const [allCustomers, setAllCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Create customer form
  const [customerForm, setCustomerForm] = useState({
    customer_code: "",
    full_name: "",
    phone: "",
    business_name: "",
    business_number: "",
    address: "",
    notes: "",
    status: true
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Load all customers on mount
  useEffect(() => {
    const loadAllCustomers = async () => {
      setInitialLoading(true);
      try {
        // Use customerService.getAll which handles the correct API path
        const response = await customerService.getAll(0, 100);
        console.log('📋 All customers loaded:', response);
        
        if (response && response.length > 0) {
          const formattedCustomers = response.map(customer => ({
            id: customer.id,
            label: customer.full_name,
            phone: customer.phone || '',
            customer_code: customer.customer_code || '',
            business_name: customer.business_name || '',
            fullData: customer
          }));
          
          console.log('✅ Formatted customers:', formattedCustomers.length);
          setAllCustomers(formattedCustomers);
        }
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadAllCustomers();
  }, []);

  // Filter customers locally when query changes
  useEffect(() => {
    if (query.length < 1) {
      setFilteredCustomers([]);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = allCustomers.filter(customer => {
      const labelMatch = customer.label?.toLowerCase().includes(searchLower);
      const phoneMatch = customer.phone?.toLowerCase().includes(searchLower);
      const codeMatch = customer.customer_code?.toLowerCase().includes(searchLower);
      const idMatch = customer.id?.toString().includes(searchLower);
      
      return labelMatch || phoneMatch || codeMatch || idMatch;
    });

    console.log(`🔍 Filtered ${filtered.length} customers for query: "${query}"`);
    setFilteredCustomers(filtered.slice(0, 10)); // Limit to 10 results
  }, [query, allCustomers]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (customer) => {
    setQuery(customer.label);
    setShowDropdown(false);
    onChange(customer.id);
    if (onCustomerSelect) {
      onCustomerSelect(customer.fullData || { id: customer.id, full_name: customer.label });
    }
  };

  const handleClear = () => {
    setQuery("");
    setFilteredCustomers([]);
    setShowDropdown(false);
    onChange("");
    if (onCustomerSelect) {
      onCustomerSelect(null);
    }
  };

  const openCreateModal = () => {
    setCreateModalOpen(true);
    setShowDropdown(false);
    
    // Generate customer code
    const timestamp = Date.now().toString().slice(-6);
    const customerCode = `CUST-${timestamp}`;
    
    setCustomerForm({
      customer_code: customerCode,
      full_name: query || "",
      phone: "",
      business_name: "",
      business_number: "",
      address: "",
      notes: "",
      status: true
    });
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const handleCreateCustomer = async () => {
    // Debug: Log form data
    console.log("📝 Form data before validation:", customerForm);
    
    // Trim and validate
    const trimmedCode = customerForm.customer_code?.trim();
    const trimmedName = customerForm.full_name?.trim();
    const trimmedPhone = customerForm.phone?.trim();
    const trimmedAddress = customerForm.address?.trim();
    
    if (!trimmedCode || !trimmedName || !trimmedPhone || !trimmedAddress) {
      alert("Please fill in all required fields (Customer Code, Full Name, Phone, and Address)");
      return;
    }

    setSaving(true);
    try {
      // Use FormData for multipart/form-data submission (same as add customer page)
      const formData = new FormData();
      formData.append('customer_code', trimmedCode);
      formData.append('full_name', trimmedName);
      formData.append('phone', trimmedPhone);
      formData.append('address', trimmedAddress);
      formData.append('status', customerForm.status);
      
      // Add optional fields
      if (customerForm.business_name?.trim()) {
        formData.append('business_name', customerForm.business_name.trim());
      }
      if (customerForm.business_number?.trim()) {
        formData.append('business_number', customerForm.business_number.trim());
      }
      if (customerForm.notes?.trim()) {
        formData.append('notes', customerForm.notes.trim());
      }
      
      // Add profile image if provided
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }

      console.log("🚀 Sending FormData to API");
      
      // Debug: Log FormData contents
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1]);
      }

      // Send FormData directly
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ API Error Response:", errorData);
        
        // Handle different error formats
        let errorMessage = `Request failed with status ${response.status}`;
        
        if (errorData.detail) {
          // FastAPI validation error format
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => {
              const field = err.loc ? err.loc.join('.') : 'unknown';
              return `${field}: ${err.msg}`;
            }).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }

      const newCustomer = await response.json();
      console.log("✅ Customer created:", newCustomer);
      
      // Add to local list
      const newOption = {
        id: newCustomer.id,
        label: newCustomer.full_name,
        phone: newCustomer.phone || '',
        customer_code: newCustomer.customer_code || '',
        fullData: newCustomer
      };
      setAllCustomers([...allCustomers, newOption]);
      
      // Select the newly created customer
      setQuery(newCustomer.full_name);
      onChange(newCustomer.id);
      if (onCustomerSelect) {
        onCustomerSelect(newCustomer);
      }
      
      setCreateModalOpen(false);
      alert("Customer created successfully!");
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("Failed to create customer: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div ref={wrapperRef} className="relative w-full">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (query.length > 0) setShowDropdown(true);
            }}
            placeholder={placeholder}
            disabled={disabled || initialLoading}
            className="w-full pl-11 pr-10 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
          />
          {initialLoading ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          ) : query && !disabled ? (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          ) : null}
        </div>

        {/* Dropdown */}
        {showDropdown && !disabled && query.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {filteredCustomers.length > 0 ? (
              <>
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelect(customer)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors text-left border-b border-gray-100 dark:border-zinc-800 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {customer.label}
                      </p>
                      {(customer.phone || customer.customer_code) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {customer.phone && <span>{customer.phone}</span>}
                          {customer.phone && customer.customer_code && <span> | </span>}
                          {customer.customer_code && <span>{customer.customer_code}</span>}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
                
                {/* Create New Customer Option */}
                <button
                  onClick={openCreateModal}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors text-left border-t-2 border-green-200 dark:border-green-800"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">
                      Customer not found? Create new
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      Click to add a new customer
                    </p>
                  </div>
                </button>
              </>
            ) : (
              <div className="p-4">
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  No customers found for "{query}"
                </div>
                <button
                  onClick={openCreateModal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create New Customer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Customer Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" style={{zIndex: 100}}>
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 text-center border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Plus className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                Add New Customer
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the details for the new customer.
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Customer Code */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Customer Code <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerForm.customer_code}
                    onChange={(e) => setCustomerForm({...customerForm, customer_code: e.target.value})}
                    placeholder="CUST-001"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerForm.full_name}
                    onChange={(e) => setCustomerForm({...customerForm, full_name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Phone <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                    placeholder="+971 50 123 4567"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Profile Image <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  {/* Image Preview */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {profileImagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <span>{profileImage ? 'Change Image' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerForm.business_name}
                    onChange={(e) => setCustomerForm({...customerForm, business_name: e.target.value})}
                    placeholder="ABC Trading LLC"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Business Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Business Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerForm.business_number}
                    onChange={(e) => setCustomerForm({...customerForm, business_number: e.target.value})}
                    placeholder="TRN-123456"
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all dark:text-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Address <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                    placeholder="Street address, city, country..."
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all resize-none dark:text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all resize-none dark:text-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Status <span className="text-red-600">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all appearance-none text-gray-900 dark:text-white"
                  value={customerForm.status}
                  onChange={(e) => setCustomerForm({...customerForm, status: e.target.value === 'true'})}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900">
              <button 
                onClick={() => setCreateModalOpen(false)}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCustomer}
                disabled={saving || !customerForm.full_name || !customerForm.phone || !customerForm.customer_code || !customerForm.address}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Customer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

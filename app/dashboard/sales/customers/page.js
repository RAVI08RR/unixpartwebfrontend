"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Mail, MoreVertical, Search, Phone,
  Filter, Download, Plus, ChevronLeft, ChevronRight,
  Building, Pencil, Trash2, Check, X, Eye, MapPin, DollarSign
} from "lucide-react";
import { useCustomers } from "../../../lib/hooks/useCustomers";
import { customerService } from "../../../lib/services/customerService";
import { getAuthToken } from "../../../lib/api";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Data Fetching
  const itemsPerPage = 8;
  const { customers: apiCustomers, loading: isLoading, error: isError, refetch } = useCustomers(0, 100);

  // Handle Data Selection (API only) - Fixed for hydration
  const customers = useMemo(() => {
    // During SSR, always return empty array to prevent hydration mismatch
    if (typeof window === 'undefined') return [];

    const token = getAuthToken();
    if (!token) { 
      // If no token, return empty array - user should be redirected to login
      return [];
    }
    
    // Log the data state for debugging
    console.log("CUSTOMER-DASHBOARD DATA DEBUG:", {
      hasApiData: !!apiCustomers,
      apiCount: apiCustomers?.length,
      hasToken: !!token,
      isLoading,
      isError
    });
    
    // If we have API data, use it
    if (apiCustomers) {
        // Handle both array and object responses
        const data = Array.isArray(apiCustomers) ? apiCustomers : (apiCustomers?.customers || []);
        return data;
    }

    // If no API data, return empty array
    return [];
  }, [apiCustomers, isError, isLoading]);

  // Add client-side mounting state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset to first page when customers list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [customers.length]);

  // Menu state and modals
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Filter and search logic
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(customer => {
      const matchesSearch = 
        (customer.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (customer.customer_code?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (customer.business_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      // Map API boolean status to string for filtering if needed, or adjust filter logic
      const statusString = customer.status ? "Active" : "Inactive";
      const matchesStatus = statusFilter === "All" || statusString === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, customers]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setDeleteModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;
    
    try {
      await customerService.delete(selectedCustomer.id);
      refetch();
      setDeleteModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Failed to delete customer", error);
      alert("Failed to delete customer: " + error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleViewClose = () => {
    setViewModalOpen(false);
    setSelectedCustomer(null);
  };

  // Show loading state only after component is mounted to prevent hydration mismatch
  if (!isMounted || (isLoading && (!customers || customers.length === 0))) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Customer Management</h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Manage your customer database</p>
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="text-gray-500">Loading customers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Customer Management</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Manage your customer database</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, code, business..."
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-600/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {["All", "Active", "Inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        statusFilter === status 
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {status === "All" ? "All Status" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <Link href="/dashboard/sales/customers/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add Customer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Customer</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Contact</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Business</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Financial</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"
                style={{ width: '10rem' }}
                >Last Updated</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer, index) => {
                  return (
                    <tr key={customer.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30"
                    style= {{borderBottom :"0.9px solid #E2E8F0"}}
                    >
                      {/* Name / Customer */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`}
                            alt={customer.full_name} 
                            className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                          />
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{customer.full_name}</p>
                            <p className="text-sm text-gray-400 mt-1 font-medium tracking-wide">{customer.customer_code}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-6">
                        <div className="space-y-1.5 min-w-[180px]">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <Phone className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <MapPin className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors truncate max-w-[150px]">{customer.address}</span>
                          </div>
                        </div>
                      </td>

                      {/* Business */}
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <Building className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            <span className="text-[14px] font-bold text-gray-700 dark:text-gray-200 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">
                              {customer.business_name || "Individual"}
                            </span>
                          </div>
                          {customer.business_number && (
                            <span className="text-xs font-medium text-blue-500 ml-5">
                              {customer.business_number}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Financial */}
                      <td className="px-6 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">
                              AED {parseFloat(customer.total_purchase || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className={`text-xs font-medium ${
                            parseFloat(customer.outstanding_balance || 0) > 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            Balance: AED {parseFloat(customer.outstanding_balance || 0).toFixed(2)}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6">
                        <div className={customer.status ? 'status-badge-active' : 'status-badge-inactive'}>
                          <div className={customer.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                          {customer.status ? "Active" : "Inactive"}
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-6">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                            {customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : "-"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <button 
                              onClick={() => toggleMenu(customer.id)}
                              className={`p-2 rounded-xl transition-all ${
                                menuOpenId === customer.id 
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {menuOpenId === customer.id && (
                              <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                index > paginatedCustomers.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                              }`}>
                                <button 
                                  onClick={() => handleViewCustomer(customer)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <Link 
                                  href={`/dashboard/sales/customers/edit/${customer.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit Customer
                                </Link>
                                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                <button 
                                  onClick={() => handleDeleteClick(customer)} 
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Customer
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No customers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredCustomers.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredCustomers.length}</span> entries
          </p>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                    currentPage === i + 1 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' 
                    : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-5 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Customer Modal */}
      {viewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
              <div className="flex items-center gap-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomer.full_name)}&background=random`}
                  alt={selectedCustomer.full_name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCustomer.full_name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.customer_code}</p>
                </div>
              </div>
              <button 
                onClick={handleViewClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedCustomer.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Code</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedCustomer.customer_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className={`inline-flex mt-1 ${selectedCustomer.status ? 'status-badge-active' : 'status-badge-inactive'}`}>
                      <div className={selectedCustomer.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                      {selectedCustomer.status ? "Active" : "Inactive"}
                    </div>
                  </div>
                  {selectedCustomer.business_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</label>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedCustomer.business_name}</p>
                    </div>
                  )}
                  {selectedCustomer.business_number && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Number</label>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedCustomer.business_number}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedCustomer.address}</p>
                  </div>
                  {selectedCustomer.notes && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{selectedCustomer.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Purchases</label>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                      AED {parseFloat(selectedCustomer.total_purchase || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding Balance</label>
                    <p className={`text-lg font-bold mt-1 ${
                      parseFloat(selectedCustomer.outstanding_balance || 0) > 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      AED {parseFloat(selectedCustomer.outstanding_balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleString() : "Not available"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {selectedCustomer.updated_at ? new Date(selectedCustomer.updated_at).toLocaleString() : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button 
                onClick={handleViewClose}
                className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Close
              </button>
              <Link 
                href={`/dashboard/sales/customers/edit/${selectedCustomer.id}`}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                onClick={handleViewClose}
              >
                Edit Customer
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Customer</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedCustomer.full_name}</span>? 
                This action cannot be undone.
              </p>
              
              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomer.full_name)}&background=random`}
                    alt={selectedCustomer.full_name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedCustomer.full_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCustomer.customer_code}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{selectedCustomer.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-200 dark:border-zinc-700">
              <button 
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
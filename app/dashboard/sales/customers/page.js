"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Mail, MoreVertical, Search, Phone,
  Filter, Download, Plus,
  Building, Building2, Pencil, Trash2, Check, X, Eye, MapPin, DollarSign, AlertTriangle, History, RotateCcw
} from "lucide-react";
import { useCustomers } from "../../../lib/hooks/useCustomers";
import { customerService } from "../../../lib/services/customerService";
import { customerBranchService } from "../../../lib/services/customerBranchService";
import { getAuthToken } from "../../../lib/api";
import CustomerDeactivateModal from "../../../components/CustomerDeactivateModal";
import CustomerCreditLimitModal from "../../../components/CustomerCreditLimitModal";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { usePermission } from "@/app/lib/hooks/usePermission";
import { PERMISSIONS } from "@/app/lib/constants/permissions";
import Pagination from "@/app/components/Pagination";
import { TableContainer, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/app/components/Table";

export default function CustomersPage() {
  const { hasPermission } = usePermission();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Advanced Filters
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Auto-expand filters if active filters exist on load
  useEffect(() => {
    if (statusFilter !== "All" || dateRange.start || dateRange.end || selectedBusiness || selectedCity) {
      setIsFilterOpen(true);
    }
  }, []);

  // Data Fetching — server-side pagination
  const PAGE_SIZE = 10;
  const { customers: apiCustomers, loading: isLoading, error: isError, refetch, total, totalPages } = useCustomers(currentPage, PAGE_SIZE);

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

  // Fetch deactivated branches for all customers
  useEffect(() => {
    const fetchDeactivatedBranches = async () => {
      if (!customers || customers.length === 0) return;

      const branchesMap = {};

      // Fetch deactivated branches for each customer
      await Promise.all(
        customers.map(async (customer) => {
          try {
            const deactivatedData = await customerBranchService.getDeactivatedBranches(customer.id);
            const branches = Array.isArray(deactivatedData)
              ? deactivatedData
              : (deactivatedData?.branches || deactivatedData?.data || []);
            branchesMap[customer.id] = branches;
          } catch (error) {
            // Silently handle errors - customer might not have deactivated branches
            branchesMap[customer.id] = [];
          }
        })
      );

      setCustomerDeactivatedBranches(branchesMap);
    };

    if (isMounted && customers.length > 0) {
      fetchDeactivatedBranches();
    }
  }, [customers, isMounted]);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateRange, selectedBusiness, selectedCity]);

  // Menu state and modals
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [creditLimitModalOpen, setCreditLimitModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDeactivatedBranches, setCustomerDeactivatedBranches] = useState({});

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpenId && !event.target.closest('.customer-actions-menu')) {
        setMenuOpenId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  // Show all items from current backend page, apply local filter within page
  const paginatedCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(customer => {
      const matchesSearch =
        (customer.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (customer.customer_code?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (customer.business_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const statusString = customer.status ? "Active" : "Inactive";
      const matchesStatus = statusFilter === "All" || statusString === statusFilter;
      const matchesDateRange = (() => {
        if (!dateRange.start && !dateRange.end) return true;
        const customerDate = new Date(customer.created_at);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        if (startDate && endDate) return customerDate >= startDate && customerDate <= endDate;
        else if (startDate) return customerDate >= startDate;
        else if (endDate) return customerDate <= endDate;
        return true;
      })();
      const matchesBusiness = !selectedBusiness || (customer.business_name?.toLowerCase() || "").includes(selectedBusiness.toLowerCase());
      const matchesCity = !selectedCity || (customer.address?.toLowerCase() || "").includes(selectedCity.toLowerCase());
      return matchesSearch && matchesStatus && matchesDateRange && matchesBusiness && matchesCity;
    });
  }, [searchQuery, statusFilter, customers, dateRange, selectedBusiness, selectedCity]);
  const filteredCustomers = paginatedCustomers; // alias for export

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

  const handleDeactivateClick = (customer) => {
    setSelectedCustomer(customer);
    setDeactivateModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeactivateSuccess = () => {
    refetch();
    setDeactivateModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleCreditLimitClick = (customer) => {
    setSelectedCustomer(customer);
    setCreditLimitModalOpen(true);
    setMenuOpenId(null);
  };

  const handleCreditLimitSuccess = () => {
    refetch();
    setCreditLimitModalOpen(false);
    setSelectedCustomer(null);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter("All");
    setDateRange({ start: "", end: "" });
    setSelectedBusiness("");
    setSelectedCity("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== "All" || dateRange.start || dateRange.end || selectedBusiness || selectedCity;

  // Show loading state only after component is mounted to prevent hydration mismatch
  if (!isMounted || (isLoading && (!customers || customers.length === 0))) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Customer Management</h1>
            <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your customer database</p>
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="text-gray-500">Loading customers...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute permission={PERMISSIONS.CUSTOMERS.VIEW}>
      <div className="space-y-6 pb-12 w-full max-w-full">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Customer Management</h1>
            <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your customer database</p>
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
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 btn-mobile-arrange">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all filter-button ${isFilterOpen
                    ? 'bg-red-600 text-white shadow-red-600/10'
                    : 'bg-black dark:bg-white text-white dark:text-black shadow-black/10'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
              </button>

              <button className="flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              {hasPermission(PERMISSIONS.CUSTOMERS.CREATE) && (
                <Link href="/dashboard/sales/customers/add" className="flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline whitespace-nowrap font-black">Add Customer</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Filters Card */}
        {isFilterOpen && (
          <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-zinc-800/50">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Filters</h2>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the customers list below.</p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, start: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange({ ...dateRange, end: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none"
                />
              </div>

              {/* Business Name Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Business Name</label>
                <input
                  type="text"
                  value={selectedBusiness}
                  onChange={(e) => {
                    setSelectedBusiness(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Enter business name..."
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                />
              </div>

              {/* City/Address Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">City/Address</label>
                <input
                  type="text"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Enter city or address..."
                  className="w-full px-3.5 py-3 bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 rounded-xl text-sm font-medium text-gray-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <TableContainer>
          <Table minWidth="800px">
            <TableHeader>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Business</TableHeaderCell>
              <TableHeaderCell>Financial</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {paginatedCustomers && paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer, index) => (
                  <TableRow key={customer.id}>
                    {/* Customer Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={customer.profile_image ? customerService.getProfileImageUrl(customer.profile_image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`}
                          alt={customer.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name)}&background=random`;
                          }}
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{customer.full_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.customer_code}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact */}
                    <TableCell>
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Phone className="w-3.5 h-3.5" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Business */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 font-mono">
                          <Building className="w-3.5 h-3.5" />
                          {customer.business_name || "-"}
                        </div>
                        {customer.business_number && (
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono ml-5 uppercase tracking-widest">{customer.business_number}</div>
                        )}
                      </div>
                    </TableCell>

                    {/* Financial */}
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                          <span className="flex gap-1">Total: <strong className="text-gray-900 dark:text-white font-black">AED {parseFloat(customer.total_purchase || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <AlertTriangle className={`w-3.5 h-3.5 ${parseFloat(customer.outstanding_balance || 0) > 0 ? 'text-red-500' : 'text-green-500'}`} />
                          <span className="flex gap-1">Due: <strong className={`${parseFloat(customer.outstanding_balance || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} font-black`}>AED {parseFloat(customer.outstanding_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${customer.status
                          ? 'bg-green-100/50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                          : 'bg-red-100/50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${customer.status ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}`} />
                        {customer.status ? "Active" : "Inactive"}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right relative customer-actions-menu">
                      <button onClick={() => toggleMenu(customer.id)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {menuOpenId === customer.id && (
                        <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[200] p-1.5 animate-in fade-in zoom-in-95 duration-200 ${index > paginatedCustomers.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                          }`}>
                          <button onClick={() => handleViewCustomer(customer)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </button>

                          <Link href={`/dashboard/sales/customers/purchase-history/${customer.id}`} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                            <History className="w-3.5 h-3.5" /> Purchase History
                          </Link>

                          {hasPermission(PERMISSIONS.CUSTOMERS.UPDATE) && (
                            <>
                              <Link href={`/dashboard/sales/customers/edit/${customer.id}`} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors">
                                <Pencil className="w-3.5 h-3.5" /> Edit Customer
                              </Link>

                              <button onClick={() => handleCreditLimitClick(customer)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors">
                                <DollarSign className="w-3.5 h-3.5" /> Set Credit Limit
                              </button>

                              <button onClick={() => handleDeactivateClick(customer)} className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-colors ${customer.status
                                  ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                  : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                }`}>
                                {customer.status ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                {customer.status ? "Deactivate" : "Activate"}
                              </button>
                            </>
                          )}

                          {hasPermission(PERMISSIONS.CUSTOMERS.DELETE) && (
                            <>
                              <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                              <button onClick={() => handleDeleteClick(customer)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="6" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest text-center w-full">No customers found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

          {/* Pagination Footer */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />




        {/* View Customer Modal */}
        {viewModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-700">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCustomer.profile_image ? customerService.getProfileImageUrl(selectedCustomer.profile_image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomer.full_name)}&background=random`}
                    alt={selectedCustomer.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomer.full_name)}&background=random`;
                    }}
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
                      <p className={`text-lg font-bold mt-1 ${parseFloat(selectedCustomer.outstanding_balance || 0) > 0
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
                {hasPermission(PERMISSIONS.CUSTOMERS.UPDATE) && (
                  <Link
                    href={`/dashboard/sales/customers/edit/${selectedCustomer.id}`}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                    onClick={handleViewClose}
                  >
                    Edit Customer
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
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
                      <p className="text-xs text-gray-400 dark:text-white">{selectedCustomer.phone}</p>
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

        {/* Customer Deactivate Modal */}
        {deactivateModalOpen && selectedCustomer && (
          <CustomerDeactivateModal
            customer={selectedCustomer}
            isOpen={deactivateModalOpen}
            onClose={() => {
              setDeactivateModalOpen(false);
              setSelectedCustomer(null);
            }}
            onSuccess={handleDeactivateSuccess}
          />
        )}

        {/* Customer Credit Limit Modal */}
        {creditLimitModalOpen && selectedCustomer && (
          <CustomerCreditLimitModal
            customer={selectedCustomer}
            isOpen={creditLimitModalOpen}
            onClose={() => {
              setCreditLimitModalOpen(false);
              setSelectedCustomer(null);
            }}
            onSuccess={handleCreditLimitSuccess}
          />
        )}

      </div>
    </ProtectedRoute>
  );
}
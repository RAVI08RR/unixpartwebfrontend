"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, MoreVertical, Search, 
  Filter, Download, Plus, ChevronLeft, ChevronRight,
  Pencil, Trash2, Check, X, Eye, Calendar,
  User, Building2, Phone, MapPin, Mail, Tag
} from "lucide-react";
import { useSuppliers } from "@/app/lib/hooks/useSuppliers";
import { supplierService } from "@/app/lib/services/supplierService";
import { getAuthToken } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";
import { useConfirm } from "@/app/components/ConfirmModal";
import ViewSupplierModal from "@/app/components/ViewSupplierModal";

export default function SupplierManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { success, error } = useToast();
  const confirm = useConfirm();
  
  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  // Data Fetching
  const itemsPerPage = 8;
  const { suppliers: apiSuppliers, isLoading, isError, mutate } = useSuppliers(0, 100);

  // Handle Data Selection (API only) - Fixed for hydration
  const suppliers = useMemo(() => {
    // During SSR, always return empty array to prevent hydration mismatch
    if (typeof window === 'undefined') return [];

    const token = getAuthToken();
    if (!token) { 
      // If no token, return empty array - user should be redirected to login
      return [];
    }
    
    // Log the data state for debugging
    console.log("SUPPLIER-DASHBOARD DATA DEBUG:", {
      hasApiData: !!apiSuppliers,
      apiCount: apiSuppliers?.length,
      hasToken: !!token,
      isLoading,
      isError
    });
    
    // If we have API data, use it
    if (apiSuppliers) {
        // Handle both array and object responses
        const data = Array.isArray(apiSuppliers) ? apiSuppliers : (apiSuppliers?.suppliers || []);
        return data;
    }

    // If no API data, return empty array
    return [];
  }, [apiSuppliers, isError, isLoading]);

  // Add client-side mounting state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset to first page when suppliers list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [suppliers.length]);

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);

  // Filter and search logic
  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];
    return suppliers.filter(supplier => {
      const matchesSearch = 
        (supplier.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (supplier.contact_email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (supplier.contact_person?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (supplier.contact_number?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (supplier.address?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || 
        (statusFilter === "Active" && (supplier.status === true || supplier.status === "active")) ||
        (statusFilter === "Inactive" && (supplier.status === false || supplier.status === "inactive"));
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, suppliers]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // Inline Editing Handlers
  const handleEdit = (supplier) => {
    setEditingId(supplier.id);
    setEditForm({ ...supplier });
    setMenuOpenId(null);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    try {
        // Construct a clean payload for supplier update
        const payload = {
            name: editForm.name || undefined,
            contact_email: editForm.contact_email || undefined,
            contact_number: editForm.contact_number || undefined,
            contact_person: editForm.contact_person || undefined,
            company: editForm.company || undefined,
            address: editForm.address || undefined,
            status: editForm.status !== undefined ? editForm.status : undefined,
        };

        // Clean up undefined fields
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        console.log("Saving Supplier Update:", { id: editingId, payload });

        await supplierService.update(editingId, payload);
        
        // Success: Refresh and clean up
        mutate(); 
        setEditingId(null);
        setEditForm({});
        setMenuOpenId(null);
        success("Supplier updated successfully!");
    } catch (err) {
        console.error("Update Error Details:", err);
        error(`Update Failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
      const confirmed = await confirm({
        title: "Delete Supplier",
        message: "Are you sure you want to delete this supplier? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger"
      });

      if (confirmed) {
          try {
              await supplierService.delete(id);
              mutate();
              success("Supplier deleted successfully!");
          } catch (err) {
              console.error("Failed to delete supplier", err);
              error("Failed to delete supplier");
          }
      }
  }

  const handleView = (supplier) => {
    setSelectedSupplier(supplier);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Show loading state only after component is mounted to prevent hydration mismatch
  if (!isMounted || (isLoading && (!suppliers || suppliers.length === 0))) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">Supplier Management</h1>
            <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your suppliers</p>
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="text-gray-500">Loading suppliers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Supplier Management</h1>
          <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your suppliers</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, contact person, phone..."
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
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all filter-button"
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
            <Link href="/dashboard/inventory/suppliers/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all add-button">
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add Supplier</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[15px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full responsive-table-container">
        <div className="overflow-x-auto lg:overflow-x-visible w-full scrollbar-hide">
          <table className="w-full lg:min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Supplier</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Contact</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Type</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Company</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10"
                style={{ width: '10rem' }}
                >Last Updated</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-white uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedSuppliers.length > 0 ? (
                paginatedSuppliers.map((supplier, index) => {
                  const isEditing = editingId === supplier.id;
                  
                  return (
                    <tr key={supplier.id} className={`group transition-all ${isEditing ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'}`}
                    style= {{borderBottom :"0.9px solid #E2E8F0"}}
                    >
                      {/* Supplier Name */}
                      <td className="px-6 py-6" data-label="Supplier">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
                            <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            {isEditing ? (
                              <input 
                                type="text"
                                name="name"
                                value={editForm.name || ''}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{supplier.name || 'N/A'}</p>
                            )}
                            <p className="text-sm text-gray-400 mt-1 font-medium tracking-wide">{supplier.supplier_code || `SUP-${supplier.id}`}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-6" data-label="Contact">
                        <div className="space-y-1.5 min-w-[180px]">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <User className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            {isEditing ? (
                              <input 
                                type="text"
                                name="contact_person"
                                value={editForm.contact_person || ''}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                placeholder="Contact person"
                              />
                            ) : (
                              <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{supplier.contact_person || 'N/A'}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <Phone className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            {isEditing ? (
                              <input 
                                type="text"
                                name="contact_number"
                                value={editForm.contact_number || ''}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                placeholder="Phone number"
                              />
                            ) : (
                              <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{supplier.contact_number || 'N/A'}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <Mail className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            {isEditing ? (
                              <input 
                                type="email"
                                name="contact_email"
                                value={editForm.contact_email || ''}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                                placeholder="Email address"
                              />
                            ) : (
                              <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{supplier.contact_email || 'N/A'}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-6" data-label="Type">
                        <div className={`role-badge ${
                          supplier.type?.toLowerCase() === 'owner' ? 'role-badge-admin' :
                          supplier.type?.toLowerCase() === 'rental' ? 'role-badge-manager' :
                          supplier.type?.toLowerCase() === 'wholesale' ? 'role-badge-staff' :
                          supplier.type?.toLowerCase() === 'retail' ? 'role-badge-sales' :
                          supplier.type?.toLowerCase() === 'manufacturer' ? 'role-badge-accountant' :
                          'role-badge-default'
                        }`}>
                          <Tag className="w-3.5 h-3.5" />
                          {supplier.type || "N/A"}
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-6 py-6" data-label="Company">
                        <div className="flex flex-col gap-1">
                          {isEditing ? (
                            <input 
                              type="text"
                              name="company"
                              value={editForm.company || ''}
                              onChange={handleChange}
                              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                              {supplier.company || "Not Specified"}
                            </span>
                          )}
                          {supplier.address && (
                            <span className="text-xs font-medium text-blue-500">
                              {supplier.address.length > 30 ? supplier.address.substring(0, 30) + '...' : supplier.address}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6" data-label="Status">
                        {isEditing ? (
                           <label className="flex items-center gap-2">
                             <input
                               type="checkbox"
                               name="status"
                               checked={editForm.status === true || editForm.status === "active"}
                               onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.checked }))}
                               className="checkbox-black"
                             />
                             <span className="text-sm font-medium">Active</span>
                           </label>
                        ) : (
                          <div className={supplier.status ? 'status-badge-active' : 'status-badge-inactive'}>
                            <div className={supplier.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                            {supplier.status ? "Active" : "Inactive"}
                          </div>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="px-6 py-6" data-label="Last Updated">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                          {supplier.updated_at ? new Date(supplier.updated_at).toLocaleDateString() : "-"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6 text-right relative" data-label="Actions">
                        <div className="flex items-center justify-end gap-2">
                           {isEditing ? (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={handleSave} 
                                  className="flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 active:scale-95 font-semibold text-sm" 
                                  title="Save Changes"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Save</span>
                                </button>
                                <button 
                                  onClick={handleCancel} 
                                  className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm active:scale-95 font-semibold text-sm" 
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                           ) : (
                              <div className="relative">
                                <button 
                                  onClick={() => toggleMenu(supplier.id)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                                    menuOpenId === supplier.id 
                                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 bg-gray-50 dark:bg-zinc-800/50 lg:bg-transparent lg:dark:bg-transparent'
                                  }`}
                                >
                                  <span className="text-[11px] font-black uppercase tracking-widest lg:hidden">Actions</span>
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                                
                                {menuOpenId === supplier.id && (
                                  <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                    index > paginatedSuppliers.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                                  }`}>
                                    <button 
                                      onClick={() => handleView(supplier)}
                                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </button>
                                    <Link 
                                      href={`/dashboard/inventory/suppliers/edit/${supplier.id}`}
                                      onClick={() => setMenuOpenId(null)}
                                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                                    >
                                      <Pencil className="w-4 h-4" />
                                      Edit Supplier
                                    </Link>
                                    <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                    <button 
                                      onClick={() => handleDelete(supplier.id)} 
                                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete Supplier
                                    </button>
                                  </div>
                                )}
                              </div>
                           )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No suppliers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredSuppliers.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredSuppliers.length}</span> entries
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

      {/* View Supplier Modal */}
      <ViewSupplierModal 
        supplier={selectedSupplier}
        isOpen={viewModalOpen}
        onClose={closeViewModal}
      />
    </div>
  );
}
"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Truck, MoreVertical, Search,
  Filter, Plus,
  Pencil, Trash2, Check, X, Eye, Calendar,
  User, Building2, Phone, MapPin, Mail, Tag, RotateCcw
} from "lucide-react";
import { useSuppliers } from "@/app/lib/hooks/useSuppliers";
import { supplierService } from "@/app/lib/services/supplierService";
import { getAuthToken } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";
import { useConfirm } from "@/app/components/ConfirmModal";
import ViewSupplierModal from "@/app/components/ViewSupplierModal";
import ExportButton from "@/app/components/ExportButton";
import { formatDateForExport, formatStatusForExport } from "@/app/lib/utils/exportUtils";
import { usePermission } from "@/app/lib/hooks/usePermission";
import { PERMISSIONS } from "@/app/lib/constants/permissions";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Pagination from "@/app/components/Pagination";
import { TableContainer, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/app/components/Table";

export default function SupplierManagementPage() {
  const { hasPermission } = usePermission();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { success, error } = useToast();
  const confirm = useConfirm();

  const hasActiveFilters = statusFilter !== "All";
  const handleClearFilters = () => {
    setStatusFilter("All");
    setCurrentPage(1);
  };

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Data Fetching — server-side pagination
  const PAGE_SIZE = 10;
  const { suppliers: apiSuppliers, isLoading, isError, mutate, total, totalPages } = useSuppliers(currentPage, PAGE_SIZE);

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

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Auto-expand filters if active filters exist on load
  useEffect(() => {
    if (statusFilter !== "All") {
      setIsFilterOpen(true);
    }
  }, []);

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpenId !== null && !event.target.closest('.actions-menu-container')) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  // Pagination: all items from current page (no client-side slicing)
  const paginatedSuppliers = useMemo(() => {
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
  const filteredSuppliers = paginatedSuppliers; // alias for export/count

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
        console.log("🗑️ Deleting supplier with ID:", id);
        await supplierService.delete(id);
        console.log("✅ Supplier deleted successfully");
        mutate(); // Refresh the list
        setMenuOpenId(null); // Close the menu
        success("Supplier deleted successfully!");
      } catch (err) {
        console.error("❌ Failed to delete supplier:", err);
        console.error("❌ Error details:", {
          message: err.message,
          stack: err.stack
        });
        error(`Failed to delete supplier: ${err.message}`);
      }
    } else {
      console.log("ℹ️ Supplier deletion cancelled by user");
      setMenuOpenId(null); // Close the menu even if cancelled
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

  // Export columns configuration
  const exportColumns = [
    { key: 'supplier_code', label: 'Supplier Code' },
    { key: 'name', label: 'Name' },
    { key: 'contact_person', label: 'Contact Person' },
    { key: 'contact_number', label: 'Phone' },
    { key: 'contact_email', label: 'Email' },
    { key: 'type', label: 'Type' },
    { key: 'company', label: 'Company' },
    { key: 'address', label: 'Address' },
    {
      key: 'status',
      label: 'Status',
      formatter: formatStatusForExport
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      formatter: formatDateForExport
    }
  ];

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
    <ProtectedRoute permission={PERMISSIONS.SUPPLIERS.VIEW}>
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

              <ExportButton
                data={filteredSuppliers}
                columns={exportColumns}
                filename={`suppliers-${new Date().toISOString().split('T')[0]}`}
                onSuccess={(format) => success(`Suppliers exported successfully as ${format}!`)}
                onError={(error) => error(`Export failed: ${error.message}`)}
              />
              {hasPermission(PERMISSIONS.SUPPLIERS.CREATE) && (
                <Link href="/dashboard/inventory/suppliers/add" className="flex-none p-3.5 sm:px-6 sm:py-3.5 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all add-button">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline whitespace-nowrap font-black">Add Supplier</span>
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
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Refine the suppliers list below.</p>
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Status</label>
                <div className="flex gap-2">
                  {["All", "Active", "Inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${statusFilter === status
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/10'
                          : 'bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                        }`}
                    >
                      {status === "All" ? "All Status" : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <TableContainer>
          <Table minWidth="1000px">
            <TableHeader>
              <TableHeaderCell>Supplier</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell style={{ width: '10rem' }}>Last Updated</TableHeaderCell>
              <TableHeaderCell className="text-right"></TableHeaderCell>
            </TableHeader>
            <TableBody>
              {paginatedSuppliers.length > 0 ? (
                paginatedSuppliers.map((supplier, index) => {
                  const isEditing = editingId === supplier.id;

                  return (
                    <TableRow key={supplier.id} className={isEditing ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                      {/* Supplier Name */}
                      <TableCell>
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
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
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
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <div className={`role-badge ${supplier.type?.toLowerCase() === 'owner' ? 'role-badge-admin' :
                            supplier.type?.toLowerCase() === 'rental' ? 'role-badge-manager' :
                              supplier.type?.toLowerCase() === 'wholesale' ? 'role-badge-staff' :
                                supplier.type?.toLowerCase() === 'retail' ? 'role-badge-sales' :
                                  supplier.type?.toLowerCase() === 'manufacturer' ? 'role-badge-accountant' :
                                    'role-badge-default'
                          }`}>
                          <Tag className="w-3.5 h-3.5" />
                          {supplier.type || "N/A"}
                        </div>
                      </TableCell>

                      {/* Company */}
                      <TableCell>
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
                            <span className="text-xs font-medium text-blue-500 font-semibold">
                              {supplier.address.length > 30 ? supplier.address.substring(0, 30) + '...' : supplier.address}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
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
                      </TableCell>

                      {/* Last Updated */}
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {supplier.updated_at ? new Date(supplier.updated_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right relative actions-menu-container">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={handleSave} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                              <Check className="w-5 h-5" />
                            </button>
                            <button onClick={handleCancel} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => toggleMenu(supplier.id)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            {menuOpenId === supplier.id && (
                              <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[200] p-1.5 animate-in fade-in zoom-in-95 duration-200 ${index > paginatedSuppliers.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                                }`}>
                                <button onClick={() => handleView(supplier)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                  <Eye className="w-3.5 h-3.5" /> View Details
                                </button>

                                {hasPermission(PERMISSIONS.SUPPLIERS.UPDATE) && (
                                  <>
                                    <button onClick={() => handleEdit(supplier)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                                      <Pencil className="w-3.5 h-3.5" /> Edit Quick
                                    </button>

                                    <Link href={`/dashboard/inventory/suppliers/edit/${supplier.id}`} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors">
                                      <Pencil className="w-3.5 h-3.5" /> Edit Full
                                    </Link>
                                  </>
                                )}

                                {hasPermission(PERMISSIONS.SUPPLIERS.DELETE) && (
                                  <>
                                    <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />

                                    <button onClick={() => handleDelete(supplier.id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="py-24 text-center">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-center w-full">No suppliers found</p>
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

        {/* View Supplier Modal */}
        <ViewSupplierModal
          supplier={selectedSupplier}
          isOpen={viewModalOpen}
          onClose={closeViewModal}
        />
      </div>
    </ProtectedRoute>
  );
}
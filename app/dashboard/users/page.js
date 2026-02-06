"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Mail, MoreVertical, Search, Phone,
  Filter, Download, Plus, ChevronLeft, ChevronRight,
  ShieldCheck, Pencil, Trash2, Check, X, Eye, User, Building2, Store, Calendar
} from "lucide-react";
import { useUsers } from "@/app/lib/hooks/useUsers";
import { userService } from "@/app/lib/services/userService";
import { roleService } from "@/app/lib/services/roleService";
import { getAuthToken } from "@/app/lib/api";
import { useToast } from "@/app/components/Toast";

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { success, error } = useToast();
  
  // Data Fetching
  const itemsPerPage = 8;
  const { users: apiUsers, isLoading, isError, mutate } = useUsers(0, 100);
  const [roles, setRoles] = useState([
    { id: 1, name: "Administrator" },
    { id: 2, name: "Manager" },
    { id: 3, name: "Staff" }
  ]);

  useEffect(() => {
    roleService.getAll().then(data => {
      if (data && data.length > 0) setRoles(data);
    }).catch(err => console.error("Failed to fetch roles", err));
  }, []);
  
  // Handle Data Selection (API only) - Fixed for hydration
  const users = useMemo(() => {
    // During SSR, always return empty array to prevent hydration mismatch
    if (typeof window === 'undefined') return [];

    const token = getAuthToken();
    if (!token) { 
      // If no token, return empty array - user should be redirected to login
      return [];
    }
    
    // Log the data state for debugging
    console.log("UX-DASHBOARD DATA DEBUG:", {
      hasApiData: !!apiUsers,
      apiCount: apiUsers?.length,
      hasToken: !!token,
      isLoading,
      isError
    });
    
    // If we have API data, use it
    if (apiUsers) {
        // Handle both array and object responses
        const data = Array.isArray(apiUsers) ? apiUsers : (apiUsers?.users || []);
        return data;
    }

    // If no API data, return empty array
    return [];
  }, [apiUsers, isError, isLoading]);

  // Add client-side mounting state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset to first page when users list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  // Menu state and modals
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => {
      const matchesSearch = 
        (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
      // Map API boolean status to string for filtering if needed, or adjust filter logic
      const statusString = user.status ? "Active" : "Inactive";
      const matchesStatus = statusFilter === "All" || statusString === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, users]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.delete(selectedUser.id);
      mutate();
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete user", err);
      error("Failed to delete user");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleViewClose = () => {
    setViewModalOpen(false);
    setSelectedUser(null);
  };

  // Show loading state only after component is mounted to prevent hydration mismatch
  if (!isMounted || (isLoading && (!users || users.length === 0))) {
    return (
      <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="shrink-0">
            <h1 className="text-2xl font-black dark:text-white tracking-tight">User Management</h1>
            <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your user management</p>
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="text-gray-500">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">User Management</h1>
          <p className="text-gray-400 dark:text-white text-sm font-normal">Manage your user management</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email..."
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
            <Link href="/dashboard/users/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all add-button">
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add User</span>
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
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">User</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Contact</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Role</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Branch</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Status</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"
                style={{ width: '10rem' }}
                >Last Active</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => {
                  return (
                    <tr key={user.id} className="group transition-all hover:bg-gray-50/50 dark:hover:bg-zinc-800/30"
                   
                    >
                      {/* Name / User */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={user.profile_image ? userService.getProfileImageUrl(user.profile_image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt={user.name} 
                            className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                            }}
                          />
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{user.name}</p>
                            <p className="text-sm text-gray-400 mt-1 font-medium tracking-wide">{user.user_code}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-6">
                        <div className="space-y-1.5 min-w-[180px]">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <Mail className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                              <Phone className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                              <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-6">
                        <div className={`role-badge ${
                          user.role?.name?.toLowerCase() === 'administrator' ? 'role-badge-admin' :
                          user.role?.name?.toLowerCase() === 'manager' ? 'role-badge-manager' :
                          user.role?.name?.toLowerCase() === 'warehouse staff' ? 'role-badge-staff' :
                          user.role?.name?.toLowerCase() === 'sales representative' ? 'role-badge-sales' :
                          user.role?.name?.toLowerCase() === 'accountant' ? 'role-badge-accountant' :
                          'role-badge-default'
                        }`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {user.role?.name || "No Role"}
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                             {user.branches?.length > 0 ? user.branches.map(b => b.branch_name).join(", ") : "Not Assigned"}
                          </span>
                          {user.suppliers?.length > 0 && (
                            <span className="text-xs font-medium text-blue-500">
                              {user.suppliers.map(s => s.name || s.supplier_code).join(", ")}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6">
                        <div className={user.status ? 'status-badge-active' : 'status-badge-inactive'}>
                          <div className={user.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                          {user.status ? "Active" : "Inactive"}
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="px-6 py-6">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                            {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "-"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative">
                            <button 
                              onClick={() => toggleMenu(user.id)}
                              className={`p-2 rounded-xl transition-all menu-button ${
                                menuOpenId === user.id 
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg menu-button-active'
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            
                            {menuOpenId === user.id && (
                              <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                index > paginatedUsers.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                              }`}>
                                <button 
                                  onClick={() => handleViewUser(user)}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <Link 
                                  href={`/dashboard/users/edit/${user.id}`}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit User
                                </Link>
                                <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                <button 
                                  onClick={() => handleDeleteClick(user)} 
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete User
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
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredUsers.length}</span> entries
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
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all pagination-button ${
                    currentPage === i + 1 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10 pagination-active' 
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

      {/* View User Modal */}
      {viewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img 
                    src={selectedUser.profile_image ? userService.getProfileImageUrl(selectedUser.profile_image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`}
                    alt={selectedUser.name} 
                    className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`;
                    }}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white dark:border-zinc-900 ${selectedUser.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{selectedUser.user_code}</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mt-2 ${selectedUser.status ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${selectedUser.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {selectedUser.status ? "Active" : "Inactive"}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleViewClose}
                className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{selectedUser.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2 break-all">{selectedUser.email}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{selectedUser.phone || "Not provided"}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Code</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{selectedUser.user_code}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</label>
                    <div className={`inline-flex mt-3 role-badge ${
                      selectedUser.role?.name?.toLowerCase() === 'administrator' ? 'role-badge-admin' :
                      selectedUser.role?.name?.toLowerCase() === 'manager' ? 'role-badge-manager' :
                      selectedUser.role?.name?.toLowerCase() === 'warehouse staff' ? 'role-badge-staff' :
                      selectedUser.role?.name?.toLowerCase() === 'sales representative' ? 'role-badge-sales' :
                      selectedUser.role?.name?.toLowerCase() === 'accountant' ? 'role-badge-accountant' :
                      'role-badge-default'
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {selectedUser.role?.name || "No Role"}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
                    <div className={`inline-flex mt-3 ${selectedUser.status ? 'status-badge-active' : 'status-badge-inactive'}`}>
                      <div className={selectedUser.status ? 'status-dot-active' : 'status-dot-inactive'}></div>
                      {selectedUser.status ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  Assignments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-6">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 block">Assigned Branches</label>
                    <div className="space-y-3">
                      {selectedUser.branches?.length > 0 ? (
                        selectedUser.branches.map((branch, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{branch.branch_name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No branches assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-6">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 block">Associated Suppliers</label>
                    <div className="space-y-3">
                      {selectedUser.suppliers?.length > 0 ? (
                        selectedUser.suppliers.map((supplier, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                              <Store className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{supplier.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Store className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No suppliers assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              {selectedUser.permissions && selectedUser.permissions.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    Permissions
                  </h3>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedUser.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-md flex items-center justify-center">
                            <Check className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{permission.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                      {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : "Not available"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                      {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleString() : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-4 p-8 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                User ID: <span className="font-mono font-bold text-gray-900 dark:text-white">#{selectedUser.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleViewClose}
                  className="px-6 py-3 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-zinc-600 transition-all"
                >
                  Close
                </button>
                <Link 
                  href={`/dashboard/users/edit/${selectedUser.id}`}
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2 btn-primary"
                  onClick={handleViewClose}
                >
                  <Pencil className="w-4 h-4" />
                  Edit User
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete User</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</span>? 
                This action cannot be undone.
              </p>
              
              {/* User Info */}
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedUser.profile_image ? userService.getProfileImageUrl(selectedUser.profile_image) : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`}
                    alt={selectedUser.name} 
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`;
                    }}
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                    <p className="text-xs text-gray-400 dark:text-white">{selectedUser.user_code}</p>
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
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

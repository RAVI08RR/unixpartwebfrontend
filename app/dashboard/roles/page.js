"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Shield, Filter, Download, Plus, ChevronLeft, ChevronRight,
  MoreVertical, Search, ShieldCheck, UserCog, Package, UserCheck,
  Pencil, Trash2, Check, X, Eye, Ban, Loader2
} from "lucide-react";
import { useRoles } from "../../lib/hooks/useRoles";

export default function RolesPage() {
  const { roles, loading, error, updateRole, deleteRole } = useRoles();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Helper function to get role icon and badge color
  const getRoleDisplay = (roleName) => {
    const name = roleName?.toLowerCase() || '';
    if (name.includes('admin')) {
      return {
        icon: ShieldCheck,
        badgeColor: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400 border-purple-100 dark:border-purple-500/20"
      };
    } else if (name.includes('manager')) {
      return {
        icon: UserCog,
        badgeColor: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
      };
    } else if (name.includes('warehouse') || name.includes('staff')) {
      return {
        icon: Package,
        badgeColor: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20"
      };
    } else {
      return {
        icon: UserCheck,
        badgeColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
      };
    }
  };

  // Edit Handlers
  const handleEdit = (role) => {
    setEditingId(role.id);
    setEditForm({
      name: role.name,
      description: role.description || '',
    });
    setMenuOpenId(null);
  };

  const toggleMenu = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateRole(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await deleteRole(id);
      } catch (error) {
        alert(`Delete failed: ${error.message}`);
      }
    }
  };

  // Filter and search logic
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      return role.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, roles]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="text-gray-500 font-medium">Loading roles...</span>
        </div>
      </div>
    );
  }

  if (error && roles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 font-medium mb-2">Error loading roles</div>
          <div className="text-gray-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Role Management</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Manage your user management</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-6xl justify-end">
          {/* Search Bar */}
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..."
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
            <button 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            
            <Link href="/dashboard/roles/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add Role</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800/50">
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Role Name</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Assigned Users</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10">Access Level</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"
                style={{
                  width: '22rem'
                }}
                >Last Updated</th>
                <th className="px-6 py-6 text-left text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] bg-gray-50/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
              {paginatedRoles.length > 0 ? (
                paginatedRoles.map((role, index) => {
                  const roleDisplay = getRoleDisplay(role.name);
                  const IconComponent = roleDisplay.icon;
                  return (
                    <tr key={role.id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all"
                    style={{
                      borderBottom:'1px solid  #E2E8F0'
                    }}
                    >
                      <td className="px-6 py-6">
                        {editingId === role.id ? (
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        ) : (
                          <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{role.name}</p>
                        )}
                      </td>

                      <td className="px-6 py-6">
                        {editingId === role.id ? (
                          <input
                            type="text"
                            name="description"
                            value={editForm.description}
                            onChange={handleChange}
                            placeholder="Role description"
                            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-[11px] font-black focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        ) : (
                          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[11px] font-black tracking-tight ${roleDisplay.badgeColor}`}>
                            <IconComponent className="w-3.5 h-3.5" />
                            {role.name}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-6">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {role.permissions ? `${role.permissions.length} permissions` : 'View Access Level'}
                        </span>
                      </td>

                      <td className="px-6 py-6">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {role.updated_at ? new Date(role.updated_at).toLocaleDateString() : 'Recently'}
                        </span>
                      </td>

                      <td className="px-6 py-6 text-center relative">
                        <div className="flex items-center justify-start gap-2">
                          {editingId === role.id ? (
                            <>
                              <button 
                                onClick={handleSave}
                                className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-xl transition-all shadow-md shadow-green-500/20"
                                title="Save"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={handleCancel}
                                className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-500/20"
                                title="Cancel"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <div className="relative">
                              <button 
                                onClick={() => toggleMenu(role.id)}
                                className={`p-2 rounded-xl transition-all ${
                                  menuOpenId === role.id 
                                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                }`}
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              
                              {menuOpenId === role.id && (
                                <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                  index > paginatedRoles.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                                }`}>
                                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                    <Eye className="w-4 h-4" />
                                    View Access
                                  </button>
                                  <button 
                                    onClick={() => handleEdit(role)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                    Edit Role
                                  </button>
                                  <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 rounded-xl transition-colors">
                                    <Ban className="w-4 h-4" />
                                    Deactivate
                                  </button>
                                  <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                  <button 
                                    onClick={() => handleDelete(role.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Role
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
                  <td colSpan="5" className="py-24 text-center">
                    <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No roles found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-gray-50/50 dark:bg-zinc-800/20 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900 dark:text-white font-black">{startIndex + 1}</span> to <span className="text-gray-900 dark:text-white font-black">{Math.min(startIndex + itemsPerPage, filteredRoles.length)}</span> of <span className="text-gray-900 dark:text-white font-black">{filteredRoles.length}</span> entries
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
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
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
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Mail, Phone, MoreVertical, Search, 
  Filter, Download, Plus, ChevronLeft, ChevronRight,
  ShieldCheck, UserCheck, UserCog, Package, ShieldAlert,
  Info, Pencil, Trash2, Check, X, Eye, Ban, RefreshCw
} from "lucide-react";
import { useUsers } from "@/app/lib/hooks/useUsers";
import { userService } from "@/app/lib/services/userService";
import { roleService } from "@/app/lib/services/roleService";

// Initial user data
const initialUsers = [
  {
    id: 1,
    name: "Ahmed",
    role: "Administrator",
    roleColor: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400 border-purple-100 dark:border-purple-500/20",
    roleIcon: ShieldCheck,
    email: "ahmed.mansoori@unixparts.com",
    phone: "+971 50 123 4567",
    branch: "Main Warehouse - Dubai",
    status: "Active",
    lastActive: "2 minutes ago",
    avatar: "https://ui-avatars.com/api/?name=Ahmed+Al-Mansoori&background=0D8ABC&color=fff"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Manager",
    roleColor: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
    roleIcon: UserCog,
    email: "sarah.johnson@unixparts.com",
    phone: "+971 52 234 5678",
    branch: "Branch 1 - Abu Dhabi",
    status: "Active",
    lastActive: "1 hour ago",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=F3F4F6&color=333"
  },
  {
    id: 3,
    name: "Mohammed Hassan",
    role: "Warehouse Staff",
    roleColor: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
    roleIcon: Package,
    email: "mohammed.hassan@unixparts.com",
    phone: "+971 55 345 6789",
    branch: "Branch 2 - Sharjah",
    status: "Active",
    lastActive: "3 hours ago",
    avatar: "https://ui-avatars.com/api/?name=Mohammed+Hassan&background=333&color=fff"
  },
  {
    id: 4,
    name: "Lisa Chen",
    role: "Sales Representative",
    roleColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
    roleIcon: UserCheck,
    email: "lisa.chen@unixparts.com",
    phone: "+971 56 456 7890",
    branch: "Main Warehouse - Dubai",
    status: "Active",
    lastActive: "5 hours ago",
    avatar: "https://ui-avatars.com/api/?name=Lisa+Chen&background=0D8ABC&color=fff"
  },
  {
    id: 5,
    name: "Omar Khalid",
    role: "Accountant",
    roleColor: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20",
    roleIcon: ShieldAlert,
    email: "omar.khalid@unixparts.com",
    phone: "+971 50 567 8901",
    branch: "Branch 1 - Abu Dhabi",
    status: "Active",
    lastActive: "Yesterday",
    avatar: "https://ui-avatars.com/api/?name=Omar+Khalid&background=333&color=fff"
  },
  {
    id: 6,
    name: "Emma Wilson",
    role: "Warehouse Staff",
    roleColor: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
    roleIcon: Package,
    email: "emma.wilson@unixparts.com",
    phone: "+971 52 678 9012",
    branch: "Branch 3 - Ajman",
    status: "Inactive",
    lastActive: "2 days ago",
    avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=0D8ABC&color=fff"
  },
  {
    id: 7,
    name: "Ali Rahman",
    role: "Viewer",
    roleColor: "text-slate-600 bg-slate-50 dark:bg-slate-500/10 dark:text-slate-400 border-slate-100 dark:border-slate-500/20",
    roleIcon: Users,
    email: "ali.rahman@unixparts.com",
    phone: "+971 55 789 0123",
    branch: "Branch 4 - Ras Al Khaimah",
    status: "Active",
    lastActive: "1 week ago",
    avatar: "https://ui-avatars.com/api/?name=Ali+Rahman&background=0D8ABC&color=fff"
  },
  {
    id: 8,
    name: "Fatima Al-Said",
    role: "Manager",
    roleColor: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
    roleIcon: UserCog,
    email: "fatima.said@unixparts.com",
    phone: "+971 56 890 1234",
    branch: "Branch 2 - Sharjah",
    status: "Suspended",
    lastActive: "2 weeks ago",
    avatar: "https://ui-avatars.com/api/?name=Fatima+Al-Said&background=0D8ABC&color=fff"
  }
];

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Data Fetching
  const itemsPerPage = 8;
  const { users: apiUsers, isLoading, isError, mutate } = useUsers(0, 100);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    roleService.getAll().then(data => {
      setRoles(Array.isArray(data) ? data : []);
    }).catch(err => console.error("Failed to fetch roles", err));
  }, []);
  
  // Handle Data Selection (API vs Mock)
  const users = useMemo(() => {
    if (typeof window === 'undefined') return [];

    const token = localStorage.getItem('access_token');
    const isMockToken = token?.startsWith('mock_token_');
    const hasRealToken = token && !isMockToken;
    
    // Log the data state for debugging
    console.log("UX-DASHBOARD DATA DEBUG:", {
      hasApiData: !!apiUsers,
      apiCount: apiUsers?.length,
      isMockToken,
      hasRealToken,
      isLoading,
      isError
    });

    // 1. If explicitly in mock mode -> initialUsers
    if (isMockToken) return initialUsers;
    
    // 2. If we have a real token -> strictly use API data
    if (hasRealToken) {
        // Handle both array and object responses
        const data = Array.isArray(apiUsers) ? apiUsers : (apiUsers?.users || []);
        return data;
    }

    // 3. If no token at all, fallback to initialUsers (for demo/landing)
    return initialUsers;
  }, [apiUsers, isError, isLoading]);

  // Reset to first page when users list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  // Inline Editing State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);

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

  // Inline Editing Handlers
  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ ...user });
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
        // Construct a clean, strict payload matching UserUpdate schema provided by user
        const payload = {
            name: editForm.name || undefined,
            email: editForm.email || undefined,
            role_id: editForm.role_id ? parseInt(editForm.role_id) : undefined,
            status: typeof editForm.status === 'boolean' ? editForm.status : (editForm.status === "true"),
        };

        // Handle Branch IDs
        if (editForm.branches) {
            payload.branch_ids = editForm.branches.map(b => 
                typeof b === 'object' ? parseInt(b.id) : parseInt(b)
            ).filter(id => !isNaN(id));
        }
        
        // Handle Supplier IDs
        if (editForm.suppliers) {
            payload.supplier_ids = editForm.suppliers.map(s => 
                typeof s === 'object' ? parseInt(s.id) : parseInt(s)
            ).filter(id => !isNaN(id));
        }

        // Handle Permission IDs (if any)
        if (editForm.permissions) {
             payload.permission_ids = editForm.permissions.map(p => 
                typeof p === 'object' ? parseInt(p.id) : parseInt(p)
            ).filter(id => !isNaN(id));
        }

        // Clean up undefined fields
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        console.log("Saving User Update with strict schema:", { id: editingId, payload });

        await userService.update(editingId, payload);
        
        // Success: Refresh and clean up
        mutate(); 
        setEditingId(null);
        setEditForm({});
        setMenuOpenId(null);
    } catch (error) {
        console.error("Update Error Details:", error);
        alert(`Update Failed: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
      if(confirm("Are you sure you want to delete this user?")) {
          try {
              await userService.delete(id);
              mutate();
          } catch (error) {
              console.error("Failed to delete user", error);
              alert("Failed to delete user");
          }
      }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading && (!users || users.length === 0)) return <div className="p-10 text-center">Loading users...</div>;

  return (
    <div className="space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
        <div className="shrink-0">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">User Management</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-normal">Manage your user management</p>
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
            <Link href="/dashboard/users/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-black/10 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span className="whitespace-nowrap font-black">Add User</span>
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
                  const isEditing = editingId === user.id;
                  
                  return (
                    <tr key={user.id} className={`group transition-all ${isEditing ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'}`}
                    style= {{borderBottom :"0.9px solid #E2E8F0"}}
                    >
                      {/* Name / User */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt={user.name} 
                            className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                          />
                          <div>
                            {isEditing ? (
                              <input 
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight">{user.name}</p>
                            )}
                            <p className="text-sm text-gray-400 mt-1 font-medium tracking-wide">{user.user_code}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-6">
                        <div className="space-y-1.5 min-w-[180px]">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group/item">
                            <Mail className="w-3.5 h-3.5 transition-colors group-hover/item:text-red-500" />
                            {isEditing ? (
                              <input 
                                type="email"
                                name="email"
                                value={editForm.email}
                                onChange={handleChange}
                                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="text-[14px] font-normal group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{user.email}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-6">
                        {isEditing ? (
                          <select
                            name="role_id"
                            value={editForm.role_id}
                            onChange={handleChange}
                            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-black focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Role</option>
                            {roles.map(role => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-black tracking-tight`}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {user.role?.name || "No Role"}
                          </div>
                        )}
                      </td>

                      {/* Branch */}
                      <td className="px-6 py-6">
                             <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                {user.branches && user.branches.length > 0 ? user.branches.map(b => b.branch_name).join(", ") : "Main Warehouse"}
                             </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-6">
                        {isEditing ? (
                           <select
                              name="status"
                              value={editForm.status}
                              onChange={handleChange}
                              className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-black focus:ring-2 focus:ring-blue-500"
                           >
                             <option value={true}>Active</option>
                             <option value={false}>Inactive</option>
                           </select>
                        ) : (
                          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-black ${
                            user.status 
                              ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' 
                              : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              user.status ? 'bg-green-600' : 'bg-red-600'
                            }`}></div>
                            {user.status ? "Active" : "Inactive"}
                          </div>
                        )}
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
                           {isEditing ? (
                              <>
                                <button onClick={handleSave} className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-xl transition-all shadow-md shadow-green-500/20" title="Save">
                                  <Check className="w-5 h-5" />
                                </button>
                                <button onClick={handleCancel} className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-500/20" title="Cancel">
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                           ) : (
                              <div className="relative">
                                <button 
                                  onClick={() => toggleMenu(user.id)}
                                  className={`p-2 rounded-xl transition-all ${
                                    menuOpenId === user.id 
                                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg'
                                      : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                  }`}
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>
                                
                                {menuOpenId === user.id && (
                                  <div className={`absolute right-0 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl z-100 p-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                                    index > paginatedUsers.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'
                                  }`}>
                                    <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </button>
                                    <button 
                                      onClick={() => handleEdit(user)}
                                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 rounded-xl transition-colors"
                                    >
                                      <Pencil className="w-4 h-4" />
                                      Edit User
                                    </button>
                                    <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />
                                    <button onClick={() => handleDelete(user.id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                      Delete User
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
    </div>
  );
}

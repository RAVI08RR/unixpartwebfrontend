"use client";

import React from "react";
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Building2, 
  Tag, 
  Calendar,
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useCurrentUser } from "@/app/lib/hooks/useCurrentUser";

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "AU";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black dark:text-white">Profile Not Found</h2>
          <p className="text-gray-500">Please try logging in again to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Profile Details</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">View and manage your account information</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-sm shadow-xl shadow-black/10 active:scale-95 transition-all w-full sm:w-auto">
          <Settings className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden group">
            <div className="h-32 bg-gradient-to-r from-red-600 to-red-800 relative">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>
            <div className="px-8 pb-8 -mt-16 relative">
              <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-zinc-900 p-2 shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full rounded-[32px] bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-4xl font-black shadow-inner">
                  {getInitials(user.name)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl bg-green-500 border-4 border-white dark:border-zinc-900 flex items-center justify-center shadow-lg">
                   <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <h2 className="text-2xl font-black dark:text-white leading-tight group-hover:text-red-600 transition-colors">{user.name}</h2>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-bold truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-zinc-800">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.status ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {user.status ? "Active Account" : "Inactive Account"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats/Summary Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 p-6 shadow-sm space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">System Information</h3>
                <ShieldCheck className="w-5 h-5 text-red-600" />
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                         <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Main Role</span>
                   </div>
                   <span className="text-sm font-black dark:text-white uppercase tracking-tight">{user.role?.name || "Member"}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                         <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Branches</span>
                   </div>
                   <span className="text-sm font-black dark:text-white">{user.branches?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                         <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Joined</span>
                   </div>
                   <span className="text-sm font-black dark:text-white">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "Recently"}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column - Detailed Info Grid */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal & Account Details */}
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm">
             <h3 className="text-xl font-black dark:text-white pb-6 border-b border-gray-50 dark:border-zinc-800 mb-8 flex items-center gap-3">
               <UserIcon className="w-6 h-6 text-red-600" />
               Account Details
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
               <DetailItem 
                  icon={<UserIcon />}
                  label="Full Name"
                  value={user.name}
               />
               <DetailItem 
                  icon={<Mail />}
                  label="Email Address"
                  value={user.email}
               />
               <DetailItem 
                  icon={<ShieldCheck />}
                  label="Permissions Role"
                  value={user.role?.name || "Standard User"}
               />
               <DetailItem 
                  icon={<Calendar />}
                  label="Account Created"
                  value={user.created_at ? new Date(user.created_at).toLocaleString() : "Recently"}
               />
             </div>
          </div>

          {/* Assigned Access Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Branches */}
             <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm group">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-black dark:text-white flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Branches
                   </h3>
                   <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase">
                      {user.branches?.length || 0} Total
                   </span>
                </div>
                <div className="space-y-3">
                   {user.branches && user.branches.length > 0 ? (
                      user.branches.map((branch, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10 transition-colors">
                            <span className="text-sm font-bold dark:text-white">{branch.branch_name}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{branch.branch_code}</span>
                         </div>
                      ))
                   ) : (
                      <p className="text-sm text-gray-500 font-medium italic">No branches assigned</p>
                   )}
                </div>
             </div>

             {/* Suppliers */}
             <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-gray-100 dark:border-zinc-800 p-8 shadow-sm group">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-black dark:text-white flex items-center gap-3">
                      <Tag className="w-5 h-5 text-purple-600" />
                      Suppliers
                   </h3>
                   <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-black uppercase">
                      {user.suppliers?.length || 0} Total
                   </span>
                </div>
                <div className="space-y-3">
                   {user.suppliers && user.suppliers.length > 0 ? (
                      user.suppliers.map((supplier, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl group-hover:bg-purple-50/30 dark:group-hover:bg-purple-900/10 transition-colors">
                            <span className="text-sm font-bold dark:text-white">{supplier.name || supplier.company}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                         </div>
                      ))
                   ) : (
                      <p className="text-sm text-gray-500 font-medium italic">No suppliers assigned</p>
                   )}
                </div>
             </div>
          </div>
          
          {/* Recent Activity Placeholder */}
          <div className="bg-gradient-to-br from-zinc-900 to-black dark:from-zinc-100 dark:to-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <ShieldCheck className="w-32 h-32 text-white dark:text-black" />
             </div>
             <div className="relative z-10">
                <h3 className="text-xl font-black text-white dark:text-black mb-2">Security & Identity</h3>
                <p className="text-gray-400 dark:text-gray-500 text-sm max-w-md font-medium">Your identity is managed through the central ERP system. Role-based permissions are enforced globally across all modules.</p>
                <div className="mt-8 flex flex-wrap gap-4">
                   <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                      Change Password
                   </button>
                   <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 dark:bg-black/5 hover:bg-white/20 dark:hover:bg-black/10 text-white dark:text-black border border-white/10 dark:border-black/5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                      View Permissions
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-red-600 transition-colors">
        {React.cloneElement(icon, { className: "w-3 h-3" })}
        {label}
      </div>
      <div className="text-[15px] font-black text-gray-900 dark:text-white break-words">
        {value || "-"}
      </div>
    </div>
  );
}

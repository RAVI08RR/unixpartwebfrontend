"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, Plus, Search, Eye, CheckCircle, XCircle, Loader2, Clock, Trash2, Edit
} from "lucide-react";
import { leaveService } from "@/app/lib/services/leaveService";
import { useToast } from "@/app/components/Toast";

export default function LeavesPage() {
  const { success, error } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesData, pendingData] = await Promise.all([
        leaveService.getAll(),
        leaveService.getPending()
      ]);
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setPendingCount(Array.isArray(pendingData) ? pendingData.length : 0);
    } catch (err) {
      error("Failed to load leaves data");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.approve(id);
      success("Leave approved successfully!");
      fetchData();
    } catch (err) {
      error(err.message || "Failed to approve leave");
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this leave request?")) return;
    
    try {
      await leaveService.reject(id);
      success("Leave rejected!");
      fetchData();
    } catch (err) {
      error(err.message || "Failed to reject leave");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this leave? This action cannot be undone.")) return;
    
    try {
      await leaveService.delete(id);
      success("Leave deleted successfully!");
      fetchData();
    } catch (err) {
      error(err.message || "Failed to delete leave");
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const employeeName = `${leave.employee?.first_name || ''} ${leave.employee?.last_name || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      employeeName.includes(searchLower) ||
      leave.leave_type?.toLowerCase().includes(searchLower) ||
      leave.status?.toLowerCase().includes(searchLower) ||
      leave.reason?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading leaves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaves</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage employee leave requests
          </p>
        </div>
        <Link
          href="/dashboard/management/leaves/submit"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Submit Leave
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by employee, type, or status..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Leaves</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{leaves.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {leaves.filter(l => l.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {leaves.filter(l => l.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {filteredLeaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    From - To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {leave.employee ? `${leave.employee.first_name} ${leave.employee.last_name}` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">ID: {leave.employee_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {leave.leave_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {leave.start_date} - {leave.end_date}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {leave.days || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        leave.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : leave.status === 'rejected'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {leave.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/management/leaves/${leave.id}`}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </Link>
                        <Link
                          href={`/dashboard/management/leaves/edit/${leave.id}`}
                          className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors group"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-400 group-hover:text-yellow-600" />
                        </Link>
                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(leave.id)}
                              className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                            </button>
                            <button
                              onClick={() => handleReject(leave.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(leave.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {searchTerm ? "No leaves found matching your search" : "No leave requests yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

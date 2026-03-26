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
  
  // Modal states
  const [viewModal, setViewModal] = useState({ isOpen: false, leave: null });
  const [approveModal, setApproveModal] = useState({ isOpen: false, leave: null, notes: '' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, leave: null, notes: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, leave: null });

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

  const handleApprove = async () => {
    if (!approveModal.leave) return;
    
    try {
      await leaveService.approve(approveModal.leave.id, approveModal.notes);
      success("Leave approved successfully!");
      setApproveModal({ isOpen: false, leave: null, notes: '' });
      fetchData();
    } catch (err) {
      error(err.message || "Failed to approve leave");
    }
  };

  const handleReject = async () => {
    if (!rejectModal.leave) return;
    
    try {
      await leaveService.reject(rejectModal.leave.id, rejectModal.notes);
      success("Leave rejected!");
      setRejectModal({ isOpen: false, leave: null, notes: '' });
      fetchData();
    } catch (err) {
      error(err.message || "Failed to reject leave");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.leave) return;
    
    try {
      await leaveService.delete(deleteModal.leave.id);
      success("Leave deleted successfully!");
      setDeleteModal({ isOpen: false, leave: null });
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
                        <button
                          onClick={() => setViewModal({ isOpen: true, leave })}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>
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
                              onClick={() => setApproveModal({ isOpen: true, leave, notes: '' })}
                              className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                            </button>
                            <button
                              onClick={() => setRejectModal({ isOpen: true, leave, notes: '' })}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, leave })}
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

      {/* View Modal */}
      {viewModal.isOpen && viewModal.leave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl w-full border border-gray-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leave Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Employee</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {viewModal.leave.employee ? `${viewModal.leave.employee.first_name} ${viewModal.leave.employee.last_name}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Employee ID</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{viewModal.leave.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Leave Type</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{viewModal.leave.leave_type}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${
                    viewModal.leave.status === 'approved'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : viewModal.leave.status === 'rejected'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {viewModal.leave.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{viewModal.leave.start_date}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{viewModal.leave.end_date}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Total Days</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{viewModal.leave.total_days || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Created At</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{viewModal.leave.created_at}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Reason</p>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{viewModal.leave.reason || 'N/A'}</p>
              </div>
              {viewModal.leave.approval_date && (
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Approval Date</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{viewModal.leave.approval_date}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex gap-3 justify-end">
              <button
                onClick={() => setViewModal({ isOpen: false, leave: null })}
                className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-zinc-800">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Approve Leave</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to approve this leave request?
              </p>
              {approveModal.leave && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-bold">Employee:</span> {approveModal.leave.employee ? `${approveModal.leave.employee.first_name} ${approveModal.leave.employee.last_name}` : 'N/A'}</p>
                  <p className="text-sm"><span className="font-bold">Type:</span> {approveModal.leave.leave_type}</p>
                  <p className="text-sm"><span className="font-bold">Period:</span> {approveModal.leave.start_date} to {approveModal.leave.end_date}</p>
                  <p className="text-sm"><span className="font-bold">Days:</span> {approveModal.leave.total_days || 0}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={approveModal.notes}
                  onChange={(e) => setApproveModal({ ...approveModal, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Add approval notes..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex gap-3 justify-end">
              <button
                onClick={() => setApproveModal({ isOpen: false, leave: null, notes: '' })}
                className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-zinc-800">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reject Leave</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to reject this leave request?
              </p>
              {rejectModal.leave && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-bold">Employee:</span> {rejectModal.leave.employee ? `${rejectModal.leave.employee.first_name} ${rejectModal.leave.employee.last_name}` : 'N/A'}</p>
                  <p className="text-sm"><span className="font-bold">Type:</span> {rejectModal.leave.leave_type}</p>
                  <p className="text-sm"><span className="font-bold">Period:</span> {rejectModal.leave.start_date} to {rejectModal.leave.end_date}</p>
                  <p className="text-sm"><span className="font-bold">Days:</span> {rejectModal.leave.total_days || 0}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectModal.notes}
                  onChange={(e) => setRejectModal({ ...rejectModal, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Explain why this leave is being rejected..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex gap-3 justify-end">
              <button
                onClick={() => setRejectModal({ isOpen: false, leave: null, notes: '' })}
                className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Reject Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-zinc-800">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Leave</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this leave? This action cannot be undone.
              </p>
              {deleteModal.leave && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-bold">Employee:</span> {deleteModal.leave.employee ? `${deleteModal.leave.employee.first_name} ${deleteModal.leave.employee.last_name}` : 'N/A'}</p>
                  <p className="text-sm"><span className="font-bold">Type:</span> {deleteModal.leave.leave_type}</p>
                  <p className="text-sm"><span className="font-bold">Period:</span> {deleteModal.leave.start_date} to {deleteModal.leave.end_date}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, leave: null })}
                className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

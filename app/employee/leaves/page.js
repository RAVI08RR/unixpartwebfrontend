"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar, Send, Trash2, Loader2,
  ChevronLeft, ChevronRight, CheckCircle,
  Clock, XCircle, AlertCircle, FileText, Info
} from "lucide-react";
import { employeeSelfService } from "../../lib/services/employeeSelfService";
import { useToast } from "../../components/Toast";
import { useCurrentUser } from "../../lib/hooks/useCurrentUser";
import { TableContainer, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from "@/app/components/Table";

export default function EmployeeLeaves() {
  const { user } = useCurrentUser();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Raw leave balance object from API:
  // { employee_id, annual_entitlement, leaves_taken, leaves_pending, balance }
  const [leaveBalance, setLeaveBalance] = useState(null);

  // Leaves array from API:
  // [{ employee_id, id, start_date, total_days, status, approval_date,
  //    created_at, leave_type, end_date, reason, approved_by, proof_documents, updated_at }]
  const [leaves, setLeaves] = useState([]);

  // Pagination
  const [page, setPage]   = useState(1);
  const limit             = 10;
  const [hasMore, setHasMore] = useState(false);

  // New leave form
  const [formData, setFormData] = useState({
    leave_type: "annual",
    start_date: "",
    end_date: "",
    total_days: 1,
    reason: "",
  });

  // Load on mount and page change
  useEffect(() => {
    if (user) fetchData();
  }, [page, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Raw leave balance
      try {
        const bal = await employeeSelfService.getLeaveBalanceRaw();
        setLeaveBalance(bal);
      } catch (e) { console.warn("Leave balance:", e.message); }

      // 2. Paginated leaves (API returns all, we paginate client-side)
      const allLeaves = await employeeSelfService.getLeaves(0, 100);
      if (Array.isArray(allLeaves)) {
        // Sort newest first by created_at
        const sorted = [...allLeaves].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        const start = (page - 1) * limit;
        const pageData = sorted.slice(start, start + limit + 1);
        if (pageData.length > limit) {
          setHasMore(true);
          setLeaves(pageData.slice(0, limit));
        } else {
          setHasMore(false);
          setLeaves(pageData);
        }
      }
    } catch (err) {
      showErrorToast(err.message || "Failed to load leave data");
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate total_days when dates change
  const recalcDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleStartDateChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      start_date: val,
      total_days: recalcDays(val, prev.end_date),
    }));
  };

  const handleEndDateChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      end_date: val,
      total_days: recalcDays(prev.start_date, val),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date) {
      showErrorToast("Please select start and end dates");
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      showErrorToast("Start date cannot be after end date");
      return;
    }
    if (!formData.reason.trim()) {
      showErrorToast("Please enter a reason for the leave");
      return;
    }

    setSubmitting(true);
    try {
      // submitLeave uses multipart/form-data (see employeeSelfService)
      await employeeSelfService.submitLeave({
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date:   formData.end_date,
        total_days: parseInt(formData.total_days, 10),
        reason:     formData.reason,
      });
      showSuccessToast("Leave request submitted successfully! ✅");
      setFormData({ leave_type: "annual", start_date: "", end_date: "", total_days: 1, reason: "" });
      setPage(1);
      fetchData();
    } catch (err) {
      showErrorToast(err.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm("Cancel this pending leave request?")) return;
    setCancellingId(leaveId);
    try {
      await employeeSelfService.cancelLeave(leaveId);
      showSuccessToast("Leave request cancelled.");
      fetchData();
    } catch (err) {
      showErrorToast(err.message || "Failed to cancel leave");
    } finally {
      setCancellingId(null);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (str) => {
    if (!str) return "—";
    try { return new Date(str).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }); }
    catch { return str; }
  };

  const formatDateTime = (str) => {
    if (!str) return "—";
    try { return new Date(str).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return str; }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "approved") return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30">
        <CheckCircle className="w-3 h-3" /> Approved
      </span>
    );
    if (s === "rejected") return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Requests</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-0.5">
          Submit time-off requests and track approval status
        </p>
      </div>

      {/* Leave Balance Summary — from GET /api/employee/me/leave-balance */}
      {leaveBalance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Annual Entitlement", value: leaveBalance.annual_entitlement, color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/20" },
            { label: "Available Balance",  value: leaveBalance.balance,            color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/20" },
            { label: "Leaves Taken",       value: leaveBalance.leaves_taken,       color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20" },
            { label: "Pending Approval",   value: leaveBalance.leaves_pending,     color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20" },
          ].map((card) => (
            <div key={card.label} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <div className={`inline-flex p-2 rounded-xl ${card.bg} mb-3`}>
                <Calendar className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{card.value ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Used progress bar */}
      {leaveBalance && leaveBalance.annual_entitlement > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm">
          <div className="flex justify-between text-xs text-gray-500 font-medium mb-2">
            <span>Leave usage this year</span>
            <span>{leaveBalance.leaves_taken} / {leaveBalance.annual_entitlement} days used</span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (leaveBalance.leaves_taken / leaveBalance.annual_entitlement) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Apply Form ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
            <Send className="w-4 h-4 text-red-500" />
            Apply for Leave
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Leave Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Leave Type</label>
              <select
                value={formData.leave_type}
                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:text-white"
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:text-white"
                required
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                min={formData.start_date}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:text-white"
                required
              />
            </div>

            {/* Total Days (auto-calculated, read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Days</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 rounded-xl">
                <Calendar className="w-4 h-4 text-red-500" />
                <span className="text-sm font-black text-gray-900 dark:text-white">{formData.total_days} day{formData.total_days !== 1 ? "s" : ""}</span>
                <span className="text-xs text-gray-400 ml-1">(auto-calculated)</span>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reason *</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Briefly describe the reason..."
                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:text-white resize-none"
                rows={3}
                required
              />
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/15 rounded-xl border border-blue-100 dark:border-blue-900/20 text-blue-700 dark:text-blue-400">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Leave requests are subject to manager approval. Sick leave may require a medical certificate.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Request</>
              )}
            </button>
          </form>
        </div>

        {/* ── Leave History Table ─────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Leave Request History</h2>
            <p className="text-xs text-gray-400 mt-0.5">{leaves.length} request{leaves.length !== 1 ? "s" : ""} shown</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            </div>
          ) : leaves.length > 0 ? (
            <div>
              {/* Desktop table */}
              <TableContainer>
                <Table minWidth="800px">
                  <TableHeader>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Period</TableHeaderCell>
                    <TableHeaderCell>Days</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Applied</TableHeaderCell>
                    <TableHeaderCell className="text-right">Action</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((leave) => {
                      const isPending = leave.status?.toLowerCase() === "pending";
                      return (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <p className="font-bold text-gray-900 dark:text-white capitalize text-sm">
                              {leave.leave_type} Leave
                            </p>
                            {leave.reason && (
                              <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[160px]" title={leave.reason}>
                                {leave.reason}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-600 dark:text-zinc-300 whitespace-nowrap">
                              {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-black text-gray-900 dark:text-white">{leave.total_days}</span>
                            <span className="text-xs text-gray-400 ml-1">days</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(leave.status)}</TableCell>
                          <TableCell className="text-xs text-gray-400">
                            {formatDate(leave.created_at)}
                            {leave.approval_date && (
                              <p className="text-[10px] mt-0.5">Approved: {formatDate(leave.approval_date)}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isPending ? (
                              <button
                                disabled={cancellingId === leave.id}
                                onClick={() => handleCancelLeave(leave.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition-colors"
                              >
                                {cancellingId === leave.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                Cancel
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300 dark:text-zinc-700">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 px-6 py-4">
                <span className="text-xs text-gray-500 font-medium">Page {page}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={!hasMore}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No leave requests yet</p>
              <p className="text-xs text-gray-400 mt-1">Use the form to submit your first leave request</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

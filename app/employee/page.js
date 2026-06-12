"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock, Calendar, AlertTriangle, CheckCircle2,
  MapPin, TrendingUp, UserCheck, FileText,
  ChevronRight, ArrowRight, Loader2, Briefcase,
  DollarSign, Building2, Shield, User, BadgeCheck,
  AlertCircle, XCircle, Phone, Mail, Globe
} from "lucide-react";
import { employeeSelfService } from "../lib/services/employeeSelfService";
import { useCurrentUser } from "../lib/hooks/useCurrentUser";
import { useToast } from "../components/Toast";

export default function EmployeeDashboard() {
  const { user, loading: userLoading } = useCurrentUser();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // API data states
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [expiries, setExpiries] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);

  // Geolocation
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Request geolocation once
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => { console.warn("Geolocation:", err.message); setLocationError(err.message); }
      );
    }
  }, []);

  // Load dashboard data when user is ready
  useEffect(() => {
    if (user && (user.is_employee || user.employee_id)) {
      fetchDashboardData();
    } else if (user && !userLoading) {
      // Fallback: user loaded but is_employee not set
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // ── 1. Leave Balance (raw object)
      try {
        const raw = await employeeSelfService.getLeaveBalanceRaw();
        setLeaveBalance(raw);
      } catch (e) { console.warn("Leave balance:", e.message); }

      // ── 2. Document Expiries (transformed array)
      try {
        const expiryArr = await employeeSelfService.getExpiries();
        setExpiries(Array.isArray(expiryArr) ? expiryArr : []);
      } catch (e) { console.warn("Expiries:", e.message); }

      // ── 3. Recent Leaves (up to 5)
      try {
        const leavesData = await employeeSelfService.getLeaves(0, 5);
        setRecentLeaves(Array.isArray(leavesData) ? leavesData : []);
      } catch (e) { console.warn("Leaves:", e.message); }

      // ── 4. Today's Attendance (backend bug → proxy returns [] gracefully)
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const logs = await employeeSelfService.getAttendance(todayStr, todayStr);
        if (Array.isArray(logs) && logs.length > 0) {
          const sorted = [...logs].sort((a, b) => new Date(a.check_in) - new Date(b.check_in));
          setTodayAttendance({
            check_in: sorted[0].check_in,
            check_out: sorted[sorted.length - 1].check_out || null,
            status: sorted[sorted.length - 1].check_out ? "Checked Out" : "Checked In",
          });
        } else {
          setTodayAttendance({ check_in: null, check_out: null, status: "Not Checked In" });
        }
      } catch (e) {
        setTodayAttendance({ check_in: null, check_out: null, status: "Not Checked In" });
      }

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleAttendanceSubmit = async (type) => {
    setActionLoading(true);
    try {
      await employeeSelfService.submitAttendance({ type, notes, latitude: location?.latitude, longitude: location?.longitude });
      showSuccessToast(`Successfully clocked ${type === "check_in" ? "IN ✅" : "OUT 🏁"}!`);
      setNotes("");
      fetchDashboardData();
    } catch (err) {
      showErrorToast(err.message || `Failed to clock ${type === "check_in" ? "in" : "out"}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (str) => {
    if (!str) return "--:--";
    try { return new Date(`1970-01-01T${str}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return str?.substring(0, 5) || "--:--"; }
  };

  const formatDate = (str) => {
    if (!str) return "--";
    try { return new Date(str).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }); }
    catch { return str; }
  };

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getExpiryColor = (days) => {
    if (days <= 0)  return "text-red-600 bg-red-100 dark:bg-red-950/30 border-red-300";
    if (days <= 30) return "text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200";
    if (days <= 90) return "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200";
    return "text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200";
  };

  const formatExpiryDays = (days) => {
    if (days <= 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 1) return "Expires tomorrow";
    return `${days} days left`;
  };

  const getLeaveStatusStyle = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400";
    if (status === "rejected") return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
  };

  const formatCurrency = (amount) =>
    amount != null ? `AED ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "--";

  if (userLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-sm text-gray-500 dark:text-zinc-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Derive values directly from /api/employee/me response ─────────────────
  const fullName      = user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Employee";
  const position      = user?.actual_position || "—";
  const branch        = user?.current_branch?.branch_name || "—";
  const branchCode    = user?.current_branch?.branch_code || "";
  const visaBranch    = user?.branch_on_visa?.branch_name || null;
  const visaBranchCode = user?.branch_on_visa?.branch_code || "";
  const startDate     = user?.position_start_date || user?.created_at;
  const salary        = user?.current_salary;
  const empId         = user?.employee_id || "—";          // "EMP-AUH-003"
  const workEmail     = user?.work_email || user?.email || null;
  const mobile        = user?.mobile_number || null;

  return (
    <div className="space-y-6 pb-12">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Left: greeting + info */}
          <div className="space-y-2">
            <span className="text-zinc-400 text-xs font-bold tracking-widest uppercase">Employee Portal</span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {getGreeting()}, {fullName.split(" ")[0]}! 👋
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
              {/* Employee ID badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-xs font-bold tracking-wide">
                <BadgeCheck className="w-3.5 h-3.5 text-red-400" />
                {empId}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300 text-sm font-medium capitalize">
                <Briefcase className="w-4 h-4 text-red-400 shrink-0" />
                {position}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300 text-sm font-medium">
                <Building2 className="w-4 h-4 text-red-400 shrink-0" />
                {branch}{branchCode ? ` (${branchCode})` : ""}
              </span>
            </div>
            {/* Contact quick info */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              {workEmail && (
                <span className="flex items-center gap-1 text-zinc-500 text-xs">
                  <Mail className="w-3 h-3" />{workEmail}
                </span>
              )}
              {mobile && (
                <span className="flex items-center gap-1 text-zinc-500 text-xs">
                  <Phone className="w-3 h-3" />{mobile}
                </span>
              )}
            </div>
          </div>

          {/* Right: live clock */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shrink-0">
            <Clock className="w-7 h-7 text-red-400" />
            <div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Local Time</p>
              <p className="text-xl font-black tracking-tight tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Salary */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-wide">Monthly Salary</p>
            <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950/20">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(salary)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Current salary</p>
        </div>

        {/* Leave Balance */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-wide">Leave Balance</p>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">{leaveBalance?.balance ?? user?.annual_leave_entitlement ?? "—"} days</p>
          <p className="text-xs text-gray-400 mt-0.5">of {leaveBalance?.annual_entitlement ?? user?.annual_leave_entitlement ?? "—"} annual</p>
        </div>

        {/* Leaves Taken */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-wide">Leaves Taken</p>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-xl font-black text-gray-900 dark:text-white">{leaveBalance?.leaves_taken ?? "0"} days</p>
          <p className="text-xs text-gray-400 mt-0.5">{leaveBalance?.leaves_pending ?? 0} pending</p>
        </div>

        {/* Today Attendance */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-zinc-500 font-bold uppercase tracking-wide">Today</p>
            <div className={`p-1.5 rounded-lg ${todayAttendance?.status === "Checked In" ? "bg-green-50 dark:bg-green-950/20" : "bg-gray-50 dark:bg-zinc-800"}`}>
              <Clock className={`w-4 h-4 ${todayAttendance?.status === "Checked In" ? "text-green-600" : "text-gray-400"}`} />
            </div>
          </div>
          <p className="text-sm font-black text-gray-900 dark:text-white">{todayAttendance?.status || "Not Clocked"}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {todayAttendance?.check_in ? `In: ${formatTime(todayAttendance.check_in)}` : "No check-in yet"}
          </p>
        </div>
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left Column ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Attendance Clock Widget */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-red-500" />
              Daily Attendance Clocking
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Clock buttons */}
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-bold uppercase">Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      todayAttendance?.status === "Checked In"
                        ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : todayAttendance?.status === "Checked Out"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {todayAttendance?.status || "Not Clocked"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black">Check In</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{formatTime(todayAttendance?.check_in)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black">Check Out</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{formatTime(todayAttendance?.check_out)}</p>
                    </div>
                  </div>
                </div>

                <textarea
                  placeholder="Punch notes (optional)..."
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:text-white resize-none"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                {location ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/10 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-900/20">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/10 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/20">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{locationError ? "Location access denied" : "Acquiring location..."}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    disabled={actionLoading || todayAttendance?.status === "Checked In"}
                    onClick={() => handleAttendanceSubmit("check_in")}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-green-600/10"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Clock In"}
                  </button>
                  <button
                    disabled={actionLoading || todayAttendance?.status !== "Checked In"}
                    onClick={() => handleAttendanceSubmit("check_out")}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-amber-600/10"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Clock Out"}
                  </button>
                </div>
              </div>

              {/* Employee Info Panel — from /api/employee/me */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-2.5">
                <h4 className="text-xs font-black text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">My Details</h4>
                {[
                  { label: "Full Name",       value: fullName },
                  { label: "Employee ID",     value: empId },
                  { label: "Position",        value: position, capitalize: true },
                  { label: "Branch",          value: `${branch}${branchCode ? ` (${branchCode})` : ""}` },
                  visaBranch && { label: "Visa Branch", value: `${visaBranch}${visaBranchCode ? ` (${visaBranchCode})` : ""}` },
                  { label: "Since",           value: formatDate(startDate) },
                  { label: "Monthly Salary",  value: formatCurrency(salary), bold: true, green: true },
                  { label: "Status",          value: user?.status || "active", capitalize: true },
                ].filter(Boolean).map((row) => (
                  <div key={row.label} className="flex justify-between items-baseline gap-2">
                    <span className="text-gray-400 dark:text-zinc-500 text-xs shrink-0">{row.label}</span>
                    <span className={`text-xs font-bold text-right ${row.green ? "text-green-600 dark:text-green-400 text-sm" : "text-gray-800 dark:text-zinc-200"} ${row.capitalize ? "capitalize" : ""}`}>
                      {row.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Leave Requests */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                Recent Leave Requests
              </h3>
              <Link href="/employee/leaves" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentLeaves.length > 0 ? (
              <div className="space-y-2.5">
                {recentLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-gray-800 dark:text-white capitalize">
                          {leave.leave_type} Leave
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${getLeaveStatusStyle(leave.status)}`}>
                          {leave.status}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {leave.total_days} day{leave.total_days !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                      </p>
                      {leave.reason && (
                        <p className="text-[10px] text-gray-400 mt-0.5 italic truncate">{leave.reason}</p>
                      )}
                    </div>
                    {leave.status === "approved" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : leave.status === "rejected" ? (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No leave requests found
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column ─────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Document Expiries — from /api/employee/me/expiries */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Document Expiries
            </h3>

            <div className="space-y-2">
              {expiries.length > 0 ? (
                expiries.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border flex items-start gap-2.5 ${getExpiryColor(item.days_remaining)}`}>
                    {item.days_remaining <= 0
                      ? <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      : item.days_remaining <= 90
                      ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black uppercase leading-tight">{item.document_name}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{formatDate(item.expiry_date)}</p>
                      <p className="text-[10px] font-bold mt-0.5">{formatExpiryDays(item.days_remaining)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 bg-green-50/50 dark:bg-green-950/15 rounded-xl border border-green-100 dark:border-green-900/20 flex items-start gap-2.5 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">All documents valid</p>
                    <p className="text-[10px] opacity-80 mt-0.5">No expiries in the next 90 days.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leave Balance Detail — from /api/employee/me/leave-balance */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              Leave Summary
            </h3>
            <div className="space-y-2.5">
              {[
                { label: "Annual Entitlement", value: `${leaveBalance?.annual_entitlement ?? user?.annual_leave_entitlement ?? "—"} days`, color: "text-blue-600 dark:text-blue-400" },
                { label: "Leaves Taken",       value: `${leaveBalance?.leaves_taken ?? 0} days`,    color: "text-amber-600 dark:text-amber-400" },
                { label: "Pending Approval",   value: `${leaveBalance?.leaves_pending ?? 0} days`,  color: "text-purple-600 dark:text-purple-400" },
                { label: "Available Balance",  value: `${leaveBalance?.balance ?? user?.annual_leave_entitlement ?? "—"} days`, color: "text-green-600 dark:text-green-400" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-zinc-400 text-xs">{row.label}</span>
                  <span className={`font-black text-sm ${row.color}`}>{row.value}</span>
                </div>
              ))}

              {/* Usage progress bar */}
              {leaveBalance && (
                <div className="pt-2">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Used</span>
                    <span>{leaveBalance.leaves_taken} of {leaveBalance.annual_entitlement} days</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (leaveBalance.leaves_taken / leaveBalance.annual_entitlement) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/employee/leaves"
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Request Leave <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <div className="space-y-1.5">
              {[
                { label: "My Profile",      href: "/employee/profile",    icon: User },
                { label: "Attendance Logs", href: "/employee/attendance", icon: Clock },
                { label: "Leave Requests",  href: "/employee/leaves",     icon: Calendar },
                { label: "My Documents",    href: "/employee/documents",  icon: FileText },
                { label: "Salary History",  href: "/employee/history",    icon: TrendingUp },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-950 rounded-xl transition-all border border-transparent hover:border-gray-100 dark:hover:border-zinc-900 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-red-50 dark:bg-zinc-950/30 text-red-500">
                      <link.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 group-hover:text-red-500 transition-colors">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, Calendar, MapPin, UserCheck, AlertCircle,
  ChevronLeft, ChevronRight, Loader2, Info
} from "lucide-react";
import { employeeSelfService } from "../../lib/services/employeeSelfService";
import { useToast } from "../../components/Toast";
import { useCurrentUser } from "../../lib/hooks/useCurrentUser";

export default function EmployeeAttendance() {
  const { user } = useCurrentUser();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(false);

  // Geolocation and Notes form
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Today's Status Check
  const [todayPunch, setTodayPunch] = useState({ check_in: null, check_out: null, status: "Not Clocked" });

  useEffect(() => {
    // Acquire geolocation
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation warning:", error.message);
          setLocationError(error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    const roleSlug = user?.role?.slug;
    const isEmployee = roleSlug === 'employee' || roleSlug === 'staff';
    if (user && isEmployee) {
      fetchData();
    }
  }, [page, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get monthly stats summary (handles backend 400 gracefully)
      const now = new Date();
      const stats = await employeeSelfService.getAttendanceSummary(
        now.getMonth() + 1,
        now.getFullYear()
      );
      setSummary(stats);

      // 2. Get attendance logs for current month (handles backend 400 gracefully → returns [])
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      const logs = await employeeSelfService.getAttendance(firstDay, lastDay);
      
      if (Array.isArray(logs)) {
        // Sort by date descending
        const sorted = [...logs].sort((a, b) =>
          new Date(b.check_in || b.date) - new Date(a.check_in || a.date)
        );

        // Paginate client-side
        const start = (page - 1) * limit;
        const paginated = sorted.slice(start, start + limit + 1);
        if (paginated.length > limit) {
          setHasMore(true);
          setRecords(paginated.slice(0, limit));
        } else {
          setHasMore(false);
          setRecords(paginated);
        }

        // 3. Find today's punch state
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLogs = logs.filter(log => {
          const logDate = log.date || (log.check_in ? log.check_in.split('T')[0] : '');
          return logDate === todayStr;
        });

        if (todayLogs.length > 0) {
          const sortedToday = [...todayLogs].sort((a, b) => new Date(a.check_in) - new Date(b.check_in));
          setTodayPunch({
            check_in: sortedToday[0].check_in,
            check_out: sortedToday[sortedToday.length - 1].check_out || null,
            status: sortedToday[sortedToday.length - 1].check_out ? 'Checked Out' : 'Checked In',
          });
        } else {
          setTodayPunch({ check_in: null, check_out: null, status: 'Not Clocked' });
        }
      } else {
        setRecords([]);
      }
    } catch (err) {
      showErrorToast(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };


  const handlePunch = async (type) => {
    setActionLoading(true);
    try {
      const payload = {
        employee_id: user?.id || user?.employee_id || 0,
        type: type,
        notes: notes || "",
        latitude: location?.latitude || null,
        longitude: location?.longitude || null
      };

      await employeeSelfService.submitAttendance(payload);
      showSuccessToast(`Successfully registered ${type === "check_in" ? "Check-In" : "Check-Out"}!`);
      setNotes("");
      setPage(1); // Reset page to 1 to reload fresh records
      fetchData();
    } catch (err) {
      showErrorToast(err.message || `Failed to register ${type}`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "--:--";
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const calculateHours = (inStr, outStr) => {
    if (!inStr || !outStr) return "--";
    try {
      const diffMs = new Date(outStr) - new Date(inStr);
      const hours = diffMs / (1000 * 60 * 60);
      return hours > 0 ? `${hours.toFixed(2)} hrs` : "--";
    } catch (e) {
      return "--";
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Clocking & Logs</h1>
        <p className="text-gray-500 text-sm">Clock-in, clock-out and view your daily work log summaries</p>
      </div>

      {/* Grid: Clocking Console & Monthly Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Clocking Console */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
            <Clock className="w-5 h-5 text-red-500" />
            Clock Console
          </h2>

          <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl space-y-3 text-sm border border-gray-100 dark:border-zinc-900">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-bold uppercase">Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                todayPunch.status === "Checked In" 
                  ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" 
                  : todayPunch.status === "Checked Out" 
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" 
                  : "bg-gray-100 text-gray-600 dark:bg-zinc-900 dark:text-gray-400"
              }`}>
                {todayPunch.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">First Check-In</p>
                <p className="font-semibold text-gray-800 dark:text-white mt-0.5">{formatTime(todayPunch.check_in)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Last Check-Out</p>
                <p className="font-semibold text-gray-800 dark:text-white mt-0.5">{formatTime(todayPunch.check_out)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500">Punch Note</label>
            <input
              type="text"
              placeholder="e.g. Remote working, branch visit..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {location ? (
            <div className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-bold">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{locationError ? "Location access disabled" : "Acquiring location coordinates..."}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              disabled={actionLoading || todayPunch.status === "Checked In"}
              onClick={() => handlePunch("check_in")}
              className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              Clock In
            </button>
            <button
              disabled={actionLoading || todayPunch.status !== "Checked In"}
              onClick={() => handlePunch("check_out")}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              Clock Out
            </button>
          </div>
        </div>

        {/* stats cards summary */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase">Present Days</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">{summary?.present_days || 0}</p>
            <p className="text-xs text-gray-400 mt-1">This month active</p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase">Total Logged Hours</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">{summary?.total_hours?.toFixed(1) || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Hours accumulated</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm col-span-2 flex items-start gap-3 text-sm text-gray-500 leading-relaxed">
            <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-800 dark:text-white text-xs">Late arrivals and early check-outs</p>
              <p className="text-xs text-gray-400 mt-1">
                Please make sure to log attendance shifts in accordance with your official schedule branch location policies. Check-ins after 9:15 AM are flagged as late by the automated system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">Attendance Log History</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-850 text-gray-500 font-semibold text-xs uppercase">
                    <th className="pb-3 pl-2">Date</th>
                    <th className="pb-3">Check In</th>
                    <th className="pb-3">Check Out</th>
                    <th className="pb-3">Hours</th>
                    <th className="pb-3">Location Pin</th>
                    <th className="pb-3 pr-2">Punch Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-850">
                  {records.map((log) => (
                    <tr key={log.id} className="text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 pl-2 font-bold">{formatDate(log.date || log.check_in)}</td>
                      <td className="py-3">{formatTime(log.check_in)}</td>
                      <td className="py-3">{formatTime(log.check_out)}</td>
                      <td className="py-3 font-semibold">{calculateHours(log.check_in, log.check_out)}</td>
                      <td className="py-3 text-xs text-gray-400">
                        {log.latitude && log.longitude ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                          </span>
                        ) : (
                          "No GPS Pin"
                        )}
                      </td>
                      <td className="py-3 text-xs text-gray-400 truncate max-w-xs pr-2">{log.notes || "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-4">
              <span className="text-xs text-gray-500 font-medium">Page {page}</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!hasMore}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-zinc-950/20 border border-dashed border-gray-200 dark:border-zinc-850 rounded-xl">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No attendance clock records found.</p>
          </div>
        )}
      </div>

    </div>
  );
}

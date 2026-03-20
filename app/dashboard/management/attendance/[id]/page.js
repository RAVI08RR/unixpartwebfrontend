"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { attendanceService } from "@/app/lib/services/attendanceService";
import { useToast } from "@/app/components/Toast";

export default function AttendanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [params.id]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Note: You'll need to add getById to attendanceService
      const data = await attendanceService.getAll();
      const record = data.find(a => a.id === parseInt(params.id));
      setAttendance(record);
    } catch (err) {
      error("Failed to load attendance details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading attendance details...</p>
        </div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Attendance record not found</p>
        <Link href="/dashboard/management/attendance" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Attendance
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/management/attendance" className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Details</h1>
            <p className="text-gray-500 text-sm">{attendance.employee_name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Attendance Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {attendance.employee_name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {attendance.date || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Check In</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {attendance.check_in || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Check Out</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {attendance.check_out || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mt-1 ${
              attendance.status === 'approved'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}>
              {attendance.status || 'pending'}
            </span>
          </div>
          {attendance.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
              <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                {attendance.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
